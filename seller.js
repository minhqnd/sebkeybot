const axios = require('axios');
const { SELLER_API_BASE_URL, SELLER_SECRET } = require('./config');
const {
  setSellerApiKey: setSellerApiKeyDB,
  getSellerApiKey: getSellerApiKeyDB,
  addCreatedKey
} = require('./dataManager');

// Hàm gán Seller Key cho user
const setSellerApiKey = (userId, apiKey) => {
  setSellerApiKeyDB(userId, apiKey);
};

// Hàm lấy API key của user
const getSellerApiKey = (userId) => {
  return getSellerApiKeyDB(userId);
};

// Hàm tạo activation key qua API
const createActivationKey = async (apiKey, activationDays, note = '', sellerId) => {
  try {
    const url = `${SELLER_API_BASE_URL}/seller/activation-keys`;

    const requestData = {
      activation_days: activationDays,
      key_expiry_date: '2028-01-01T00:00:00', // Mặc định 1/1/2028
      note: note,
      secret: SELLER_SECRET
    };

    console.log(`[SELLER] Creating key for API key: ${apiKey.substring(0, 3)}***`);
    console.log(`[SELLER] Request data:`, JSON.stringify(requestData, null, 2));

    const response = await axios.post(url, requestData, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });

    console.log(`[SELLER] API Response:`, JSON.stringify(response.data, null, 2));

    // Lưu key vào database với sellerId
    addCreatedKey(response.data, sellerId);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error(`[SELLER] Error creating activation key:`, error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.detail || error.message
    };
  }
};

// Hàm format key code để hiển thị (3 số đầu + ***)
const formatKeyCode = (keyCode) => {
  if (!keyCode || keyCode.length < 3) return keyCode;
  return keyCode.substring(0, 3) + '***';
};

module.exports = {
  setSellerApiKey,
  getSellerApiKey,
  createActivationKey,
  formatKeyCode,
};