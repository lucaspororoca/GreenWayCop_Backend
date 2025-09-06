const Redis = require('ioredis');
const logger = require('../config/logger');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

exports.getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error getting cache: ${error}`);
    return null;
  }
};

exports.setCache = async (key, value, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    logger.error(`Error setting cache: ${error}`);
  }
};