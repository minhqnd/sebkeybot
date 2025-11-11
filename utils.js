const { ADMIN_ID } = require('./config');

// Hàm kiểm tra quyền admin - chỉ cho phép user có ID trùng với ADMIN trong .env
const isAdmin = (ctx) => {
  if (!ctx.from || !ctx.from.id) {
    return false;
  }

  const userId = ctx.from.id.toString();
  const adminId = ADMIN_ID?.toString();

  if (!adminId) {
    console.warn('ADMIN_ID not set in environment variables');
    return false;
  }

  return userId === adminId;
};

module.exports = {
  isAdmin,
};