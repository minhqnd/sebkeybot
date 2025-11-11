# Telegram Group Management Bot

Bot Telegram quản lý nhóm sử dụng thư viện Telegraf, với token được lưu trong biến môi trường.

## Tính năng

- 🤖 Chào mừng thành viên mới tự động
- 👋 Thông báo khi thành viên rời nhóm
- 🚫 Kick thành viên (chỉ Super Admin)
- 🔨 Ban thành viên (chỉ Super Admin)
- 🔇 Mute/Unmute thành viên (chỉ Super Admin)
- 📌 Pin/Unpin tin nhắn (chỉ Super Admin)
- 📊 Xem thông tin nhóm
- ⚠️ Phát hiện và ngăn chặn spam tự động
- 📝 Log tất cả tin nhắn của user
- 🔑 Quản lý Seller API Keys (chỉ Super Admin)
- 🎫 Tạo Activation Keys (cho Sellers)
- � Thống kê Sellers & Keys (chỉ Super Admin)
- 📋 Xem lịch sử Keys đã tạo (cho Sellers)
- 💾 Lưu trữ data persistent (JSON file)

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
   ADMIN=your_telegram_user_id_here
   SECRET=your_secret_key_here
   SELLER_API_BASE_URL=https://worker.stromez.tech
   SELLER_SECRET=your_seller_secret_here
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

### Dành cho Super Admin:
- `/kick` - Kick thành viên (reply tin nhắn của người cần kick)
- `/ban` - Ban thành viên (reply tin nhắn của người cần ban)
- `/mute [phút]` - Mute thành viên trong thời gian chỉ định (mặc định 60 phút)
- `/unmute` - Unmute thành viên (reply tin nhắn của người cần unmute)
- `/pin` - Pin tin nhắn (reply tin nhắn cần pin)
- `/unpin` - Unpin tin nhắn (reply tin nhắn cần unpin)
- `/setapikey [api_key]` - Gán Seller Key cho seller (reply tin nhắn)
- `/sellerstats` - Xem thống kê sellers và keys

### Dành cho Seller:
- `/createkey [days] [note]` - Tạo activation key với số ngày và ghi chú
- `/mykeys` - Xem lịch sử keys đã tạo (gửi riêng tư)

### Chung:
- `/info` - Xem thông tin nhóm
- `/help` - Hiển thị danh sách lệnh và hướng dẫn

## Seller API Integration

Bot được tích hợp với Seller API để quản lý activation keys:

### Cấu hình Seller API

Thêm vào `.env`:
```
SELLER_API_BASE_URL=https://worker.stromez.tech
SELLER_SECRET=your_seller_secret_here
```

### Quy trình sử dụng

1. **Super Admin gán API Key:**
   ```
   /setapikey odDp4CBRrK9N7Ppm  (reply tin nhắn của seller)
   ```

2. **Seller tạo Activation Key:**
   ```
   /createkey 30 Monthly subscription
   ```

3. **Bot sẽ:**
   - Gửi thông tin key (ẩn code) vào nhóm
   - Gửi key đầy đủ riêng cho seller
   - Log đầy đủ cho admin/server

### Bảo mật

- Key code chỉ hiển thị 3 ký tự đầu + `***` trong nhóm
- Key đầy đủ được gửi riêng tư cho seller
- Tất cả requests được log chi tiết

## Data Persistence

Bot tự động lưu trữ data vào file `data.json`:

### Dữ liệu được lưu:
- **Sellers**: Mapping user ID → API key + thông tin seller
- **Keys**: Lịch sử tất cả activation keys đã tạo
- **Stats**: Thống kê tổng quan (tổng keys, keys theo thời gian)

### Cấu trúc data.json:
```json
{
  "sellers": {
    "2110348005": {
      "apiKey": "odDp4CBRrK9N7Ppm",
      "name": "Minh",
      "username": "minhqnd",
      "createdAt": "2025-11-11T12:00:00.000Z",
      "lastUsed": "2025-11-11T12:30:00.000Z"
    }
  },
  "keys": [
    {
      "id": 123,
      "keyCode": "ABC123DEF4",
      "activationDays": 30,
      "keyExpiryDate": "2028-01-01T00:00:00",
      "note": "Monthly subscription",
      "sellerId": 1,
      "sellerName": "Seller ABC",
      "createdAt": "2025-11-11T12:30:00",
      "createdBy": "2110348005",
      "createdAtTimestamp": "2025-11-11T12:30:00.000Z"
    }
  ],
  "stats": {
    "totalKeysCreated": 1,
    "lastUpdated": "2025-11-11T12:30:00.000Z"
  }
}
```

### Backup & Recovery:
- File `data.json` được tự động backup khi có thay đổi
- Data persist qua các lần restart bot
- Có thể import/export data thủ công nếu cần

## Lưu ý

- **Super Admin**: Chỉ user có ID trùng với `ADMIN` trong file `.env` mới có thể sử dụng lệnh quản lý nhóm
- Bot cần quyền Admin trong nhóm để thực hiện các hành động quản lý
- Đảm bảo bot token và thông tin nhạy cảm được bảo mật
- Bot sẽ tự động chào mừng thành viên mới và thông báo khi có người rời nhóm
- Bot tự động phát hiện spam (nhiều tin nhắn trong thời gian ngắn) và mute tạm thời

## Cấu trúc dự án

```
sebkeybot/
├── index.js          # File chính khởi tạo bot
├── config.js         # Cấu hình (token, env)
├── utils.js          # Các hàm tiện ích (kiểm tra admin)
├── middlewares.js    # Middleware (phát hiện spam, log)
├── handlers.js       # Xử lý lệnh và sự kiện
├── seller.js         # Quản lý Seller API và keys
├── dataManager.js    # Quản lý lưu trữ data (JSON)
├── data.json         # File lưu trữ data (tự động tạo)
├── package.json      # Dependencies
├── .env              # Biến môi trường (không commit)
├── .env.example      # Mẫu file env
├── .gitignore        # Git ignore rules
└── README.md         # Tài liệu
```

## License

MIT