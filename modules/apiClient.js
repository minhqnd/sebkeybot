const axios = require('axios');

class ApiClient {
  constructor(secret) {
    this.secret = secret;
    this.baseUrl = 'https://worker.stromez.tech/';
  }

  async createActivationKey(apiKey, keyType, activationDays = null, note = 'telebot') {
    const payload = {
      api_key: apiKey,
      secret: this.secret,
      key_type: keyType,
      note: `[tele] ${note}`
    };

    if (keyType === 'day' && activationDays) {
      payload.activation_days = activationDays;
    }

    try {
      const response = await axios.post(`${this.baseUrl}api/activation-keys`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('API request failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async checkActivationKey(keyCode) {
    try {
      const response = await axios.get(`${this.baseUrl}check-key/${keyCode}`);
      return response.data;
    } catch (error) {
      console.error('API check request failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async checkUser(email) {
    try {
      const response = await axios.get(`${this.baseUrl}auth?email=${encodeURIComponent(email)}&secret=${this.secret}`);
      return response.data;
    } catch (error) {
      console.error('API check user request failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async createStatistics(days = 30, sellerId = null) {
    const payload = {
      secret: this.secret,
      days
    };

    if (sellerId) {
      payload.seller_id = sellerId;
    }

    try {
      const response = await axios.post(`${this.baseUrl}api/key-statistics`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('API statistics request failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}

module.exports = ApiClient;