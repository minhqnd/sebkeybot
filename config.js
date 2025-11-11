require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_ID: process.env.ADMIN,
  SECRET: process.env.SECRET,
  SELLER_API_BASE_URL: process.env.SELLER_API_BASE_URL || 'https://worker.stromez.tech',
  SELLER_SECRET: process.env.SELLER_SECRET,
};