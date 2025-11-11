// Hàm kiểm tra quyền admin
const isAdmin = async (ctx) => {
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return ['administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

module.exports = {
  isAdmin,
};