import {
  ForbiddenException,
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
import type * as PUPPET from 'wechaty-puppet';
import { PadLocalToken } from 'src/chatdb/entities/pad-local-token.entity';

// 5分钟离线就转给其他人
const BOT_TIMEOUT_MS = 1000 * 60 * 5;
@Injectable()
export class WechatService implements OnModuleDestroy {
  activeBots: WechatyInterface[] = [];
  hangingBots: WechatyInterface[] = [];
  botMap: Map<string, WechatyInterface> = new Map();
  botOwner: Map<string, number> = new Map();
  botOwnTime: Map<string, number> = new Map();
  constructor(
    private padLocalToken: PadLocalTokenService,
    private wechatAccount: WechatAccountService,
    private chatSession: ChatSessionService,
    private friendService: FriendService,
    private openAIService: OpenAIService,
  ) {
    if (process.env.NODE_ENV === 'development') {
      this.padLocalToken.cleanPadLocalOccupations();
    } else {
      this.padLocalToken.getAllOccupiedToken().then((token) => {
        token.forEach((t) => {
          if (t.isActive && t.ownerId !== -1) {
            this.startWechatBotByToken(t, t.ownerId).catch(console.error);
          }
        });
      });
    }
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

  getBot(botId: string, userId: number) {
    const bot = this.botMap.get(botId);
    if (!bot) {
      return null;
    }
    // 说明已经超时，被另一个用户争用了，报错让返回
    if (this.botOwner.get(botId) !== userId) {
      return null;
    }

    this.botOwnTime.set(botId, Date.now());
    this.botOwner.set(botId, userId);
    return bot;
  }

  async startWechatBotByToken(
    padLocalTokenEntity: PadLocalToken,
    userId: number,
  ) {
    return new Promise<{ qrcode: string; bot: WechatyInterface }>(
      async (resolve, reject) => {
        const { token, puppetType } = padLocalTokenEntity;
        const puppetOptions: PUPPET.PuppetOptions = {};
        if (puppetType === 'wechaty-puppet-wechat') {
          puppetOptions.uos = true;
        } else {
          puppetOptions.token = token;
        }
        const buildOptions: WechatyOptions = {
          name: `chathub-${padLocalTokenEntity.id}`,
          puppet: puppetType as any,
          puppetOptions,
        };
        const bot = WechatyBuilder.build(buildOptions);

        this.botMap.set(bot.id, bot);
        this.botOwner.set(bot.id, userId);
        this.botOwnTime.set(bot.id, Date.now());
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
          try {
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

            const accountOwner = this.botOwner.get(bot.id);
            const account = await this.wechatAccount.getOrCreateWechatAccount(
              user.id,
              await user.name(),
              avatarUrl,
              accountOwner || -1,
            );

            if (account) {
              this.wechatAccount.bindAccountToToken(user.id, token);
            }
          } catch (error) {
            console.error('error ', error);
          }
        });

        bot.on('logout', async (user) => {
          console.log(`${user} logout`);
          if (this.activeBots.includes(bot)) {
            this.activeBots.splice(this.activeBots.indexOf(bot), 1);
          }
          if (this.wechatAccount) {
            this.wechatAccount.unbindAccountFromToken(user.id, token);
          }
          this.hangingBots.push(bot);
        });
        bot.on('message', async (msg) => {
          try {
            const isText = msg.type() === bot.Message.Type.Text;
            if (!isText) {
              // for other message types, ignore
              console.log('ignore non-text message ' + msg.id);
              return;
            }

            const listener = msg.listener();
            const talker = msg.talker();
            if (!listener) {
              // room message, ignore
              console.log(
                'ignore room message',
                msg.id,
                'from',
                msg.room()?.id,
              );
              return;
            }

            if (!talker) {
              // room message, ignore
              // console.log('ignore room message', msg);
              return;
            }

            if (msg.self()) {
              // TODO: 额外处理自己发过来的命令
            }

            const chatter = msg.self() ? listener : talker;
            const selfContact = msg.self() ? talker : listener;
            const chatterAlias = (await chatter.alias()) || chatter.name();
            if (!chatter) {
              throw new InternalServerErrorException('chatter not found');
            }
            if (!selfContact) {
              throw new InternalServerErrorException('selfContact not found');
            }

            const botOwnerId = this.botOwner.get(bot.id) || -1;

            const chatterInfo =
              await this.friendService.getOrCreateFriendByFriendId(
                chatter.id,
                chatter.name(),
                chatter.gender(),
                chatterAlias,
                chatter.payload?.avatar || '',
                botOwnerId,
              );

            const conversationId = chatter.id;
            let chatSession = await this.chatSession.getOrCreateChatSession(
              selfContact.id,
              conversationId,
              chatterInfo,
              botOwnerId,
            );
            const historyMessage =
              await this.chatSession.addMessageToChatSession(
                conversationId,
                selfContact.id,
                msg.type(),
                msg.text(),
                talker.id,
                listener.id,
                bot.id,
                msg.date(),
                botOwnerId,
              );
            chatSession = historyMessage.chatSession;
            // 自己的消息就不要尝试自动回复了
            if (!msg.self()) {
              const completionPromise =
                this.openAIService.generateCompletion(chatSession);

              if (chatSession.hasAutoReplyFeature) {
                setTimeout(
                  async () => {
                    try {
                      console.log(
                        `Start fetching completion for the msg "${msg
                          .text()
                          .slice(0, 20)}" from ${chatterAlias}`,
                      );
                      const completion = await completionPromise;
                      const needReply =
                        await this.chatSession.checkChatSessionNeedReplySince(
                          chatSession.id,
                          msg.date(),
                          selfContact.id,
                          historyMessage.id,
                        );
                      if (needReply) {
                        if (completion) {
                          console.log(
                            `AutoReply:  ${completion} => ${chatterAlias}`,
                          );
                          msg.say(completion);
                        }
                      }
                    } catch (err) {
                      console.error(`AutoReply Completion error: ${err}`);
                    }
                  },
                  chatSession.hasFastAutoReplyFeature
                    ? 0
                    : (1 * 60 + 30 * Math.random()) * 1000,
                );
              }
            }
          } catch (err) {
            console.error(`Handling message error: ${err}`);
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

  async startWechatBot(userId: number) {
    if (this.hangingBots.length > 0) {
      for (let i = 0; i < this.hangingBots.length; i++) {
        const bot = this.hangingBots[i];
        if (bot.authQrCode) {
          const previousOwnTime = this.botOwnTime.get(bot.id) || 0;
          if (
            this.botOwner.get(bot.id) === userId ||
            previousOwnTime + BOT_TIMEOUT_MS < Date.now()
          ) {
            this.botOwnTime.set(bot.id, Date.now());
            this.botOwner.set(bot.id, userId);
            return {
              bot,
              qrcode: bot.authQrCode,
            };
          }
        }
      }
    }

    const token = await this.padLocalToken.getUnassignedToken();
    if (!token) {
      throw new HttpException(
        'No available pad local token',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    console.log('token', token);
    return this.startWechatBotByToken(token, userId);
  }

  async getAccountWithLoginState(wechatId: string, userId: number) {
    const account =
      await this.wechatAccount.getWechatAccountByWechatId(wechatId);
    if (!account) {
      return null;
    }
    // owner被抢走了，必须重新登录，此处视作离线，因为不会再发消息给他了
    if (account.ownerId !== userId) {
      return {
        ...account,
        isLogin: false,
      };
    }

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
  }

  async getAllAccountsWithLoginState(ownerId: number) {
    const accounts: (WechatAccount & { isLogin: boolean })[] = (
      await this.wechatAccount.getOwnWechatAccount(ownerId)
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

  async gptCompleteForActiveMessageBySessionId(sessionId: number) {
    let chatSession = await this.chatSession.getChatSessionById(sessionId);
    if (!chatSession) {
      throw new NotFoundException(`ChatSession not found by id: ${sessionId}`);
    }
    const completion = await this.openAIService.generateCompletion(chatSession);
    if (completion) {
      chatSession = await this.chatSession.updateActiveMessage(
        chatSession,
        completion,
      );
      console.log(
        `chat updated ["${completion.slice(
          0,
          100,
        )}"] for chat: ${JSON.stringify(chatSession.friends)}`,
      );
    }
    return chatSession;
  }

  async sayToListener(
    text: string,
    listenerId: string,
    wechatId: string,
    userId: number,
  ) {
    const bot = this.activeBots.find((b) => b.currentUser.id === wechatId);
    if (!bot) {
      throw new NotFoundException(`Bot not found by wechatID: ${wechatId}`);
    }
    if (this.botOwner.get(bot.id) !== userId) {
      throw new ForbiddenException(
        `Bot not authorized to say to listener: ${listenerId}`,
      );
    }
    return ((bot.Contact as any).load(listenerId) as ContactInterface).say(
      text,
    );
  }

  async adminLogout(wechatId: string) {
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

  async logout(wechatId: string, userId: number) {
    const logoutBot = this.activeBots.find(
      (b) => b.currentUser.id === wechatId,
    );
    if (!logoutBot) {
      throw new NotFoundException(`Bot not found by wechatID: ${wechatId}`);
    }
    if (this.botOwner.get(logoutBot.id) !== userId) {
      throw new ForbiddenException(`Bot not owned by user with id: ${userId}`);
    }
    this.activeBots = this.activeBots.filter(
      (b) => b.currentUser.id !== wechatId,
    );
    this.botMap.delete(logoutBot.id);
    await logoutBot.logout();
    this.hangingBots.push(logoutBot);
  }
}
