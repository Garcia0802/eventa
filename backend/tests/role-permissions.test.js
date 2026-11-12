const assert = require('assert');
const db = require('../src/config/database');
const authController = require('../src/controllers/authController');
const roleMiddleware = require('../src/middleware/roleMiddleware');

(async () => {
  const originalExecute = db.execute.bind(db);

  try {
    db.execute = async (sql, params) => {
      if (sql.includes('SELECT id FROM users WHERE email = ?')) {
        return [[]];
      }

      if (sql.includes('INSERT INTO users')) {
        return [{ insertId: 99 }];
      }

      return [[{ id: 1, role: 'PARTICIPANT' }]];
    };

    const registerResponse = {
      statusCode: 0,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.payload = data;
        return this;
      },
    };

    await authController.register(
      {
        body: {
          name: 'João Silva',
          email: 'joao@email.com',
          password: 'Senha123',
          city: 'Santa Cruz do Sul',
          role: 'ADMIN',
        },
      },
      registerResponse,
      () => {}
    );

    assert.strictEqual(registerResponse.statusCode, 201, 'Cadastro deve criar status 201.');
    assert.strictEqual(registerResponse.payload.user.role, 'PARTICIPANT', 'Cadastro deve ignorar role enviada pelo cliente.');

    let nextCalled = false;
    const okRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return this;
      },
    };

    roleMiddleware('PARTICIPANT')({ user: { role: 'PARTICIPANT' } }, okRes, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true, 'Usuário PARTICIPANT deve ser autorizado.');

    let forbidden = false;
    roleMiddleware('ADMIN')({ user: { role: 'PARTICIPANT' } }, {
      status(code) {
        forbidden = code === 403;
        return this;
      },
      json() {
        return this;
      },
    }, () => {
      forbidden = false;
    });
    assert.strictEqual(forbidden, true, 'Usuário sem permissão deve receber 403.');

    console.log('role-permissions tests: OK');
  } finally {
    db.execute = originalExecute;
  }
})();
