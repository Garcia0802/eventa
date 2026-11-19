require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor Eventa rodando na porta ${PORT}`);
  });
}

module.exports = app;
