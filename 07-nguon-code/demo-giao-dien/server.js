import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './src/db/initDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 4173;

const db = getDb();

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper to send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper to recalculate overall project progress from tasks
function recalculateProjectProgress() {
  const stats = db.prepare(`
    SELECT AVG(phan_tram_tien_do) as avg_progress FROM cong_viec
  `).get();
  const avg = stats && stats.avg_progress !== null ? Math.round(stats.avg_progress * 10) / 10 : 0.0;
  db.prepare(`UPDATE do_an SET tien_do_tong = ? WHERE ma_do_an = 'da-dacs-01'`).run(avg);
  return avg;
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Server handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // ==========================================
  // REST API ROUTES (/api/...)
  // ==========================================

  // 1. GET /api/project
  if (method === 'GET' && pathname === 'api/project' || pathname === '/api/project') {
    recalculateProjectProgress();
    const project = db.prepare(`SELECT * FROM do_an LIMIT 1`).get();
    const team = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(project.ma_do_an);
    const gv = db.prepare(`SELECT ma_nguoi_dung, ho_ten, email FROM nguoi_dung WHERE ma_nguoi_dung = ?`).get(project.ma_giang_vien);
    return sendJson(res, 200, { project, team, instructor: gv });
  }

  // 2. GET /api/users
  if (method === 'GET' && (pathname === 'api/users' || pathname === '/api/users')) {
    const users = db.prepare(`SELECT ma_nguoi_dung, email, ho_ten, vai_tro_he_thong, trang_thai_hoat_dong FROM nguoi_dung`).all();
    return sendJson(res, 200, users);
  }

  // 3. GET /api/milestones
  if (method === 'GET' && (pathname === 'api/milestones' || pathname === '/api/milestones')) {
    const milestones = db.prepare(`
      SELECT m.*, 
        COUNT(c.ma_cong_viec) as tong_so_viec,
        SUM(CASE WHEN c.trang_thai = 'hoan_thanh' THEN 1 ELSE 0 END) as so_viec_hoan_thanh
      FROM moc_tien_do m
      LEFT JOIN cong_viec c ON m.ma_moc = c.ma_moc
      GROUP BY m.ma_moc
      ORDER BY m.han_hoan_thanh ASC
    `).all();
    return sendJson(res, 200, milestones);
  }

  // 4. GET /api/tasks
  if (method === 'GET' && (pathname === 'api/tasks' || pathname === '/api/tasks')) {
    const milestoneId = parsedUrl.searchParams.get('milestoneId');
    const assigneeId = parsedUrl.searchParams.get('assigneeId');

    let query = `
      SELECT c.*, 
        u.ho_ten as ten_nguoi_thuc_hien,
        m.ten_moc
      FROM cong_viec c
      LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
      LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
      WHERE 1=1
    `;
    const params = [];

    if (milestoneId && milestoneId !== 'all') {
      query += ` AND c.ma_moc = ?`;
      params.push(milestoneId);
    }
    if (assigneeId) {
      query += ` AND c.ma_nguoi_thuc_hien = ?`;
      params.push(assigneeId);
    }

    query += ` ORDER BY c.thoi_gian_tao DESC`;
    const tasks = db.prepare(query).all(...params);
    return sendJson(res, 200, tasks);
  }

  // 5. POST /api/tasks (Giao việc mới)
  if (method === 'POST' && (pathname === 'api/tasks' || pathname === '/api/tasks')) {
    try {
      const data = await parseBody(req);
      const newId = `cv-${Date.now()}`;
      const stmt = db.prepare(`
        INSERT INTO cong_viec (
          ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
          trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
          ma_nguoi_thuc_hien, ma_nguoi_tao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        newId,
        data.ma_do_an || 'da-dacs-01',
        data.ma_moc,
        data.tieu_de,
        data.noi_dung_mo_ta || '',
        'can_lam',
        0.0,
        0,
        data.han_chot || null,
        data.ma_nguoi_thuc_hien || null,
        data.ma_nguoi_tao || 'u-sv-01'
      );
      recalculateProjectProgress();
      return sendJson(res, 201, { success: true, ma_cong_viec: newId });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 6. PATCH /api/tasks/:id (Cập nhật tiến độ / trạng thái việc)
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (method === 'PATCH' && taskMatch) {
    const taskId = taskMatch[1];
    try {
      const data = await parseBody(req);
      const task = db.prepare(`SELECT * FROM cong_viec WHERE ma_cong_viec = ?`).get(taskId);
      if (!task) return sendJson(res, 404, { error: 'Không tìm thấy công việc' });

      // Nếu việc bị khóa, không cho sửa % tiến độ
      let newProgress = task.phan_tram_tien_do;
      if (!task.trang_thai_khoa && data.phan_tram_tien_do !== undefined) {
        newProgress = parseFloat(data.phan_tram_tien_do);
      }

      let newStatus = data.trang_thai || task.trang_thai;
      if (newProgress === 100.0) newStatus = 'hoan_thanh';

      db.prepare(`
        UPDATE cong_viec
        SET tieu_de = COALESCE(?, tieu_de),
            ma_moc = COALESCE(?, ma_moc),
            ma_nguoi_thuc_hien = ?,
            han_chot = ?,
            noi_dung_mo_ta = COALESCE(?, noi_dung_mo_ta),
            trang_thai = ?,
            phan_tram_tien_do = ?
        WHERE ma_cong_viec = ?
      `).run(
        data.tieu_de || null,
        data.ma_moc || null,
        data.ma_nguoi_thuc_hien !== undefined ? data.ma_nguoi_thuc_hien : task.ma_nguoi_thuc_hien,
        data.han_chot !== undefined ? data.han_chot : task.han_chot,
        data.noi_dung_mo_ta || null,
        newStatus,
        newProgress,
        taskId
      );

      recalculateProjectProgress();
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 7. POST /api/tasks/:id/lock (Khóa tiến độ)
  const lockMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/lock$/);
  if (method === 'POST' && lockMatch) {
    const taskId = lockMatch[1];
    const data = await parseBody(req);
    db.prepare(`
      UPDATE cong_viec 
      SET trang_thai_khoa = 1, ma_nguoi_khoa = ? 
      WHERE ma_cong_viec = ?
    `).run(data.userId || 'u-gv-01', taskId);
    return sendJson(res, 200, { success: true, locked: true });
  }

  // 8. POST /api/tasks/:id/unlock (Mở khóa tiến độ)
  const unlockMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/unlock$/);
  if (method === 'POST' && unlockMatch) {
    const taskId = unlockMatch[1];
    db.prepare(`
      UPDATE cong_viec 
      SET trang_thai_khoa = 0, ma_nguoi_khoa = NULL 
      WHERE ma_cong_viec = ?
    `).run(taskId);
    return sendJson(res, 200, { success: true, locked: false });
  }

  // 9. GET & POST /api/tasks/:id/comments
  const commentsMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/comments$/);
  if (commentsMatch) {
    const taskId = commentsMatch[1];
    if (method === 'GET') {
      const comments = db.prepare(`
        SELECT b.*, u.ho_ten as ten_tac_gia
        FROM binh_luan b
        LEFT JOIN nguoi_dung u ON b.ma_nguoi_dung = u.ma_nguoi_dung
        WHERE b.ma_cong_viec = ?
        ORDER BY b.thoi_gian_tao ASC
      `).all(taskId);
      return sendJson(res, 200, comments);
    }
    if (method === 'POST') {
      const data = await parseBody(req);
      const newCommentId = `bl-${Date.now()}`;
      db.prepare(`
        INSERT INTO binh_luan (ma_binh_luan, ma_cong_viec, ma_nguoi_dung, noi_dung)
        VALUES (?, ?, ?, ?)
      `).run(newCommentId, taskId, data.userId || 'u-sv-01', data.noi_dung);
      return sendJson(res, 201, { success: true, ma_binh_luan: newCommentId });
    }
  }

  // 10. GET & POST /api/tasks/:id/attachments
  const filesMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/attachments$/);
  if (filesMatch) {
    const taskId = filesMatch[1];
    if (method === 'GET') {
      const files = db.prepare(`
        SELECT t.*, u.ho_ten as ten_nguoi_tai_len
        FROM tep_dinh_kem t
        LEFT JOIN nguoi_dung u ON t.ma_nguoi_dung = u.ma_nguoi_dung
        WHERE t.ma_cong_viec = ?
        ORDER BY t.thoi_gian_tao DESC
      `).all(taskId);
      return sendJson(res, 200, files);
    }
    if (method === 'POST') {
      const data = await parseBody(req);
      const newFileId = `tep-${Date.now()}`;
      db.prepare(`
        INSERT INTO tep_dinh_kem (ma_tep, ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        newFileId, taskId, data.userId || 'u-sv-01',
        data.ten_tep, `/uploads/${data.ten_tep}`,
        data.loai_tep || 'application/octet-stream',
        data.dung_luong || 25000
      );
      return sendJson(res, 201, { success: true, ma_tep: newFileId });
    }
  }

  // 11. GET /api/team
  if (method === 'GET' && (pathname === 'api/team' || pathname === '/api/team')) {
    const members = db.prepare(`
      SELECT tv.ma_thanh_vien_nhom, tv.vai_tro_trong_nhom, tv.thoi_gian_tham_gia,
             u.ma_nguoi_dung, u.ho_ten, u.email, u.vai_tro_he_thong
      FROM thanh_vien_nhom tv
      JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
      ORDER BY tv.vai_tro_trong_nhom DESC
    `).all();
    const gv = db.prepare(`SELECT * FROM nguoi_dung WHERE vai_tro_he_thong = 'giangvien' LIMIT 1`).get();
    return sendJson(res, 200, { members, instructor: gv });
  }

  // 12. GET /api/notifications
  if (method === 'GET' && (pathname === 'api/notifications' || pathname === '/api/notifications')) {
    const userId = parsedUrl.searchParams.get('userId');
    const query = userId 
      ? `SELECT * FROM thong_bao WHERE ma_nguoi_dung = ? ORDER BY thoi_gian_tao DESC`
      : `SELECT * FROM thong_bao ORDER BY thoi_gian_tao DESC`;
    const notifications = userId ? db.prepare(query).all(userId) : db.prepare(query).all();
    return sendJson(res, 200, notifications);
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security: Prevent Directory Traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[SERVER] Fullstack SQLite API Server đang chạy tại: http://localhost:${PORT}`);
});
