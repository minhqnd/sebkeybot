const { isAdmin } = require('./utils');

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

**Lệnh dành cho Admin:**
- /kick - Kick thành viên (reply tin nhắn)
- /ban - Ban thành viên (reply tin nhắn)
- /mute [phút] - Mute thành viên (mặc định 60 phút)
- /unmute - Unmute thành viên (reply tin nhắn)
- /pin - Pin tin nhắn (reply tin nhắn)
- /unpin - Unpin tin nhắn (reply tin nhắn)

**Lệnh chung:**
- /info - Xem thông tin nhóm
- /help - Hiển thị danh sách lệnh

**Tính năng tự động:**
- Chào mừng thành viên mới
- Thông báo khi có thành viên rời nhóm
- Phát hiện và ngăn chặn spam
- Log tất cả tin nhắn của user

*Lưu ý: Bot cần quyền Admin trong nhóm để hoạt động.*
  `;
  ctx.replyWithMarkdown(helpText);
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
};