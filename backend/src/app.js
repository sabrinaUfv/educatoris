require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/conteudo', require('./routes/conteudoRoutes'));
app.use('/api/materiais', require('./routes/materialRoutes'));
app.use('/api/planos', require('./routes/planoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`e-ducatoris backend na porta ${PORT}`));

module.exports = app;
