const pool = require('../config/database');

const normalizeReason = (value) => String(value || '').trim();

exports.createOrganizerRequest = async (req, res, next) => {
  try {
    const reason = normalizeReason(req.body.reason);

    if (!reason) {
      return res.status(400).json({ message: 'A justificativa é obrigatória.' });
    }

    if (reason.length > 300) {
      return res.status(400).json({ message: 'A justificativa deve ter até 300 caracteres.' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [pendingRows] = await connection.execute(
        'SELECT id FROM organizer_requests WHERE user_id = ? AND status = "PENDING" FOR UPDATE',
        [req.user.id]
      );

      if (pendingRows.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'Você já possui uma solicitação pendente.' });
      }

      const [userRows] = await connection.execute(
        'SELECT role FROM users WHERE id = ? FOR UPDATE',
        [req.user.id]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      if (['ORGANIZER', 'ADMIN'].includes(userRows[0].role)) {
        await connection.rollback();
        return res.status(409).json({ message: 'Este usuário já possui permissão para organizar eventos.' });
      }

      const [result] = await connection.execute(
        'INSERT INTO organizer_requests (user_id, reason, status) VALUES (?, ?, "PENDING")',
        [req.user.id, reason]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Sua solicitação foi enviada! Agora ela será analisada pela administração do Eventa.',
        request: {
          id: result.insertId,
          user_id: req.user.id,
          reason,
          status: 'PENDING',
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_id, reason, status, reviewed_by, reviewed_at, created_at, updated_at FROM organizer_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const latest = rows[0] || null;

    res.json({
      currentStatus: latest ? latest.status : null,
      requests: rows,
    });
  } catch (error) {
    next(error);
  }
};
