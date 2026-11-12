require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const organizerRequestRoutes = require('./routes/organizerRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ ok: true, message: 'Eventa API funcionando.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Erro de conexão com MySQL.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/organizer-requests', organizerRequestRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor Eventa rodando na porta ${PORT}`);
});
