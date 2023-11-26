import { WechatyInterface } from 'wechaty/impls';

export async function BotToJson(bot: WechatyInterface) {
  return {
    name: bot.name(),
    id: bot.id,
    puppet: bot.puppet.constructor.name,
    puppetOptions: bot.puppet.options,
    state: bot.state,
    wechatyVersion: bot.version(),
    currentUser: bot.isLoggedIn ? bot.currentUser : null,
    isLoggedIn: bot.isLoggedIn,
    authQrCode: bot.authQrCode,
  };
}
