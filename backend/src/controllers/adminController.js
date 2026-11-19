const pool = require('../config/database');

const VALID_REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

exports.listOrganizerRequests = async (req, res, next) => {
  try {
    const rawStatus = String(req.query.status || '').trim().toUpperCase();

    if (rawStatus && !VALID_REQUEST_STATUSES.includes(rawStatus)) {
      return res.status(400).json({ message: 'Status inválido. Use PENDING, APPROVED ou REJECTED.' });
    }

    const whereClause = rawStatus ? 'WHERE r.status = ?' : '';
    const params = rawStatus ? [rawStatus] : [];

    const [rows] = await pool.execute(
      `SELECT r.id, r.user_id, r.reason, r.status, r.reviewed_by, r.reviewed_at,
              r.created_at, r.updated_at,
              u.name AS requester_name, u.email AS requester_email,
              u.role AS requester_role,
              admin.name AS reviewer_name
       FROM organizer_requests r
       INNER JOIN users u ON u.id = r.user_id
       LEFT JOIN users admin ON admin.id = r.reviewed_by
       ${whereClause}
       ORDER BY
         CASE r.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END,
         r.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getOrganizerRequestById = async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ message: 'ID da solicitação inválido.' });
    }

    const [rows] = await pool.execute(
      `SELECT r.id, r.user_id, r.reason, r.status, r.reviewed_by, r.reviewed_at,
              r.created_at, r.updated_at,
              u.name AS requester_name, u.email AS requester_email,
              u.role AS requester_role,
              admin.name AS reviewer_name
       FROM organizer_requests r
       INNER JOIN users u ON u.id = r.user_id
       LEFT JOIN users admin ON admin.id = r.reviewed_by
       WHERE r.id = ?
       LIMIT 1`,
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.reviewOrganizerRequest = async (req, res, next) => {
  const decision = String(req.body.decision || '').trim().toUpperCase();
  const requestId = Number(req.params.id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'ID da solicitação inválido.' });
  }

  if (!['APPROVE', 'REJECT'].includes(decision)) {
    return res.status(400).json({ message: 'Decisão inválida. Use APPROVE ou REJECT.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [requestRows] = await connection.execute(
      `SELECT r.*, u.name AS requester_name, u.email AS requester_email, u.role AS requester_role
       FROM organizer_requests r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.id = ?
       FOR UPDATE`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    const request = requestRows[0];

    if (request.status !== 'PENDING') {
      await connection.rollback();
      return res.status(409).json({
        message: 'Esta solicitação já foi analisada.',
        status: request.status,
      });
    }

    const [userRows] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? FOR UPDATE',
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
      `UPDATE organizer_requests
       SET status = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = ? AND status = 'PENDING'`,
      [nextStatus, req.user.id, requestId]
    );

    await connection.commit();

    res.json({
      message: decision === 'APPROVE'
        ? 'Solicitação aprovada. O usuário agora é ORGANIZER.'
        : 'Solicitação rejeitada. O usuário continua PARTICIPANT.',
      request: {
        id: requestId,
        user_id: request.user_id,
        status: nextStatus,
        requester_name: request.requester_name,
        requester_email: request.requester_email,
      },
      status: nextStatus,
      userRole: newRole,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getAdminSummary = async (req, res, next) => {
  try {
    const [[counts]] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM organizer_requests WHERE status = 'PENDING') AS pending,
        (SELECT COUNT(*) FROM organizer_requests WHERE status = 'APPROVED') AS approved,
        (SELECT COUNT(*) FROM organizer_requests WHERE status = 'REJECTED') AS rejected,
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM users WHERE role = 'ORGANIZER') AS organizers,
        (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') AS admins,
        (SELECT COUNT(*) FROM events) AS events
    `);

    res.json(counts);
  } catch (error) {
    next(error);
  }
};
