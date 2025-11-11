const { isAdmin } = require('./utils');
const { setSellerApiKey, getSellerApiKey, createActivationKey, formatKeyCode } = require('./seller');
const { getAllSellers, getKeysStats, getRecentKeys, getKeysBySeller } = require('./dataManager');

// Chào mừng thành viên mới
const handleNewChatMembers = async (ctx) => {
  const newMembers = ctx.message.new_chat_members;
  for (const member of newMembers) {
    await ctx.reply(`Chào mừng ${member.first_name} đến với nhóm! 🎉`);
  }
};

// Tiễn thành viên rời nhóm
const handleLeftChatMember = async (ctx) => {
  const leftMember = ctx.message.left_chat_member;
  await ctx.reply(`${leftMember.first_name} đã rời khỏi nhóm. 👋`);
};

// Lệnh /kick - Kick thành viên (chỉ admin)
const handleKick = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const userToKick = ctx.message.reply_to_message?.from;
  if (!userToKick) {
    return ctx.reply('Hãy reply tin nhắn của người cần kick.');
  }

  try {
    await ctx.kickChatMember(userToKick.id);
    await ctx.reply(`${userToKick.first_name} đã bị kick khỏi nhóm.`);
  } catch (error) {
    console.error('Error kicking member:', error);
    ctx.reply('Không thể kick thành viên này.');
  }
};

// Lệnh /ban - Ban thành viên (chỉ admin)
const handleBan = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const userToBan = ctx.message.reply_to_message?.from;
  if (!userToBan) {
    return ctx.reply('Hãy reply tin nhắn của người cần ban.');
  }

  try {
    await ctx.banChatMember(userToBan.id);
    await ctx.reply(`${userToBan.first_name} đã bị ban khỏi nhóm.`);
  } catch (error) {
    console.error('Error banning member:', error);
    ctx.reply('Không thể ban thành viên này.');
  }
};

// Lệnh /mute - Mute thành viên trong thời gian nhất định (chỉ admin)
const handleMute = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const args = ctx.message.text.split(' ').slice(1);
  const duration = parseInt(args[0]) || 60; // Mặc định 60 phút
  const userToMute = ctx.message.reply_to_message?.from;

  if (!userToMute) {
    return ctx.reply('Hãy reply tin nhắn của người cần mute.');
  }

  try {
    const untilDate = Math.floor(Date.now() / 1000) + (duration * 60);
    await ctx.restrictChatMember(userToMute.id, {
      can_send_messages: false,
      until_date: untilDate
    });
    await ctx.reply(`${userToMute.first_name} đã bị mute trong ${duration} phút.`);
  } catch (error) {
    console.error('Error muting member:', error);
    ctx.reply('Không thể mute thành viên này.');
  }
};

// Lệnh /unmute - Unmute thành viên (chỉ admin)
const handleUnmute = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const userToUnmute = ctx.message.reply_to_message?.from;
  if (!userToUnmute) {
    return ctx.reply('Hãy reply tin nhắn của người cần unmute.');
  }

  try {
    await ctx.restrictChatMember(userToUnmute.id, {
      can_send_messages: true
    });
    await ctx.reply(`${userToUnmute.first_name} đã được unmute.`);
  } catch (error) {
    console.error('Error unmuting member:', error);
    ctx.reply('Không thể unmute thành viên này.');
  }
};

// Lệnh /pin - Pin tin nhắn (chỉ admin)
const handlePin = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const messageToPin = ctx.message.reply_to_message;
  if (!messageToPin) {
    return ctx.reply('Hãy reply tin nhắn cần pin.');
  }

  try {
    await ctx.pinChatMessage(messageToPin.message_id);
    await ctx.reply('📌 Tin nhắn đã được pin.');
  } catch (error) {
    console.error('Error pinning message:', error);
    ctx.reply('Không thể pin tin nhắn này.');
  }
};

// Lệnh /unpin - Unpin tin nhắn (chỉ admin)
const handleUnpin = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const messageToUnpin = ctx.message.reply_to_message;
  if (!messageToUnpin) {
    return ctx.reply('Hãy reply tin nhắn cần unpin.');
  }

  try {
    await ctx.unpinChatMessage(messageToUnpin.message_id);
    await ctx.reply('📌 Tin nhắn đã được unpin.');
  } catch (error) {
    console.error('Error unpinning message:', error);
    ctx.reply('Không thể unpin tin nhắn này.');
  }
};

// Lệnh /info - Xem thông tin nhóm
const handleInfo = async (ctx) => {
  try {
    const chat = await ctx.getChat();
    const memberCount = await ctx.getChatMembersCount();
    
    const infoText = `
📊 **Thông tin nhóm:**

🏷️ Tên: ${chat.title}
👥 Số thành viên: ${memberCount}
🆔 ID nhóm: \`${chat.id}\`
📝 Mô tả: ${chat.description || 'Không có mô tả'}
🔗 Link mời: ${chat.invite_link || 'Không có link mời'}
    `;
    
    ctx.replyWithMarkdown(infoText);
  } catch (error) {
    console.error('Error getting chat info:', error);
    ctx.reply('Không thể lấy thông tin nhóm.');
  }
};

// Lệnh /help - Hiển thị danh sách lệnh
const handleHelp = (ctx) => {
  const helpText = `
🤖 **Bot Quản Lý Nhóm Telegram**

**Lệnh dành cho Super Admin:**
- /kick - Kick thành viên (reply tin nhắn)
- /ban - Ban thành viên (reply tin nhắn)
- /mute [phút] - Mute thành viên (mặc định 60 phút)
- /unmute - Unmute thành viên (reply tin nhắn)
- /pin - Pin tin nhắn (reply tin nhắn)
- /unpin - Unpin tin nhắn (reply tin nhắn)
- /setapikey [api_key] - Gán Seller Key cho seller (reply tin nhắn)

**Lệnh dành cho Seller:**
- /createkey [days] [note] - Tạo activation key

**Lệnh chung:**
- /info - Xem thông tin nhóm
- /help - Hiển thị danh sách lệnh

**Tính năng tự động:**
- Chào mừng thành viên mới
- Thông báo khi có thành viên rời nhóm
- Phát hiện và ngăn chặn spam
- Log tất cả tin nhắn của user

*Lưu ý: Chỉ Super Admin (được chỉ định trong .env) mới có thể sử dụng lệnh quản lý.*
  `;
  ctx.replyWithMarkdown(helpText);
};

// Lệnh /setapikey - Gán Seller Key cho seller (chỉ admin)
const handleSetApiKey = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  const args = ctx.message.text.split(' ').slice(1);
  const apiKey = args[0];
  const targetUser = ctx.message.reply_to_message?.from;

  if (!apiKey) {
    return ctx.reply('Vui lòng cung cấp API key: /setapikey <api_key>');
  }

  if (!targetUser) {
    return ctx.reply('Hãy reply tin nhắn của người cần gán Seller Key.');
  }

  try {
    setSellerApiKey(targetUser.id, apiKey, {
      first_name: targetUser.first_name,
      username: targetUser.username
    });
    await ctx.reply(`✅ Đã gán Seller Key cho ${targetUser.first_name} (@${targetUser.username || 'N/A'})\nAPI Key: ${apiKey.substring(0, 3)}***`);
    
    // Xóa tin nhắn lệnh để bảo mật API key
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (deleteError) {
      console.log('[SECURITY] Could not delete setapikey message (bot may not have delete permissions)');
    }
  } catch (error) {
    console.error('Error setting API key:', error);
    ctx.reply('Không thể gán Seller Key.');
  }
};

// Lệnh /createkey - Tạo activation key (cho seller)
const handleCreateKey = async (ctx) => {
  const userApiKey = getSellerApiKey(ctx.from.id);

  if (!userApiKey) {
    return ctx.reply('❌ Bạn chưa được gán Seller Key. Liên hệ admin để được cấp.');
  }

  const args = ctx.message.text.split(' ').slice(1);
  const activationDays = parseInt(args[0]);

  if (!activationDays || activationDays <= 0) {
    return ctx.reply('Vui lòng nhập số ngày kích hoạt: /createkey <days> [note]');
  }

  // Lấy note từ các argument còn lại
  const note = args.slice(1).join(' ') || '';

  try {
    // Hiển thị đang xử lý
    const processingMsg = await ctx.reply('⏳ Đang tạo activation key...');

    const result = await createActivationKey(userApiKey, activationDays, note, ctx.from.id);

    if (result.success) {
      const keyData = result.data;
      const maskedKeyCode = formatKeyCode(keyData.key_code);

      // Log đầy đủ cho admin/server
      console.log(`[SELLER] Key created successfully:`);
      console.log(`- Full Key Code: ${keyData.key_code}`);
      console.log(`- Seller: ${keyData.seller_name} (ID: ${keyData.seller_id})`);
      console.log(`- Days: ${keyData.activation_days}`);
      console.log(`- Expiry: ${keyData.key_expiry_date}`);
      console.log(`- Note: ${keyData.note || 'N/A'}`);

      // Gửi thông tin chung cho nhóm (ẩn key code)
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `✅ **Activation Key Created**\n\n` +
        `🔑 Key Code: \`${maskedKeyCode}\`\n` +
        `⏱️ Days: ${keyData.activation_days}\n` +
        `📅 Expiry: ${keyData.key_expiry_date}\n` +
        `📝 Note: ${keyData.note || 'N/A'}\n` +
        `👤 Seller: ${keyData.seller_name}\n\n` +
        `*Key đầy đủ đã được gửi riêng cho bạn!*`
      );

      // Gửi key đầy đủ riêng cho user
      await ctx.telegram.sendMessage(
        ctx.from.id,
        `🔐 **Your Full Activation Key**\n\n` +
        `🔑 Key Code: \`${keyData.key_code}\`\n` +
        `⏱️ Days: ${keyData.activation_days}\n` +
        `📅 Expiry: ${keyData.key_expiry_date}\n` +
        `📝 Note: ${keyData.note || 'N/A'}\n\n` +
        `⚠️ *Lưu trữ an toàn và không chia sẻ!*`
      );

    } else {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `❌ **Lỗi tạo Activation Key**\n\n${result.error}`
      );
    }

  } catch (error) {
    console.error('Error in handleCreateKey:', error);
    ctx.reply('Có lỗi xảy ra khi tạo key. Vui lòng thử lại sau.');
  }
};

// Lệnh /sellerstats - Xem thống kê sellers và keys (chỉ admin)
const handleSellerStats = async (ctx) => {
  if (!(await isAdmin(ctx))) {
    return ctx.reply('Bạn không có quyền sử dụng lệnh này.');
  }

  try {
    const stats = getKeysStats();
    const sellers = getAllSellers();
    const recentKeys = getRecentKeys(5);

    let message = `📊 **Thống kê Seller & Keys**\n\n`;
    message += `👥 Tổng sellers: ${stats.sellersCount}\n`;
    message += `🔑 Tổng keys đã tạo: ${stats.total}\n`;
    message += `📈 Keys 24h qua: ${stats.last24h}\n`;
    message += `📈 Keys 7 ngày qua: ${stats.last7d}\n\n`;

    if (sellers.length > 0) {
      message += `**Danh sách Sellers:**\n`;
      sellers.forEach((seller, index) => {
        const keysCount = getKeysBySeller(seller.userId).length;
        message += `${index + 1}. ${seller.name} (@${seller.username || 'N/A'}) - ${keysCount} keys\n`;
      });
      message += `\n`;
    }

    if (recentKeys.length > 0) {
      message += `**Keys gần đây:**\n`;
      recentKeys.forEach((key, index) => {
        const maskedCode = formatKeyCode(key.keyCode);
        message += `${index + 1}. \`${maskedCode}\` - ${key.activationDays} ngày - ${key.sellerName}\n`;
      });
    }

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error('Error in handleSellerStats:', error);
    ctx.reply('Có lỗi xảy ra khi lấy thống kê.');
  }
};

// Lệnh /mykeys - Xem lịch sử keys đã tạo (cho seller)
const handleMyKeys = async (ctx) => {
  const userApiKey = getSellerApiKey(ctx.from.id);

  if (!userApiKey) {
    return ctx.reply('❌ Bạn chưa được gán Seller Key. Liên hệ admin để được cấp.');
  }

  try {
    const userKeys = getKeysBySeller(ctx.from.id);

    if (userKeys.length === 0) {
      return ctx.reply('📭 Bạn chưa tạo key nào.');
    }

    let message = `🔑 **Lịch sử Keys đã tạo**\n\n`;
    message += `📊 Tổng số: ${userKeys.length}\n\n`;

    // Hiển thị 10 keys gần nhất
    const recentKeys = userKeys.slice(-10).reverse();
    recentKeys.forEach((key, index) => {
      const maskedCode = formatKeyCode(key.keyCode);
      const createdDate = new Date(key.createdAtTimestamp).toLocaleDateString('vi-VN');
      message += `${index + 1}. \`${maskedCode}\` - ${key.activationDays} ngày\n`;
      message += `   📅 ${createdDate} - ${key.note || 'Không có ghi chú'}\n\n`;
    });

    // Gửi riêng tư vì chứa thông tin nhạy cảm
    await ctx.telegram.sendMessage(ctx.from.id, message);
    await ctx.reply('📩 Đã gửi lịch sử keys vào tin nhắn riêng!');

  } catch (error) {
    console.error('Error in handleMyKeys:', error);
    ctx.reply('Có lỗi xảy ra khi lấy lịch sử keys.');
  }
};

module.exports = {
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
};