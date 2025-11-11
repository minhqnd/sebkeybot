const ApiClient = require('./apiClient');

class KeyManager {
  constructor(secret) {
    this.apiClient = new ApiClient(secret);
  }

  async createKey(apiKey, userId, username, args) {
    const note = `${userId}-${username}`; // Generate email from user ID

    let keyType;
    let activationDays = null;

    if (args.length === 0) {
      throw new Error('Hãy cung cấp loại key. Ví dụ: /key 1 (cho 1 ngày) hoặc /key ky (cho kỳ)');
    }

    const firstArg = args[0].toLowerCase();

    if (firstArg === 'ky') {
      keyType = 'semester';
    } else {
      const days = parseInt(firstArg);
      if (isNaN(days) || days <= 0) {
        throw new Error('Số ngày phải là số dương. Ví dụ: /key 1');
      }
      keyType = 'day';
      activationDays = days;
    }

    const result = await this.apiClient.createActivationKey(
      apiKey,
      keyType,
      activationDays,
      note
    );

    return {
      ...result,
      userId,
      username,
      keyType,
      activationDays
    };
  }

  formatServerMessage(result) {
    const { username, userId, key_code, keyType, activationDays, key_expiry_date, is_semester, semester_name } = result;
    const maskedKey = key_code ? `${key_code.slice(0, 4)}****${key_code.slice(-4)}` : '****';

    let message = `🎉 <b>@${username}</b> (ID: ${userId}) đã tạo key thành công!\n`;
    message += `Key: <code>${maskedKey}</code>\n`;

    if (keyType === 'day') {
      message += `Loại: ${activationDays} ngày\n`;
    } else {
      message += `Loại: Kỳ ${semester_name}\n`;
    }

    if (key_expiry_date) {
      message += `Hết hạn: ${new Date(key_expiry_date).toLocaleDateString('vi-VN')}`;
    }

    return message;
  }

  formatUserMessage(result) {
    const { key_code, keyType, activationDays, key_expiry_date, is_semester, semester_name } = result;

    let message = `🎉 <b>Key của bạn đã được tạo thành công!</b>\n\n`;
    message += `<b>Key Code:</b> <code>${key_code}</code>\n`;

    if (keyType === 'day') {
      message += `<b>Loại:</b> ${activationDays} ngày\n`;
    } else {
      message += `<b>Loại:</b> Kỳ ${semester_name}\n`;
    }

    if (key_expiry_date) {
      message += `<b>Hết hạn:</b> ${new Date(key_expiry_date).toLocaleDateString('vi-VN')}\n`;
    }

    message += `\n💡 Sử dụng key này để kích hoạt dịch vụ.`;

    return message;
  }

  async checkKey(keyCode) {
    return await this.apiClient.checkActivationKey(keyCode);
  }

  formatCheckMessage(result) {
    const { key_code, duration_days, expire_date, activated, expired, is_semester, semester_name, message } = result;

    let response = `🔍 <b>Kiểm tra Key:</b> <code>${key_code}</code>\n\n`;

    if (duration_days && duration_days > 0) {
      response += `📅 Thời hạn: ${duration_days} ngày\n`;
    }

    if (expire_date) {
      response += `⏰ Hết hạn: ${new Date(expire_date).toLocaleDateString('vi-VN')}\n`;
    }

    response += `✅ Đã kích hoạt: ${activated ? 'Có' : 'Không'}\n`;

    if (expired) {
      response += `❌ Đã hết hạn: Có\n`;
    }

    if (semester_name) {
      response += `📚 Kỳ học: ${semester_name}\n`;
    }

    response += `\n💬 ${message}`;

    return response;
  }
}

module.exports = KeyManager;