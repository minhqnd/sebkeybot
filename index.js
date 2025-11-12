require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs').promises;
const KeyManager = require('./modules/keyManager');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const keyManager = new KeyManager(process.env.SECRET);

// Load data from data.json
const loadData = async () => {
  try {
    const data = await fs.readFile('data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {}; // Return empty object if file doesn't exist
  }
};

// Save data to data.json
const saveData = async (data) => {
  await fs.writeFile('data.json', JSON.stringify(data, null, 2));
};

// Middleware to log messages
bot.use((ctx, next) => {
  if (ctx.message) {
    const user = ctx.from;
    const chat = ctx.chat;
    const messageText = ctx.message.text || '[Non-text message]';
    console.log(`[${new Date().toISOString()}] User: ${user.first_name} (@${user.username || 'unknown'}) ID: ${user.id} in Chat: ${chat.title || chat.type} (${chat.id}) - Message: ${messageText}`);
  }
  return next();
});

// Middleware to check if user is admin
const isAdmin = async (ctx) => {
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return member.status === 'administrator' || member.status === 'creator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if user is authorized admin for /setapi
const isAuthorizedAdmin = (userId) => {
  const adminIds = process.env.ADMIN_IDS?.split(',').map(id => id.trim()) || [];
  return adminIds.includes(userId.toString());
};

// Welcome new members
bot.on('new_chat_members', async (ctx) => {
  const newMembers = ctx.message.new_chat_members;
  for (const member of newMembers) {
    await ctx.reply(`Chào mừng <b>${member.first_name}</b> đến với nhóm! 🎉`, { parse_mode: 'HTML' });
  }
});

// Goodbye message for left members
bot.on('left_chat_member', async (ctx) => {
  const leftMember = ctx.message.left_chat_member;
  await ctx.reply(`<b>${leftMember.first_name}</b> đã rời khỏi nhóm. 😢`, { parse_mode: 'HTML' });
});

// Ban command (admin only)
bot.command('ban', async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Hãy reply tin nhắn của người cần ban.', { parse_mode: 'HTML' });
  }

  try {
    await ctx.banChatMember(userId);
    await ctx.reply('Đã ban người dùng.', { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error banning user:', error);
    await ctx.reply('Không thể ban người dùng này.', { parse_mode: 'HTML' });
  }
});

// Kick command (admin only)
bot.command('kick', async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Hãy reply tin nhắn của người cần kick.', { parse_mode: 'HTML' });
  }

  try {
    await ctx.kickChatMember(userId);
    await ctx.reply('Đã kick người dùng.', { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error kicking user:', error);
    await ctx.reply('Không thể kick người dùng này.', { parse_mode: 'HTML' });
  }
});

// Unban command (admin only)
bot.command('unban', async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Hãy reply tin nhắn của người cần unban.', { parse_mode: 'HTML' });
  }

  try {
    await ctx.unbanChatMember(userId);
    await ctx.reply('Đã unban người dùng.', { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    await ctx.reply('Không thể unban người dùng này.', { parse_mode: 'HTML' });
  }
});

// Clear message command (admin only)
bot.command('clear', async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const args = ctx.message.text.split(' ').slice(1);

  if (args.length === 0) {
    // Nếu không có tham số, reply tin nhắn để xóa
    const messageId = ctx.message.reply_to_message?.message_id;
    if (!messageId) {
      return ctx.reply('Hãy reply tin nhắn cần xóa hoặc chỉ định số lượng. Ví dụ: /clear 5', { parse_mode: 'HTML' });
    }

    try {
      await ctx.deleteMessage(messageId);
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (error) {
      console.error('Error deleting message:', error);
      await ctx.reply('Không thể xóa tin nhắn này.', { parse_mode: 'HTML' });
    }
    return;
  }

  // Có tham số, xóa số tin nhắn gần nhất
  const count = parseInt(args[0]);
  if (isNaN(count) || count <= 0 || count > 100) {
    return ctx.reply('Số lượng không hợp lệ. Tối đa 100.', { parse_mode: 'HTML' });
  }

  try {
    const currentMessageId = ctx.message.message_id;
    const messageIds = [];
    for (let i = 1; i <= count; i++) {
      messageIds.push(currentMessageId - i);
    }
    await ctx.telegram.deleteMessages(ctx.chat.id, messageIds);
    await ctx.deleteMessage(ctx.message.message_id);
  } catch (error) {
    console.error('Error deleting messages:', error);
    await ctx.reply('Không thể xóa tin nhắn.', { parse_mode: 'HTML' });
  }
});

// Set API key command (authorized admin only)
bot.command('setapi', async (ctx) => {
  if (!isAuthorizedAdmin(ctx.from.id)) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const args = ctx.message.text.split(' ').slice(1);
  const apiKey = args.join(' ');
  const userId = ctx.message.reply_to_message?.from?.id;

  if (!userId) {
    return ctx.reply('Hãy reply tin nhắn của người cần set API key.', { parse_mode: 'HTML' });
  }

  if (!apiKey) {
    return ctx.reply('Hãy cung cấp API key sau lệnh /setapi.', { parse_mode: 'HTML' });
  }

  try {
    const data = await loadData();
    data[userId] = { apiKey };
    await saveData(data);
    
    const username = ctx.message.reply_to_message.from.username || 'unknown';
    const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}` : '****';
    await ctx.reply(`Đã set API key cho <b>@${username}</b> (ID: ${userId})\nKey: <code>${maskedKey}</code>`, { parse_mode: 'HTML' });
    
    // Delete the command message to hide the API key
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (deleteError) {
      console.log('Could not delete message (bot may not have delete permissions):', deleteError.message);
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    await ctx.reply('Không thể lưu API key.', { parse_mode: 'HTML' });
  }
});

// Create activation key command
bot.command('key', async (ctx) => {
  console.log(`Channel check: ctx.chat.id=${ctx.chat.id}, CHANNEL_ID=${process.env.CHANNEL_ID}`);
  // Check if command is used in the allowed channel
  if (ctx.chat.id.toString() !== process.env.CHANNEL_ID?.toString()) {
    console.log('Command blocked: not in allowed channel');
    return ctx.reply('Lệnh này chỉ có thể sử dụng trong channel được chỉ định.', { parse_mode: 'HTML' });
  }
  console.log('Command allowed: in allowed channel');

  const userId = ctx.from.id;
  const username = ctx.from.username || 'unknown';
  const args = ctx.message.text.split(' ').slice(1);

  try {
    // Load user data to get API key
    const data = await loadData();
    const userData = data[userId];

    if (!userData || !userData.apiKey) {
      return ctx.reply('Bạn chưa có API key. Hãy liên hệ admin để set API key.', { parse_mode: 'HTML' });
    }

    const result = await keyManager.createKey(userData.apiKey, userId, username, args, ctx.from.first_name);

    // Send masked key to server
    const serverMessage = keyManager.formatServerMessage(result);
    await ctx.reply(serverMessage, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });

    // Send full key to user privately
    const userMessage = keyManager.formatUserMessage(result);
    await ctx.telegram.sendMessage(userId, userMessage, { parse_mode: 'HTML' });

  } catch (error) {
    console.error('Error creating key:', error);
    await ctx.reply(`Không thể tạo key: ${error.message}`, { parse_mode: 'HTML' });
  }
});

// Check activation key command
bot.command('check', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const keyCode = args.join(' ');

  if (!keyCode) {
    return ctx.reply('Hãy cung cấp key code để kiểm tra. Ví dụ: /check ABC123', { parse_mode: 'HTML' });
  }

  try {
    const result = await keyManager.checkKey(keyCode);
    const message = keyManager.formatCheckMessage(result);
    
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      // In group: show masked key and delete command message
      const maskedMessage = keyManager.formatMaskedCheckMessage(result);
      await ctx.reply(maskedMessage, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
      
      // Delete the command message
      try {
        await ctx.deleteMessage(ctx.message.message_id);
      } catch (deleteError) {
        console.log('Could not delete message (bot may not have delete permissions):', deleteError.message);
      }
    } else {
      // In private: show full key
      await ctx.reply(message, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
    }
  } catch (error) {
    console.error('Error checking key:', error);
    await ctx.reply(`Không thể kiểm tra key: ${error.message}`, { parse_mode: 'HTML' });
  }
});

// Statistic command (authorized admins only)
bot.command('statistic', async (ctx) => {
  if (!isAuthorizedAdmin(ctx.from.id)) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.', { parse_mode: 'HTML' });
  }

  const args = ctx.message.text.split(' ').slice(1);

  if (args.length === 0) {
    // Gửi tin nhắn riêng với thống kê đầy đủ
    try {
      const result = await keyManager.getStatistics(30, null); // Mặc định 30 ngày, tất cả sellers
      const message = keyManager.formatStatisticsMessage(result);
      await ctx.telegram.sendMessage(ctx.from.id, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      await ctx.telegram.sendMessage(ctx.from.id, `Không thể lấy thống kê: ${error.message}`, { parse_mode: 'HTML' });
    }
    return;
  }

  // Có tham số: /statistic days [sellerId]
  const days = parseInt(args[0]);
  const sellerId = args.length > 1 ? parseInt(args[1]) : null;

  if (isNaN(days) || days <= 0) {
    return ctx.reply('Số ngày không hợp lệ. Ví dụ: /statistic 30 [seller_id]', { parse_mode: 'HTML' });
  }

  if (sellerId !== null && isNaN(sellerId)) {
    return ctx.reply('Seller ID không hợp lệ. Ví dụ: /statistic 30 123', { parse_mode: 'HTML' });
  }

  // Gửi trong group
  try {
    const result = await keyManager.getStatistics(days, sellerId);
    const message = keyManager.formatStatisticsMessage(result);
    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    await ctx.reply(`Không thể lấy thống kê: ${error.message}`, { parse_mode: 'HTML' });
  }
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply(`<b>Các lệnh có sẵn:</b>
/help - Hiển thị trợ giúp
/setapi [key] - Set API key cho user (reply tin nhắn, chỉ admin được phép)
/key [số ngày|ky] - Tạo activation key
/check [key] - Kiểm tra activation key`, { parse_mode: 'HTML' });
});

// Start command
bot.start((ctx) => {
  const groupUrl = 'https://t.me/+aGEVtsQDduoyYjVl';
  const message = `<b>stromez key!</b>\n\nSeller tham gia nhóm và vào support nhắn với admin để được cấp quyền tạo key:`;
  return ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: 'Tham gia nhóm', url: groupUrl }]]
    }
  });
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Có lỗi xảy ra. Vui lòng thử lại sau.', { parse_mode: 'HTML' });
});

// Set bot commands for suggestions
bot.telegram.setMyCommands([
  { command: 'start', description: 'Khởi động bot' },
  { command: 'help', description: 'Hiển thị trợ giúp' },
  // { command: 'ban', description: 'Ban người dùng (reply tin nhắn)' },
  // { command: 'kick', description: 'Kick người dùng (reply tin nhắn)' },
  // { command: 'unban', description: 'Unban người dùng (reply tin nhắn)' },
  { command: 'clear', description: 'Xóa tin nhắn [số lượng]' },
  { command: 'setapi', description: 'Set API key cho user (chỉ admin)' },
  { command: 'key', description: 'Tạo activation key [số ngày|ky]' },
  { command: 'check', description: 'Kiểm tra activation key [key]' },
  { command: 'statistic', description: 'Lấy thống kê keys [days seller_id]' }
]);

// Launch the bot
bot.launch();
console.log('Bot đã khởi động!');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
