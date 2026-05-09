const crypto = require('crypto');

function validateTelegramData(initData, botToken) {
  if (!initData || !botToken) return null;
  
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckArr = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    if (calculatedHash === hash) {
      const userStr = urlParams.get('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return null;
  }
}

function authMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  
  // For development, allow bypass with telegram user data in header
  if (process.env.NODE_ENV === 'development' && req.headers['x-telegram-user']) {
    try {
      req.telegramUser = JSON.parse(req.headers['x-telegram-user']);
      return next();
    } catch (e) {
      // Continue with normal validation
    }
  }
  
  const user = validateTelegramData(initData, process.env.BOT_TOKEN);
  
  if (!user) {
    // For development, allow requests with telegram_id in body/query
    if (process.env.NODE_ENV === 'development') {
      const telegramId = req.body?.telegram_id || req.query?.telegram_id;
      if (telegramId) {
        req.telegramUser = { id: parseInt(telegramId) };
        return next();
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.telegramUser = user;
  next();
}

module.exports = { authMiddleware, validateTelegramData };
