const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const { spamDetectionMiddleware, messageLoggingMiddleware } = require('./middlewares');
const {
  handleNewChatMembers,
  handleLeftChatMember,
  handleKick,
  handleBan,
  handleMute,
  handleUnmute,
  handlePin,
  handleUnpin,
  handleInfo,
  handleHelp,
  handleSetApiKey,
  handleCreateKey,
  handleSellerStats,
  handleMyKeys,
} = require('./handlers');

const bot = new Telegraf(BOT_TOKEN);

// Sử dụng middleware log tin nhắn
bot.use(messageLoggingMiddleware);

// Sử dụng middleware phát hiện spam
bot.use(spamDetectionMiddleware);

// Sự kiện chào mừng thành viên mới
bot.on('new_chat_members', handleNewChatMembers);

// Sự kiện tiễn thành viên rời nhóm
bot.on('left_chat_member', handleLeftChatMember);

// Các lệnh
bot.command('kick', handleKick);
bot.command('ban', handleBan);
bot.command('mute', handleMute);
bot.command('unmute', handleUnmute);
bot.command('pin', handlePin);
bot.command('unpin', handleUnpin);
bot.command('info', handleInfo);
bot.command('help', handleHelp);
bot.command('setapikey', handleSetApiKey);
bot.command('createkey', handleCreateKey);
bot.command('sellerstats', handleSellerStats);
bot.command('mykeys', handleMyKeys);

// Xử lý lỗi
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Có lỗi xảy ra. Vui lòng thử lại sau.');
});

// Khởi động bot
bot.launch({
  dropPendingUpdates: true,
});
console.log('Bot đã khởi động!');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));