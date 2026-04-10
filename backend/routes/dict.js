const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/dict/reduce-types - Get list of reduce types
router.get('/reduce-types', async (req, res) => {
  try {
    const reduceTypes = await prisma.dictReduceType.findMany({
      orderBy: { sort_order: 'asc' },
    });
    res.json(reduceTypes);
  } catch (error) {
    console.error('Get reduce types error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// GET /api/dict/reduce-reasons - Get list of reduce reasons
router.get('/reduce-reasons', async (req, res) => {
  const { parent_code } = req.query;
  try {
    const whereClause = parent_code ? { parent_code } : {};
    const reduceReasons = await prisma.dictReduceReason.findMany({
      where: whereClause,
      orderBy: { sort_order: 'asc' },
    });
    res.json(reduceReasons);
  } catch (error) {
    console.error('Get reduce reasons error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
