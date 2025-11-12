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

  async getStatistics(days = 30, sellerId = null) {
    return await this.apiClient.createStatistics(days, sellerId);
  }

  formatStatisticsMessage(result) {
    // Expecting result to contain fields similar to the example in the request
    const {
      success,
      days,
      start_date,
      end_date,
      total_sellers,
      overall_stats,
      seller_stats
    } = result;

    let msg = `<b>📊 Thống kê keys</b>\n`;
    msg += `<b>Ngày:</b> ${days || ''} ngày\n`;
    if (start_date) msg += `<b>Bắt đầu:</b> ${new Date(start_date).toLocaleString('vi-VN')}\n`;
    if (end_date) msg += `<b>Kết thúc:</b> ${new Date(end_date).toLocaleString('vi-VN')}\n`;
    msg += `<b>Tổng sellers:</b> ${total_sellers ?? 0}\n\n`;

    if (overall_stats) {
      msg += `<b>Overall:</b>\n`;
      msg += `- Tổng keys: ${overall_stats.total_keys ?? 0}\n`;
      if (overall_stats.day_keys != null) msg += `- Day keys: ${overall_stats.day_keys}\n`;
      if (overall_stats.semester_keys != null) msg += `- Semester keys: ${overall_stats.semester_keys}\n`;
      if (overall_stats.activated_keys != null) msg += `- Activated keys: ${overall_stats.activated_keys}\n`;
      if (overall_stats.unactivated_keys != null) msg += `- Unactivated keys: ${overall_stats.unactivated_keys}\n`;
      msg += `\n`;
    }

    if (Array.isArray(seller_stats) && seller_stats.length > 0) {
      msg += `<b>Per-seller breakdown:</b>\n`;
      seller_stats.forEach(s => {
        msg += `<b>Seller:</b> ${s.seller_name || 'Unknown'} (ID: ${(s.seller_id ?? s.id) || 'unknown'}) - Total: ${s.total_keys ?? 0}\n`;
        if (s.day_keys != null) msg += `  • Day keys: ${s.day_keys}\n`;
        if (s.semester_keys != null) msg += `  • Semester keys: ${s.semester_keys}\n`;
        if (s.activated_keys != null) msg += `  • Activated: ${s.activated_keys}\n`;
        if (s.unactivated_keys != null) msg += `  • Unactivated: ${s.unactivated_keys}\n`;
        msg += `\n`;
      });
    }

    return msg;
  }
}

module.exports = KeyManager;