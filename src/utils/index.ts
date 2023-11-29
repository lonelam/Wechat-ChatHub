export function getBeijingTime() {
  // 创建一个新的 Date 对象，它表示当前时间
  const now = new Date();

  // 使用 toLocaleString 方法并指定 "zh-CN" 作为地区和 UTC+8 作为时区
  const beijingTime = now.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
  });

  return beijingTime;
}
