# Seller API Documentation

## 📋 Tổng quan

Seller API cho phép các seller tạo activation keys một cách tự động thông qua API endpoint bảo mật. Hệ thống sử dụng **đôi bảo mật** (double authentication) để đảm bảo an toàn:

1. **API Key**: Xác thực danh tính seller
2. **Seller Secret**: Ủy quyền thực hiện hành động

## 🚀 Bắt đầu nhanh

### 1. Cấu hình Environment

Thêm vào file `.env`:

```bash
# Seller API secret - thay đổi trong production!
SELLER_SECRET=your_super_secure_secret_here_2025
```

### 2. Tạo Seller

**Cách 1: Qua Admin Panel**
- Truy cập `/admin` → tab "Sellers"
- Click "Add Seller" và nhập tên

**Cách 2: Qua API**

```bash
curl -X POST https://worker.stromez.tech/admin/sellers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Seller ABC"}'
```

**Response:**
```json
{
  "id": 1,
  "name": "Seller ABC",
  "api_key": "odDp4CBRrK9N7Ppm",  // 16 ký tự
  "created_at": "2025-11-11T10:20:00"
}
```

> ⚠️ **Quan trọng**: Lưu lại `api_key` ngay lập tức - bạn sẽ không thấy lại nó!

## 🔑 Thông tin API Key

- **Độ dài**: 16 ký tự (URL-safe base64)
- **Ví dụ**: `odDp4CBRrK9N7Ppm`, `H9cy1s3kRT5nqRv4`
- **Tính duy nhất**: Được đảm bảo trong database
- **Bảo mật**: Tạo bằng `secrets.token_urlsafe(12)`

### Reset API Key

Nếu nghi ngờ API key bị lộ, admin có thể reset:

1. Vào Admin Panel → Sellers
2. Click nút 🔄 (Reset API Key) trên hàng seller
3. Xác nhận reset
4. API key mới sẽ hiển thị ngay lập tức

## 📡 Sử dụng API

### Endpoint

```
POST /seller/activation-keys
```

### Headers bắt buộc

```
X-API-Key: <seller_api_key>
Content-Type: application/json
```

### Request Body

```json
{
  "activation_days": 30,
  "key_expiry_date": "2026-11-11T00:00:00",
  "note": "Monthly subscription",
  "secret": "your_seller_secret_here"
}
```

### Ví dụ hoàn chỉnh

```bash
curl -X POST https://worker.stromez.tech/seller/activation-keys \
  -H "X-API-Key: odDp4CBRrK9N7Ppm" \
  -H "Content-Type: application/json" \
  -d '{
    "activation_days": 30,
    "key_expiry_date": "2026-11-11T00:00:00",
    "note": "Monthly subscription",
    "secret": "your_seller_secret_here"
  }'
```

### Response thành công

```json
{
  "id": 123,
  "key_code": "ABC123DEF4",
  "activation_days": 30,
  "seller_id": 1,
  "seller_name": "Seller ABC",
  "note": "Monthly subscription",
  "key_expiry_date": "2026-11-11T00:00:00",
  "created_at": "2025-11-11T10:30:00",
  "updated_at": "2025-11-11T10:30:00"
}
```

## 🔒 Bảo mật

### Double Authentication

- **API Key**: Xác định seller (16 ký tự, unique)
- **Seller Secret**: Ủy quyền hành động (từ environment)
- Ngay cả khi API key bị lộ, vẫn cần secret để tạo key

### Seller Isolation

- Seller chỉ có thể tạo key cho chính mình
- `seller_id` được tự động set từ API key
- Không thể tạo key cho seller khác

### Audit Trail

- Tất cả requests được log với thông tin seller
- Dễ dàng tracking ai tạo key nào
- Timestamp đầy đủ cho debugging

### Additional Security

- **Rate Limiting**: Khuyến nghị implement
- **IP Whitelisting**: Optional cho seller trusted
- **Request Monitoring**: Log và alert suspicious activity

## ⚠️ Error Responses

### 401 Unauthorized - Invalid API Key
```json
{
  "detail": "Invalid API key"
}
```

### 401 Unauthorized - Invalid Secret
```json
{
  "detail": "Invalid seller secret"
}
```

### 400 Bad Request - Missing Header
```json
{
  "detail": "Missing X-API-Key header"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "activation_days"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## 🐍 Python Example

```python
import requests
import json

# Configuration
BASE_URL = "https://worker.stromez.tech"
SELLER_API_KEY = "odDp4CBRrK9N7Ppm"  # Từ admin panel
SELLER_SECRET = "your_seller_secret_here"

def create_activation_key(days, expiry_date, note=""):
    """Tạo activation key mới"""

    url = f"{BASE_URL}/seller/activation-keys"
    headers = {
        "X-API-Key": SELLER_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "activation_days": days,
        "key_expiry_date": expiry_date,
        "note": note,
        "secret": SELLER_SECRET
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Tạo key thành công: {result['key_code']}")
        return result
    else:
        print(f"❌ Lỗi: {response.status_code} - {response.text}")
        return None

# Usage
if __name__ == "__main__":
    # Tạo key 30 ngày
    key = create_activation_key(
        days=30,
        expiry_date="2026-11-11T00:00:00",
        note="Monthly subscription"
    )
```

## 🔧 Troubleshooting

### API Key không hoạt động
- Kiểm tra API key có đúng không (16 ký tự)
- Đảm bảo không có khoảng trắng thừa
- Kiểm tra seller có bị xóa không

### Seller Secret sai
- Kiểm tra biến `SELLER_SECRET` trong `.env`
- Đảm bảo secret khớp chính xác
- Restart server sau khi thay đổi `.env`

### 422 Validation Error
- Kiểm tra `activation_days` > 0
- `key_expiry_date` phải là ISO format
- `secret` field bắt buộc

### Connection Timeout
- Kiểm tra server có chạy không
- Kiểm tra URL endpoint đúng
- Kiểm tra firewall/network issues

## 📝 Migration Notes

- **Existing sellers**: Sẽ có API key khi system restart
- **New sellers**: Tự động có API key khi tạo
- **Admin endpoints**: Không thay đổi
- **API key length**: Đã giảm từ 43 xuống 16 ký tự (v1.1.0)
- **Security**: Double authentication bắt buộc

## 🎯 Best Practices

1. **Lưu trữ an toàn**: Backup API keys ở nơi bảo mật
2. **Rotate regularly**: Định kỳ reset API key
3. **Monitor usage**: Theo dõi requests suspicious
4. **Use HTTPS**: Luôn dùng HTTPS trong production
5. **Rate limiting**: Implement rate limiting per seller
6. **Logging**: Log tất cả API calls cho audit

---

*Last updated: November 11, 2025*