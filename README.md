# Telegram Group Management Bot

Bot Telegram quản lý nhóm sử dụng thư viện Telegraf, với token được lưu trong biến môi trường.

## Tính năng

- 🤖 Chào mừng thành viên mới tự động
- 👋 Thông báo khi thành viên rời nhóm
- 🚫 Kick thành viên (chỉ Admin)
- 🔨 Ban thành viên (chỉ Admin)
- 🔇 Mute/Unmute thành viên (chỉ Admin)
- 📌 Pin/Unpin tin nhắn (chỉ Admin)
- 📊 Xem thông tin nhóm
- ⚠️ Phát hiện và ngăn chặn spam tự động
- 📝 Log tất cả tin nhắn của user
- 📋 Hiển thị danh sách lệnh

## Yêu cầu

- Node.js (phiên bản 14 trở lên)
- Bot token từ [@BotFather](https://t.me/botfather) trên Telegram

## Cài đặt

1. Clone repository này:
   ```bash
   git clone <repository-url>
   cd telegram-group-bot
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Sao chép file `.env.example` thành `.env` và thêm bot token:
   ```bash
   cp .env.example .env
   ```
   
   Sau đó chỉnh sửa file `.env`:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

## Sử dụng

1. Thêm bot vào nhóm Telegram của bạn
2. Cấp quyền Admin cho bot trong nhóm
3. Chạy bot:
   ```bash
   npm start
   ```

   Hoặc chạy ở chế độ development:
   ```bash
   npm run dev
   ```

## Lệnh

### Dành cho Admin:
- `/kick` - Kick thành viên (reply tin nhắn của người cần kick)
- `/ban` - Ban thành viên (reply tin nhắn của người cần ban)
- `/mute [phút]` - Mute thành viên trong thời gian chỉ định (mặc định 60 phút)
- `/unmute` - Unmute thành viên (reply tin nhắn của người cần unmute)
- `/pin` - Pin tin nhắn (reply tin nhắn cần pin)
- `/unpin` - Unpin tin nhắn (reply tin nhắn cần unpin)

### Chung:
- `/info` - Xem thông tin nhóm
- `/help` - Hiển thị danh sách lệnh và hướng dẫn

## Phát triển

Để phát triển thêm tính năng:

1. **Thêm handler mới**: Thêm vào `handlers.js` và export
2. **Thêm middleware**: Thêm vào `middlewares.js` và export
3. **Thêm utility**: Thêm vào `utils.js` và export
4. **Import vào `index.js`**: Import và sử dụng handler/middleware mới

Ví dụ: Để thêm lệnh `/warn`, thêm `handleWarn` vào `handlers.js`, sau đó import và đăng ký trong `index.js`.

## Lưu ý

- Bot cần quyền Admin trong nhóm để thực hiện các hành động quản lý
- Đảm bảo bot token được bảo mật và không chia sẻ công khai
- Bot sẽ tự động chào mừng thành viên mới và thông báo khi có người rời nhóm
- Bot tự động phát hiện spam (nhiều tin nhắn trong thời gian ngắn) và mute tạm thời

## Cấu trúc dự án

```
sebkeybot/
├── index.js          # File chính khởi tạo bot
├── config.js         # Cấu hình (token, env)
├── utils.js          # Các hàm tiện ích (kiểm tra admin)
├── middlewares.js    # Middleware (phát hiện spam)
├── handlers.js       # Xử lý lệnh và sự kiện
├── package.json      # Dependencies
├── .env              # Biến môi trường (không commit)
├── .env.example      # Mẫu file env
├── .gitignore        # Git ignore rules
└── README.md         # Tài liệu
```

## License

MIT