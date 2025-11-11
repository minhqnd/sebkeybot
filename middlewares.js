// Map để theo dõi tin nhắn gần đây của user (để phát hiện spam)
const userMessageCount = new Map();

// Hàm kiểm tra spam (nhiều tin nhắn trong thời gian ngắn)
const checkSpam = (userId) => {
  const now = Date.now();
  const userMessages = userMessageCount.get(userId) || [];
  
  // Lọc tin nhắn trong 10 giây qua
  const recentMessages = userMessages.filter(time => now - time < 10000);
  
  userMessageCount.set(userId, recentMessages);
  
  // Nếu có hơn 5 tin nhắn trong 10 giây, coi là spam
  return recentMessages.length >= 5;
};

// Middleware phát hiện spam
const spamDetectionMiddleware = async (ctx, next) => {
  if (ctx.message && ctx.message.from) {
    const userId = ctx.message.from.id;
    const userMessages = userMessageCount.get(userId) || [];
    userMessages.push(Date.now());
    userMessageCount.set(userId, userMessages);
    
    if (checkSpam(userId)) {
      try {
        await ctx.deleteMessage(ctx.message.message_id);
        await ctx.reply(`⚠️ ${ctx.message.from.first_name} bị phát hiện spam!`);
        // Có thể mute tạm thời
        await ctx.restrictChatMember(userId, {
          can_send_messages: false,
          until_date: Math.floor(Date.now() / 1000) + 300 // Mute 5 phút
        });
        return; // Không tiếp tục xử lý
      } catch (error) {
        console.error('Error handling spam:', error);
      }
    }
  }
  await next();
};

// Middleware log tin nhắn
const messageLoggingMiddleware = async (ctx, next) => {
  if (ctx.message && ctx.message.from) {
    const timestamp = new Date().toISOString();
    const userId = ctx.message.from.id;
    const username = ctx.message.from.username || 'N/A';
    const firstName = ctx.message.from.first_name || 'N/A';
    const lastName = ctx.message.from.last_name || '';
    const chatId = ctx.chat.id;
    const chatTitle = ctx.chat.title || 'Private Chat';
    const messageText = ctx.message.text || '[Non-text message]';
    const messageType = ctx.message.photo ? 'photo' : 
                       ctx.message.document ? 'document' : 
                       ctx.message.sticker ? 'sticker' : 
                       ctx.message.voice ? 'voice' : 'text';

    console.log(`[${timestamp}] [${chatTitle}] ${firstName} ${lastName} (@${username}) [${userId}]: ${messageText} (${messageType})`);
  }
  await next();
};

module.exports = {
  spamDetectionMiddleware,
  messageLoggingMiddleware,
};