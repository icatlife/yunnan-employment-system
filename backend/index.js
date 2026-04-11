require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const enterpriseRoutes = require('./routes/enterprise');
const dictRoutes = require('./routes/dict');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
// 明确配置CORS，允许来自前端开发服务器的请求
app.use(cors({
  origin: 'http://localhost:5173' 
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/dict', dictRoutes);

// A simple test route
app.get('/', (req, res) => {
  res.send('Yunnan Employment System Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
