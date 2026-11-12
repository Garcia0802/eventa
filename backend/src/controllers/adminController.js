const pool = require('../config/database');

exports.listOrganizerRequests = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const whereClause = status ? 'WHERE r.status = ?' : '';
    const params = status ? [status] : [];

    const [rows] = await pool.execute(
      `SELECT r.id, r.user_id, r.reason, r.status, r.created_at, u.name AS requester_name, u.email AS requester_email
       FROM organizer_requests r
       INNER JOIN users u ON u.id = r.user_id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.reviewOrganizerRequest = async (req, res, next) => {
  try {
    const decision = String(req.body.decision || '').toUpperCase();

    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ message: 'Decisão inválida. Use APPROVE ou REJECT.' });
    }

    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId)) {
      return res.status(400).json({ message: 'ID da solicitação inválido.' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [requestRows] = await connection.execute(
        'SELECT * FROM organizer_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (requestRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Solicitação não encontrada.' });
      }

      const request = requestRows[0];

      if (request.status !== 'PENDING') {
        await connection.rollback();
        return res.status(409).json({ message: 'Esta solicitação já foi analisada.' });
      }

      const [userRows] = await connection.execute(
        'SELECT id, role FROM users WHERE id = ? FOR UPDATE',
        [request.user_id]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuário solicitante não encontrado.' });
      }

      const nextStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const newRole = decision === 'APPROVE' ? 'ORGANIZER' : 'PARTICIPANT';

      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [newRole, request.user_id]
      );

      await connection.execute(
        'UPDATE organizer_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
        [nextStatus, req.user.id, requestId]
      );

      await connection.commit();

      res.json({
        message: decision === 'APPROVE' ? 'Solicitação aprovada com sucesso.' : 'Solicitação rejeitada com sucesso.',
        status: nextStatus,
        userRole: newRole,
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
