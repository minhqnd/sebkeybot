const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Cấu trúc data
const defaultData = {
  sellers: {}, // userId -> { apiKey, name, createdAt }
  keys: [],    // Array of created keys with metadata
  stats: {
    totalKeysCreated: 0,
    lastUpdated: null
  }
};

let data = { ...defaultData };

// Load data từ file
async function loadData() {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(fileContent);

    // Merge với default data để đảm bảo có tất cả fields
    data = {
      sellers: { ...defaultData.sellers, ...parsedData.sellers },
      keys: parsedData.keys || [],
      stats: { ...defaultData.stats, ...parsedData.stats }
    };

    console.log(`[DATA] Loaded ${Object.keys(data.sellers).length} sellers and ${data.keys.length} keys`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('[DATA] Data file not found, creating new one');
      await saveData();
    } else {
      console.error('[DATA] Error loading data:', error);
    }
  }
}

// Save data vào file
async function saveData() {
  try {
    data.stats.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('[DATA] Data saved successfully');
  } catch (error) {
    console.error('[DATA] Error saving data:', error);
  }
}

// Quản lý sellers
function setSellerApiKey(userId, apiKey, userInfo = {}) {
  const userIdStr = userId.toString();
  data.sellers[userIdStr] = {
    apiKey,
    name: userInfo.first_name || 'Unknown',
    username: userInfo.username || null,
    createdAt: new Date().toISOString(),
    lastUsed: null
  };
  saveData();
  console.log(`[DATA] Set API key for seller ${userIdStr}: ${apiKey.substring(0, 3)}***`);
}

function getSellerApiKey(userId) {
  const userIdStr = userId.toString();
  return data.sellers[userIdStr]?.apiKey || null;
}

function getSellerInfo(userId) {
  const userIdStr = userId.toString();
  return data.sellers[userIdStr] || null;
}

function getAllSellers() {
  return Object.entries(data.sellers).map(([userId, info]) => ({
    userId: parseInt(userId),
    ...info
  }));
}

// Quản lý keys
function addCreatedKey(keyData, sellerId) {
  const keyEntry = {
    id: keyData.id,
    keyCode: keyData.key_code,
    activationDays: keyData.activation_days,
    keyExpiryDate: keyData.key_expiry_date,
    note: keyData.note,
    sellerId: keyData.seller_id,
    sellerName: keyData.seller_name,
    createdAt: keyData.created_at,
    createdBy: sellerId, // User ID của người tạo
    createdAtTimestamp: new Date().toISOString()
  };

  data.keys.push(keyEntry);
  data.stats.totalKeysCreated++;

  // Update last used cho seller
  const sellerIdStr = sellerId.toString();
  if (data.sellers[sellerIdStr]) {
    data.sellers[sellerIdStr].lastUsed = new Date().toISOString();
  }

  saveData();
  console.log(`[DATA] Added key ${keyData.key_code} created by seller ${sellerId}`);
}

// Query functions
function getKeysBySeller(sellerId) {
  const sellerIdStr = sellerId.toString();
  return data.keys.filter(key => key.createdBy === sellerIdStr);
}

function getAllKeys() {
  return [...data.keys];
}

function getKeysStats() {
  const now = new Date();
  const last24h = data.keys.filter(key => {
    const keyDate = new Date(key.createdAtTimestamp);
    return (now - keyDate) < 24 * 60 * 60 * 1000;
  });

  const last7d = data.keys.filter(key => {
    const keyDate = new Date(key.createdAtTimestamp);
    return (now - keyDate) < 7 * 24 * 60 * 60 * 1000;
  });

  return {
    total: data.stats.totalKeysCreated,
    last24h: last24h.length,
    last7d: last7d.length,
    sellersCount: Object.keys(data.sellers).length
  };
}

function getRecentKeys(limit = 10) {
  return data.keys
    .sort((a, b) => new Date(b.createdAtTimestamp) - new Date(a.createdAtTimestamp))
    .slice(0, limit);
}

// Initialize
loadData();

module.exports = {
  setSellerApiKey,
  getSellerApiKey,
  getSellerInfo,
  getAllSellers,
  addCreatedKey,
  getKeysBySeller,
  getAllKeys,
  getKeysStats,
  getRecentKeys,
  saveData
};