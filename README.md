# Sebkey Bot

Bot Telegram quản lý nhóm sử dụng Telegraf.

## Cài đặt

1. Clone repository này.
2. Chạy `pnpm install` để cài đặt dependencies.
3. Tạo file `.env` và thêm token bot của bạn:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ADMIN_IDS=your_admin_id1,your_admin_id2
   SECRET=your_api_secret_here
   ```
4. Chạy `pnpm start` để khởi động bot.

## Lệnh

- `/start` - Khởi động bot
- `/help` - Hiển thị trợ giúp
- `/ban` - Ban người dùng (reply tin nhắn của họ)
- `/kick` - Kick người dùng (reply tin nhắn của họ)
- `/unban` - Unban người dùng (reply tin nhắn của họ)
- `/key [số ngày|ky]` - Tạo activation key

## Yêu cầu

- Node.js
- pnpm
- Token bot từ BotFather trên Telegram

## Phát triển

Chạy `pnpm run dev` để chạy với watch mode.
