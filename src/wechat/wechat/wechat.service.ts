import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
import { WechatAccount } from 'src/chatdb/entities/wechat-account.entity';
import { FriendService } from 'src/chatdb/friend/friend.service';
import { PadLocalTokenService } from 'src/chatdb/pad-local-token/pad-local-token.service';
import { WechatAccountService } from 'src/chatdb/wechat-account/wechat-account.service';
import { OpenAIService } from 'src/gpt/openai/openai.service';
import { WechatyBuilder, WechatyOptions } from 'wechaty';
import { ContactInterface, WechatyInterface } from 'wechaty/impls';

@Injectable()
export class WechatService implements OnModuleDestroy {
  activeBots: WechatyInterface[] = [];
  hangingBots: WechatyInterface[] = [];
  botMap: Map<string, WechatyInterface> = new Map();
  constructor(
    private padLocalToken: PadLocalTokenService,
    private wechatAccount: WechatAccountService,
    private chatSession: ChatSessionService,
    private friendService: FriendService,
    private openAIService: OpenAIService,
  ) {
    this.padLocalToken.cleanPadLocalOccupations();
  }

  async onModuleDestroy() {
    console.log('onModuleDestroy, stoping bots...');
    for (const bot of this.hangingBots) {
      await bot.stop();
    }
    for (const bot of this.activeBots) {
      await bot.stop();
    }
  }

  getBot(botId: string) {
    return this.botMap.get(botId);
  }

  async startWechatBot() {
    if (this.hangingBots.length > 0) {
      for (let i = 0; i < this.hangingBots.length; i++) {
        if (this.hangingBots[i].authQrCode) {
          return {
            bot: this.hangingBots[i],
            qrcode: this.hangingBots[i].authQrCode,
          };
        }
      }
    }

    return new Promise<{ qrcode: string; bot: WechatyInterface }>(
      async (resolve, reject) => {
        const token = await this.padLocalToken.getUnassignedToken();
        if (!token) {
          reject(
            new HttpException(
              'No available pad local token',
              HttpStatus.TOO_MANY_REQUESTS,
            ),
          );
          return;
        }
        console.log('token', token);
        const buildOptions: WechatyOptions = {
          name: 'run/Chathub',
          puppet: 'wechaty-puppet-padlocal',
          puppetOptions: {
            token: token.token,
          },
        };
        const bot = WechatyBuilder.build(buildOptions);

        this.botMap.set(bot.id, bot);
        this.hangingBots.push(bot);
        let finished = false;
        const onScan = (qrcode: string) => {
          if (finished) {
            return;
          }
          finished = true;
          resolve({
            qrcode,
            bot,
          });
        };
        const onTimeout = () => {
          if (finished) {
            return;
          }
          finished = true;
          bot.off('scan', onScan);
          reject(new Error('Scan QRCode timeout'));
        };
        bot.on('scan', onScan);
        setTimeout(onTimeout, 1 * 60 * 1000);
        bot.on('login', async (user) => {
          console.log(`${user} Login success, creating account...`);
          finished = true;
          resolve({
            qrcode: '',
            bot,
          });
          const currentIndex = this.hangingBots.indexOf(bot);
          if (currentIndex === -1) {
            console.log(`Bot ${bot.id} not found in hangingBots`);
          } else {
            this.hangingBots.splice(currentIndex, 1);
            this.activeBots.push(bot);
          }

          const avatarUrl = user.payload?.avatar || '';
          // if (!avatarUrl) {
          //   console.log(
          //     `no normal avatar URL found, add data url for fallback...`,
          //   );
          //   avatarUrl = await (await user.avatar()).toDataURL();
          // }

          const account = await this.wechatAccount.getOrCreateWechatAccount(
            user.id,
            await user.name(),
            avatarUrl,
          );
          if (account) {
            this.wechatAccount.bindAccountToToken(user.id, token.token);
          }
        });
        bot.on('logout', async (user) => {
          console.log(`${user} logout`);
          if (this.activeBots.includes(bot)) {
            this.activeBots.splice(this.activeBots.indexOf(bot), 1);
          }
          if (this.wechatAccount) {
            this.wechatAccount.unbindAccountFromToken(user.id, token.token);
          }
          this.hangingBots.push(bot);
        });
        bot.on('message', async (msg) => {
          const isText = msg.type() === bot.Message.Type.Text;
          if (!isText) {
            // for other message types, ignore
            console.log('ignore message type:' + msg.type(), msg);
            return;
          }

          const listener = msg.listener();
          const talker = msg.talker();
          if (!listener) {
            // room message, ignore
            console.log('ignore room message', msg);
            return;
          }

          if (!talker) {
            // room message, ignore
            console.log('ignore room message', msg);
            return;
          }

          if (msg.self()) {
            // TODO: 额外处理自己发过来的命令
          }

          const chatter = msg.self() ? listener : talker;
          const selfContact = msg.self() ? talker : listener;
          if (!chatter) {
            throw new InternalServerErrorException('chatter not found');
          }
          if (!selfContact) {
            throw new InternalServerErrorException('selfContact not found');
          }

          const chatterInfo =
            await this.friendService.getOrCreateFriendByFriendId(
              chatter.id,
              chatter.name(),
              chatter.gender(),
              (await chatter.alias()) || chatter.name(),
              chatter.payload?.avatar || '',
            );
          const conversationId = chatter.id;
          let chatSession = await this.chatSession.getOrCreateChatSession(
            selfContact.id,
            conversationId,
            chatterInfo,
          );
          chatSession = await this.chatSession.addMessageToChatSession(
            conversationId,
            selfContact.id,
            msg.type(),
            msg.text(),
            talker.id,
            listener.id,
            bot.id,
            msg.date(),
          );
          // 自己的消息就不要尝试自动回复了
          if (!msg.self()) {
            const completionPromise =
              this.openAIService.generateCompletion(chatSession);

            if (chatSession.hasAutoReplyFeature) {
              setTimeout(
                async () => {
                  const isReplied =
                    await this.chatSession.checkChatSessionIsRepliedSince(
                      chatSession.id,
                      msg.date(),
                      selfContact.id,
                    );
                  if (!isReplied) {
                    const completion = await completionPromise;
                    if (completion) {
                      msg.say(completion);
                    }
                  }
                },
                (1 * 60 + 30 * Math.random()) * 1000,
              );
            }
          }
        });
        bot.on('error', (err) => {
          console.log(`bot ${bot.id} error: ${err}, Exiting...`);
        });
        console.log(`bot ${bot.id} starting ...`);

        await bot.start();
        console.log(`bot ${bot.id} started ...`);
      },
    );
  }

  async getAllAccountsWithLoginState() {
    const accounts: (WechatAccount & { isLogin: boolean })[] = (
      await this.wechatAccount.getAllWechatAccounts()
    ).map((account) => {
      for (const bot of this.activeBots) {
        if (bot.isLoggedIn && bot.currentUser.id === account.wechatId) {
          return {
            ...account,
            isLogin: true,
          };
        }
      }
      return {
        ...account,
        isLogin: false,
      };
    });
    return accounts;
  }

  async sayToListener(text: string, listenerId: string, wechatId: string) {
    const bot = this.activeBots.find((b) => b.currentUser.id === wechatId);
    if (!bot) {
      throw new NotFoundException(`Bot not found by wechatID: ${wechatId}`);
    }
    return ((bot.Contact as any).load(listenerId) as ContactInterface).say(
      text,
    );
  }

  async logout(wechatId: string) {
    const logoutBot = this.activeBots.find(
      (b) => b.currentUser.id === wechatId,
    );
    if (!logoutBot) {
      throw new NotFoundException(`Bot not found by wechatID: ${wechatId}`);
    }
    this.activeBots = this.activeBots.filter(
      (b) => b.currentUser.id !== wechatId,
    );
    this.botMap.delete(logoutBot.id);
    await logoutBot.logout();
    this.hangingBots.push(logoutBot);
  }
}
