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
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.txt': 'text/plain; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8'
};

// Đảm bảo thư mục uploads tồn tại để lưu tài liệu thực tế
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.warn('[SERVER] Không thể tạo thư mục uploads:', e);
  }
}

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

// Helper to recalculate overall project progress from tasks for a given projectId
function recalculateProjectProgress(projectId = 'da-dacs-01') {
  const stats = db.prepare(`
    SELECT AVG(phan_tram_tien_do) as avg_progress FROM cong_viec WHERE ma_do_an = ?
  `).get(projectId);
  const avg = stats && stats.avg_progress !== null ? Math.round(stats.avg_progress * 10) / 10 : 0.0;
  db.prepare(`UPDATE do_an SET tien_do_tong = ? WHERE ma_do_an = ?`).run(avg, projectId);
  return avg;
}

// Helper to parse topic scale from noi_dung_muc_tieu without altering BCNF schema
function parseTopicMeta(noiDung = '') {
  const trimmed = (noiDung || '').trim();
  const matchSl = trimmed.match(/^\[SL:\s*1-(∞|\d+)\]/i);
  const isOldSolo = /^\[CÁ NHÂN/i.test(trimmed);
  const matchOldGroup = trimmed.match(/^\[NHÓM\s*(\d+)-(\d+|∞)\s*SV\]/i);

  let max = 3;
  let isUnlimited = false;

  if (matchSl) {
    if (matchSl[1] === '∞') {
      isUnlimited = true;
      max = null;
    } else {
      max = parseInt(matchSl[1], 10) || 3;
    }
  } else if (isOldSolo) {
    max = 1;
  } else if (matchOldGroup) {
    if (matchOldGroup[2] === '∞') {
      isUnlimited = true;
      max = null;
    } else {
      max = parseInt(matchOldGroup[2], 10) || 3;
    }
  }

  const isSolo = !isUnlimited && max === 1;
  const cleanDesc = trimmed.replace(/^\[(CÁ NHÂN|NHÓM|SL)[^\]]*\]\s*/i, '').trim();

  let nhanQuyMo = 'Đề tài Nhóm (2-3 SV)';
  if (isSolo) {
    nhanQuyMo = 'Đề tài Cá nhân (1 SV)';
  } else if (isUnlimited) {
    nhanQuyMo = 'Đề tài Nhóm (Không giới hạn SV)';
  } else {
    nhanQuyMo = `Đề tài Nhóm (1 - ${max} SV)`;
  }

  return {
    quy_mo: isSolo ? 'ca_nhan' : 'nhom',
    so_luong_toi_da: max,
    is_unlimited: isUnlimited,
    nhan_quy_mo: nhanQuyMo,
    mo_ta_sach: cleanDesc || trimmed
  };
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

  // 0. GET & POST /api/classes (Quản lý Lớp môn học của GVPTMH)
  if (pathname === 'api/classes' || pathname === '/api/classes') {
    if (method === 'GET') {
      const classes = db.prepare(`SELECT * FROM lop_mon_hoc ORDER BY ma_lop ASC`).all();
      return sendJson(res, 200, classes);
    }
    if (method === 'POST') {
      try {
        const data = await parseBody(req);
        if (!data.ma_lop || !data.ma_lop.trim()) {
          return sendJson(res, 400, { error: 'Vui lòng nhập mã lớp học phần (vd: 21DTHC6)' });
        }
        const classCode = data.ma_lop.trim().toUpperCase();
        const insertClass = db.prepare(`
          INSERT INTO lop_mon_hoc (ma_lop, ten_lop, ten_mon_hoc, hoc_ky, ma_giang_vien, mo_ta)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertClass.run(
          classCode,
          data.ten_lop?.trim() || `Lớp ${classCode}`,
          data.ten_mon_hoc?.trim() || 'Công nghệ phần mềm',
          data.hoc_ky?.trim() || 'Học kỳ 1 • 2026',
          data.ma_giang_vien || 'u-gv-01',
          data.mo_ta?.trim() || 'Lớp học phần mới được Giảng viên phụ trách môn học khởi tạo'
        );
        const created = db.prepare(`SELECT * FROM lop_mon_hoc WHERE ma_lop = ?`).get(classCode);
        return sendJson(res, 201, created);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // 1. GET /api/project?projectId=...
  if (method === 'GET' && (pathname === 'api/project' || pathname === '/api/project')) {
    const requestedId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    recalculateProjectProgress(requestedId);
    let project = db.prepare(`SELECT * FROM do_an WHERE ma_do_an = ?`).get(requestedId);
    if (!project) {
      project = db.prepare(`SELECT * FROM do_an LIMIT 1`).get();
    }
    const meta = parseTopicMeta(project.noi_dung_muc_tieu);
    const team = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(project.ma_do_an) || null;
    const gv = db.prepare(`SELECT ma_nguoi_dung, ho_ten, email FROM nguoi_dung WHERE ma_nguoi_dung = ?`).get(project.ma_giang_vien);
    return sendJson(res, 200, {
      project: { ...project, ...meta },
      team,
      instructor: gv
    });
  }

  // 2. GET /api/users?projectId=...
  if (method === 'GET' && (pathname === 'api/users' || pathname === '/api/users')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    const activeTeam = db.prepare(`SELECT ma_nhom FROM nhom WHERE ma_do_an = ?`).get(projectId);
    const activeTeamId = activeTeam ? activeTeam.ma_nhom : null;

    const users = db.prepare(`
      SELECT u.ma_nguoi_dung, u.email, u.ho_ten, u.vai_tro_he_thong, u.trang_thai_hoat_dong
      FROM nguoi_dung u
      ORDER BY CASE WHEN u.vai_tro_he_thong = 'giangvien' THEN 0 ELSE 1 END, u.ma_nguoi_dung ASC
    `).all();

    // Enrich each user with their role in the active project AND any group they belong to in the class
    const enriched = users.map(u => {
      const activeRoleRow = activeTeamId
        ? db.prepare(`SELECT vai_tro_trong_nhom FROM thanh_vien_nhom WHERE ma_nhom = ? AND ma_nguoi_dung = ?`).get(activeTeamId, u.ma_nguoi_dung)
        : null;

      const allMemberships = db.prepare(`
        SELECT tv.vai_tro_trong_nhom, n.ma_nhom, n.ten_nhom, n.ma_do_an, d.ten_do_an, d.ten_mon_hoc
        FROM thanh_vien_nhom tv
        JOIN nhom n ON tv.ma_nhom = n.ma_nhom
        JOIN do_an d ON n.ma_do_an = d.ma_do_an
        WHERE tv.ma_nguoi_dung = ?
      `).all(u.ma_nguoi_dung);

      return {
        ...u,
        vai_tro_trong_nhom: activeRoleRow ? activeRoleRow.vai_tro_trong_nhom : null,
        danh_sach_nhom: allMemberships,
        da_co_nhom: allMemberships.length > 0
      };
    });

    return sendJson(res, 200, enriched);
  }

  // 3. GET /api/topics (Ngân hàng đề tài lớp học phần & trạng thái đăng ký nhóm/cá nhân)
  if (method === 'GET' && (pathname === 'api/topics' || pathname === '/api/topics')) {
    const projects = db.prepare(`
      SELECT d.*, u.ho_ten as ten_giang_vien, u.email as email_giang_vien
      FROM do_an d
      LEFT JOIN nguoi_dung u ON d.ma_giang_vien = u.ma_nguoi_dung
      ORDER BY d.thoi_gian_tao ASC
    `).all();

    const topics = projects.map(p => {
      recalculateProjectProgress(p.ma_do_an);
      const refreshed = db.prepare(`SELECT tien_do_tong FROM do_an WHERE ma_do_an = ?`).get(p.ma_do_an);
      const meta = parseTopicMeta(p.noi_dung_muc_tieu);
      const team = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(p.ma_do_an) || null;
      let members = [];
      if (team) {
        members = db.prepare(`
          SELECT tv.ma_thanh_vien_nhom, tv.vai_tro_trong_nhom, tv.thoi_gian_tham_gia,
                 u.ma_nguoi_dung, u.ho_ten, u.email
          FROM thanh_vien_nhom tv
          JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
          WHERE tv.ma_nhom = ?
          ORDER BY CASE WHEN tv.vai_tro_trong_nhom = 'nhom_truong' THEN 0 ELSE 1 END
        `).all(team.ma_nhom);
      }
      const msCount = db.prepare(`SELECT COUNT(*) as cnt FROM moc_tien_do WHERE ma_do_an = ?`).get(p.ma_do_an).cnt;
      const taskCount = db.prepare(`SELECT COUNT(*) as cnt FROM cong_viec WHERE ma_do_an = ?`).get(p.ma_do_an).cnt;
      const ghRow = db.prepare(`SELECT repo_url, repo_owner, repo_name, cached_payload_json, last_synced_at FROM lien_ket_github WHERE ma_do_an = ?`).get(p.ma_do_an);
      let ghSummary = { connected: false };
      if (ghRow) {
        let cachedCommits = 0;
        let lastPushAt = null;
        try {
          const parsedGh = ghRow.cached_payload_json ? JSON.parse(ghRow.cached_payload_json) : null;
          cachedCommits = parsedGh?.commits?.length || 0;
          lastPushAt = parsedGh?.commits?.[0]?.date || parsedGh?.repo?.pushedAt || null;
        } catch {}
        ghSummary = {
          connected: true,
          repo_url: ghRow.repo_url,
          repo_slug: `${ghRow.repo_owner}/${ghRow.repo_name}`,
          commit_count: cachedCommits,
          last_pushed_at: lastPushAt,
          last_synced_at: ghRow.last_synced_at
        };
      }

      return {
        ...p,
        tien_do_tong: refreshed ? refreshed.tien_do_tong : p.tien_do_tong,
        ...meta,
        da_dang_ky: Boolean(team),
        team: team ? { ...team, members } : null,
        so_moc: msCount,
        so_cong_viec: taskCount,
        github_summary: ghSummary
      };
    });

    return sendJson(res, 200, topics);
  }

  // 3B. POST /api/topics (Giảng viên tạo đề tài mới - Hỗ trợ cả 1 đề tài hoặc NHIỀU ĐỀ TÀI / BATCH cùng lúc)
  if (method === 'POST' && (pathname === 'api/topics' || pathname === '/api/topics')) {
    try {
      const body = await parseBody(req);
      const topicList = Array.isArray(body) 
        ? body 
        : (Array.isArray(body.topics) ? body.topics : [body]);

      const validTopics = topicList.filter(t => t && t.ten_do_an && t.ten_do_an.trim());
      if (validTopics.length === 0) {
        return sendJson(res, 400, { error: 'Vui lòng cung cấp ít nhất 1 tên đề tài hợp lệ' });
      }

      const insertProject = db.prepare(`
        INSERT INTO do_an (ma_do_an, ten_do_an, loai_do_an, ten_mon_hoc, noi_dung_muc_tieu, tien_do_tong, trang_thai, ma_giang_vien)
        VALUES (?, ?, 'mon_hoc', ?, ?, 0.0, 'dang_thuc_hien', ?)
      `);

      const insertMs = db.prepare(`
        INSERT INTO moc_tien_do (ma_moc, ma_do_an, ten_moc, han_hoan_thanh, trang_thai, noi_dung_mo_ta)
        VALUES (?, ?, ?, ?, 'chua_hoan_thanh', ?)
      `);

      const createdTopics = [];
      const baseTimestamp = Date.now();

      for (let i = 0; i < validTopics.length; i++) {
        const item = validTopics[i];
        const newTopicId = `da-topic-${baseTimestamp}-${i + 1}`;
        const isUnlimited = !!item.is_unlimited || item.so_luong_toi_da === null || item.so_luong_toi_da === 'unlimited';
        const parsedMax = parseInt(item.so_luong_toi_da, 10);
        const maxMembers = isUnlimited ? null : (isNaN(parsedMax) ? (item.quy_mo === 'ca_nhan' ? 1 : 3) : parsedMax);
        const isSolo = !isUnlimited && maxMembers === 1;

        let prefix = '[NHÓM 1-3 SV] ';
        if (isUnlimited) {
          prefix = '[SL: 1-∞] ';
        } else if (isSolo) {
          prefix = '[CÁ NHÂN 1 SV] ';
        } else {
          prefix = `[SL: 1-${maxMembers}] `;
        }

        const rawDesc = (item.noi_dung_muc_tieu || 'Xây dựng ứng dụng phần mềm theo yêu cầu môn học và bảo vệ trước giảng viên.').trim();
        const fullDesc = rawDesc.startsWith('[') ? rawDesc : `${prefix}${rawDesc}`;
        const courseName = (item.ten_mon_hoc || body.ten_mon_hoc || 'Môn: Công nghệ phần mềm • Lớp 21DTHC5').trim();
        const gvId = item.ma_giang_vien || body.ma_giang_vien || 'u-gv-01';

        insertProject.run(newTopicId, item.ten_do_an.trim(), courseName, fullDesc, gvId);

        // Tự động khởi tạo 3 mốc tiến độ chuẩn cho từng đề tài mới
        insertMs.run(`moc-${baseTimestamp}-${i + 1}-1`, newTopicId, 'Mốc 1: Khảo sát yêu cầu & Phân tích nghiệp vụ', '2026-10-10', 'Xác định phạm vi đề tài, danh sách yêu cầu chức năng và sơ đồ Use Case.');
        insertMs.run(`moc-${baseTimestamp}-${i + 1}-2`, newTopicId, 'Mốc 2: Thiết kế CSDL BCNF & Giao diện hệ thống', '2026-10-28', 'Chuẩn hóa lược đồ cơ sở dữ liệu và thiết kế giao diện người dùng.');
        insertMs.run(`moc-${baseTimestamp}-${i + 1}-3`, newTopicId, 'Mốc 3: Lập trình hoàn thiện & Báo cáo nghiệm thu', '2026-11-20', 'Kiểm thử chức năng, hoàn thiện báo cáo thuyết minh và bảo vệ đồ án.');

        createdTopics.push({
          ma_do_an: newTopicId,
          ten_do_an: item.ten_do_an.trim(),
          quy_mo: isSolo ? 'ca_nhan' : 'nhom',
          so_luong_toi_da: maxMembers,
          is_unlimited: isUnlimited
        });
      }

      return sendJson(res, 201, {
        success: true,
        count: createdTopics.length,
        ma_do_an: createdTopics[0].ma_do_an,
        topics: createdTopics
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 3C. POST /api/topics/:id/register-solo (Sinh viên chọn đề tài cá nhân 1 người)
  const registerSoloMatch = pathname.match(/^\/api\/topics\/([^/]+)\/register-solo$/);
  if (method === 'POST' && registerSoloMatch) {
    const topicId = registerSoloMatch[1];
    try {
      const data = await parseBody(req);
      const userId = data.userId;
      if (!userId) return sendJson(res, 400, { error: 'Thiếu mã sinh viên đăng ký' });

      const topic = db.prepare(`SELECT * FROM do_an WHERE ma_do_an = ?`).get(topicId);
      if (!topic) return sendJson(res, 404, { error: 'Không tìm thấy đề tài' });

      const existingTeam = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(topicId);
      if (existingTeam) {
        return sendJson(res, 400, { error: 'Đề tài này đã có người đăng ký!' });
      }

      // Task B3: Kiểm tra sinh viên đã thuộc nhóm nào trong môn học này chưa
      const conflict = db.prepare(`
        SELECT tv.ma_nguoi_dung, u.ho_ten, n.ten_nhom, d.ten_mon_hoc
        FROM thanh_vien_nhom tv
        JOIN nhom n ON tv.ma_nhom = n.ma_nhom
        JOIN do_an d ON n.ma_do_an = d.ma_do_an
        JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
        WHERE d.ten_mon_hoc = ? AND tv.ma_nguoi_dung = ?
        LIMIT 1
      `).get(topic.ten_mon_hoc, userId);

      if (conflict) {
        return sendJson(res, 400, {
          error: `Sinh viên "${conflict.ho_ten}" đã thuộc nhóm "${conflict.ten_nhom}" trong môn học này!`
        });
      }

      const student = db.prepare(`SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = ?`).get(userId);
      if (!student) return sendJson(res, 404, { error: 'Không tìm thấy thông tin sinh viên' });

      const newTeamId = `nhom-solo-${Date.now()}`;
      const teamName = `Cá nhân - ${student.ho_ten}`;

      db.prepare(`INSERT INTO nhom (ma_nhom, ma_do_an, ten_nhom) VALUES (?, ?, ?)`).run(
        newTeamId, topicId, teamName
      );

      db.prepare(`
        INSERT INTO thanh_vien_nhom (ma_thanh_vien_nhom, ma_nhom, ma_nguoi_dung, vai_tro_trong_nhom)
        VALUES (?, ?, ?, 'nhom_truong')
      `).run(`tvn-${Date.now()}`, newTeamId, userId);

      // Tạo sẵn 2 công việc khởi đầu trong Mốc 1 của đề tài để sinh viên vào làm việc ngay
      const firstMs = db.prepare(`SELECT ma_moc FROM moc_tien_do WHERE ma_do_an = ? ORDER BY han_hoan_thanh ASC LIMIT 1`).get(topicId);
      if (firstMs) {
        const insertTask = db.prepare(`
          INSERT INTO cong_viec (
            ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
            trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
            ma_nguoi_thuc_hien, ma_nguoi_tao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        `);
        insertTask.run(
          `cv-${Date.now()}-1`, topicId, firstMs.ma_moc,
          'Lập đặc tả yêu cầu chức năng và kế hoạch thực hiện cá nhân',
          'Xác định các chức năng cốt lõi của đề tài cá nhân và lộ trình hoàn thành từng tuần.',
          'dang_lam', 25.0, '2026-10-12', userId, userId
        );
        insertTask.run(
          `cv-${Date.now()}-2`, topicId, firstMs.ma_moc,
          'Thiết kế kiến trúc dữ liệu và dựng khung giao diện cơ bản',
          'Chuẩn bị lược đồ dữ liệu và khởi tạo source code cho đề tài.',
          'can_lam', 0.0, '2026-10-25', userId, userId
        );
        recalculateProjectProgress(topicId);
      }

      // Thông báo hệ thống
      db.prepare(`
        INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, ma_do_an, loai_thong_bao, tieu_de, noi_dung, trang_thai_doc)
        VALUES (?, ?, ?, 'phan_cong_moi', ?, ?, 0)
      `).run(
        `tb-${Date.now()}`, userId, topicId,
        `Đăng ký thành công đề tài cá nhân: ${topic.ten_do_an}`,
        `Bạn đã nhận đề tài "${topic.ten_do_an}" với tư cách cá nhân tự chủ tiến độ.`
      );

      return sendJson(res, 201, { success: true, ma_do_an: topicId, ma_nhom: newTeamId, ten_nhom: teamName });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 3D. POST /api/topics/:id/register-team (Sinh viên lập nhóm, đặt tên nhóm, chọn nhóm trưởng & đăng ký đề tài)
  const registerTeamMatch = pathname.match(/^\/api\/topics\/([^/]+)\/register-team$/);
  if (method === 'POST' && registerTeamMatch) {
    const topicId = registerTeamMatch[1];
    try {
      const data = await parseBody(req);
      const { ten_nhom, leaderId, memberIds = [] } = data;

      if (!ten_nhom || !ten_nhom.trim()) {
        return sendJson(res, 400, { error: 'Vui lòng đặt tên nhóm thực hiện đồ án' });
      }

      const allUniqueIds = Array.from(new Set([leaderId, ...memberIds].filter(Boolean)));
      if (allUniqueIds.length === 0) {
        return sendJson(res, 400, { error: 'Vui lòng chọn ít nhất 1 sinh viên tham gia nhóm' });
      }

      const effectiveLeaderId = leaderId || allUniqueIds[0];

      const topic = db.prepare(`SELECT * FROM do_an WHERE ma_do_an = ?`).get(topicId);
      if (!topic) return sendJson(res, 404, { error: 'Không tìm thấy đề tài' });

      const existingTeam = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(topicId);
      if (existingTeam) {
        return sendJson(res, 400, { error: 'Đề tài này đã có nhóm khác đăng ký!' });
      }

      // Task B2: Kiểm tra số lượng thành viên linh hoạt theo parseTopicMeta
      const meta = parseTopicMeta(topic.noi_dung_muc_tieu);
      if (!meta.is_unlimited && meta.so_luong_toi_da && allUniqueIds.length > meta.so_luong_toi_da) {
        return sendJson(res, 400, {
          error: `Đề tài này chỉ cho phép tối đa ${meta.so_luong_toi_da} sinh viên! (Bạn đang chọn ${allUniqueIds.length} bạn)`
        });
      }

      // Task B3: Kiểm tra xem có thành viên nào đã thuộc nhóm khác trong môn học này không
      const placeholders = allUniqueIds.map(() => '?').join(',');
      const conflict = db.prepare(`
        SELECT tv.ma_nguoi_dung, u.ho_ten, n.ten_nhom, d.ten_mon_hoc
        FROM thanh_vien_nhom tv
        JOIN nhom n ON tv.ma_nhom = n.ma_nhom
        JOIN do_an d ON n.ma_do_an = d.ma_do_an
        JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
        WHERE d.ten_mon_hoc = ? AND tv.ma_nguoi_dung IN (${placeholders})
        LIMIT 1
      `).get(topic.ten_mon_hoc, ...allUniqueIds);

      if (conflict) {
        return sendJson(res, 400, {
          error: `Sinh viên "${conflict.ho_ten}" đã thuộc nhóm "${conflict.ten_nhom}" trong môn học này!`
        });
      }

      const newTeamId = `nhom-${Date.now()}`;
      db.prepare(`INSERT INTO nhom (ma_nhom, ma_do_an, ten_nhom) VALUES (?, ?, ?)`).run(
        newTeamId, topicId, ten_nhom.trim()
      );

      const insertMember = db.prepare(`
        INSERT INTO thanh_vien_nhom (ma_thanh_vien_nhom, ma_nhom, ma_nguoi_dung, vai_tro_trong_nhom)
        VALUES (?, ?, ?, ?)
      `);

      allUniqueIds.forEach((uid, idx) => {
        const role = uid === effectiveLeaderId ? 'nhom_truong' : 'thanh_vien';
        insertMember.run(`tvn-${Date.now()}-${idx}`, newTeamId, uid, role);
      });

      // Tạo công việc mẫu ban đầu cho Nhóm trưởng và Thành viên trong Mốc 1
      const firstMs = db.prepare(`SELECT ma_moc FROM moc_tien_do WHERE ma_do_an = ? ORDER BY han_hoan_thanh ASC LIMIT 1`).get(topicId);
      if (firstMs) {
        const secondMemberId = allUniqueIds.find(id => id !== effectiveLeaderId) || effectiveLeaderId;
        const insertTask = db.prepare(`
          INSERT INTO cong_viec (
            ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
            trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
            ma_nguoi_thuc_hien, ma_nguoi_tao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        `);
        insertTask.run(
          `cv-${Date.now()}-1`, topicId, firstMs.ma_moc,
          'Thống nhất phân công nhiệm vụ nhóm & Đặc tả yêu cầu đề tài',
          `Nhóm trưởng triển khai kế hoạch thực hiện đề tài "${topic.ten_do_an}" cho các thành viên.`,
          'dang_lam', 50.0, '2026-10-12', effectiveLeaderId, effectiveLeaderId
        );
        insertTask.run(
          `cv-${Date.now()}-2`, topicId, firstMs.ma_moc,
          'Thiết kế sơ đồ Use Case và lược đồ CSDL chuẩn BCNF',
          'Phối hợp hoàn thiện tài liệu thiết kế hệ thống và chuẩn bị báo cáo tiến độ mốc 1.',
          'can_lam', 0.0, '2026-10-20', secondMemberId, effectiveLeaderId
        );
        recalculateProjectProgress(topicId);
      }

      // Gửi thông báo cho tất cả thành viên trong nhóm mới
      const insertNotif = db.prepare(`
        INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, ma_do_an, loai_thong_bao, tieu_de, noi_dung, trang_thai_doc)
        VALUES (?, ?, ?, 'phan_cong_moi', ?, ?, 0)
      `);
      allUniqueIds.forEach((uid, idx) => {
        const isLdr = uid === leaderId;
        insertNotif.run(
          `tb-${Date.now()}-${idx}`, uid, topicId,
          `Chào mừng đến với ${ten_nhom.trim()}`,
          `Bạn đã tham gia "${ten_nhom.trim()}" thực hiện đề tài "${topic.ten_do_an}" với vai trò ${isLdr ? 'Nhóm trưởng' : 'Thành viên'}.`
        );
      });

      return sendJson(res, 201, {
        success: true,
        ma_do_an: topicId,
        ma_nhom: newTeamId,
        ten_nhom: ten_nhom.trim()
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 3E. POST /api/topics/:id/reset (Đặt lại đề tài về trạng thái trống để thuận tiện demo nhiều lần)
  const resetTopicMatch = pathname.match(/^\/api\/topics\/([^/]+)\/reset$/);
  if (method === 'POST' && resetTopicMatch) {
    const topicId = resetTopicMatch[1];
    if (topicId === 'da-dacs-01') {
      return sendJson(res, 400, { error: 'Không thể đặt lại đề tài mẫu gốc của Nhóm 05.' });
    }
    try {
      db.prepare(`DELETE FROM nhom WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM cong_viec WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`UPDATE do_an SET tien_do_tong = 0.0 WHERE ma_do_an = ?`).run(topicId);
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 3F. DELETE /api/topics/:id (Giảng viên xóa đề tài khỏi Ngân hàng đề tài)
  const deleteTopicMatch = pathname.match(/^\/?api\/topics\/([^/?#]+)$/);
  if (method === 'DELETE' && deleteTopicMatch) {
    const topicId = decodeURIComponent(deleteTopicMatch[1]);
    if (topicId === 'da-dacs-01') {
      return sendJson(res, 400, { error: 'Không thể xóa đề tài mẫu gốc của Nhóm 05.' });
    }
    try {
      const topic = db.prepare(`SELECT * FROM do_an WHERE ma_do_an = ?`).get(topicId);
      if (!topic) {
        return sendJson(res, 404, { error: 'Không tìm thấy đề tài để xóa' });
      }

      // Xóa sạch dữ liệu cascade của đề tài để bảo toàn tính toàn vẹn CSDL
      db.prepare(`DELETE FROM thong_bao WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM tep_dinh_kem WHERE ma_cong_viec IN (SELECT ma_cong_viec FROM cong_viec WHERE ma_do_an = ?)`).run(topicId);
      db.prepare(`DELETE FROM binh_luan WHERE ma_cong_viec IN (SELECT ma_cong_viec FROM cong_viec WHERE ma_do_an = ?)`).run(topicId);
      db.prepare(`DELETE FROM cong_viec WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM moc_tien_do WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM thanh_vien_nhom WHERE ma_nhom IN (SELECT ma_nhom FROM nhom WHERE ma_do_an = ?)`).run(topicId);
      db.prepare(`DELETE FROM nhom WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM lien_ket_github WHERE ma_do_an = ?`).run(topicId);
      db.prepare(`DELETE FROM do_an WHERE ma_do_an = ?`).run(topicId);

      return sendJson(res, 200, {
        success: true,
        message: `Đã xóa đề tài "${topic.ten_do_an}" thành công!`
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 4. GET /api/milestones?projectId=...
  if (method === 'GET' && (pathname === 'api/milestones' || pathname === '/api/milestones')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    const milestones = db.prepare(`
      SELECT m.*, 
        COUNT(c.ma_cong_viec) as tong_so_viec,
        SUM(CASE WHEN c.trang_thai = 'hoan_thanh' THEN 1 ELSE 0 END) as so_viec_hoan_thanh
      FROM moc_tien_do m
      LEFT JOIN cong_viec c ON m.ma_moc = c.ma_moc
      WHERE m.ma_do_an = ?
      GROUP BY m.ma_moc
      ORDER BY m.han_hoan_thanh ASC
    `).all(projectId);
    return sendJson(res, 200, milestones);
  }

  // 5. GET /api/tasks?projectId=...
  if (method === 'GET' && (pathname === 'api/tasks' || pathname === '/api/tasks')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    const milestoneId = parsedUrl.searchParams.get('milestoneId');
    const assigneeId = parsedUrl.searchParams.get('assigneeId');

    let query = `
      SELECT c.*, 
        u.ho_ten as ten_nguoi_thuc_hien,
        m.ten_moc
      FROM cong_viec c
      LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
      LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
      WHERE c.ma_do_an = ?
    `;
    const params = [projectId];

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

  // 6. POST /api/tasks (Giao việc mới)
  if (method === 'POST' && (pathname === 'api/tasks' || pathname === '/api/tasks')) {
    try {
      const data = await parseBody(req);
      const newId = `cv-${Date.now()}`;
      const projectId = data.ma_do_an || 'da-dacs-01';
      const stmt = db.prepare(`
        INSERT INTO cong_viec (
          ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
          trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
          ma_nguoi_thuc_hien, ma_nguoi_tao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        newId,
        projectId,
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
      recalculateProjectProgress(projectId);
      const created = db.prepare(`
        SELECT c.*, u.ho_ten as ten_nguoi_thuc_hien, m.ten_moc
        FROM cong_viec c
        LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
        LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
        WHERE c.ma_cong_viec = ?
      `).get(newId);
      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 7. PATCH /api/tasks/:id (Cập nhật tiến độ / trạng thái việc)
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

      recalculateProjectProgress(task.ma_do_an);
      const updated = db.prepare(`
        SELECT c.*, u.ho_ten as ten_nguoi_thuc_hien, m.ten_moc
        FROM cong_viec c
        LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
        LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
        WHERE c.ma_cong_viec = ?
      `).get(taskId);
      return sendJson(res, 200, updated);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 8. POST /api/tasks/:id/lock (Khóa tiến độ)
  const lockMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/lock$/);
  if (method === 'POST' && lockMatch) {
    const taskId = lockMatch[1];
    const data = await parseBody(req);
    db.prepare(`
      UPDATE cong_viec 
      SET trang_thai_khoa = 1, ma_nguoi_khoa = ? 
      WHERE ma_cong_viec = ?
    `).run(data.userId || 'u-gv-01', taskId);
    const updated = db.prepare(`
      SELECT c.*, u.ho_ten as ten_nguoi_thuc_hien, m.ten_moc
      FROM cong_viec c
      LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
      LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
      WHERE c.ma_cong_viec = ?
    `).get(taskId);
    return sendJson(res, 200, updated);
  }

  // 9. POST /api/tasks/:id/unlock (Mở khóa tiến độ)
  const unlockMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/unlock$/);
  if (method === 'POST' && unlockMatch) {
    const taskId = unlockMatch[1];
    db.prepare(`
      UPDATE cong_viec 
      SET trang_thai_khoa = 0, ma_nguoi_khoa = NULL 
      WHERE ma_cong_viec = ?
    `).run(taskId);
    const updated = db.prepare(`
      SELECT c.*, u.ho_ten as ten_nguoi_thuc_hien, m.ten_moc
      FROM cong_viec c
      LEFT JOIN nguoi_dung u ON c.ma_nguoi_thuc_hien = u.ma_nguoi_dung
      LEFT JOIN moc_tien_do m ON c.ma_moc = m.ma_moc
      WHERE c.ma_cong_viec = ?
    `).get(taskId);
    return sendJson(res, 200, updated);
  }

  // 10. GET & POST /api/tasks/:id/comments
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

  // 11. GET & POST /api/tasks/:id/attachments
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
      try {
        const data = await parseBody(req);
        const newFileId = `tep-${Date.now()}`;
        const rawFileName = data.ten_tep || `tai-lieu-${Date.now()}.bin`;

        // Chuẩn hóa tên tệp lưu trên ổ đĩa để tránh ký tự đặc biệt & xung đột
        const ext = path.extname(rawFileName) || '';
        const baseName = path.basename(rawFileName, ext).replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_');
        const safeDiskName = `${Date.now()}_${baseName}${ext}`;
        const relativeFilePath = `/uploads/${safeDiskName}`;
        const targetDiskPath = path.join(uploadsDir, safeDiskName);

        // Ghi tệp nhị phân thực tế xuống đĩa cứng nếu gửi kèm base64
        let fileSize = data.dung_luong || 0;
        if (data.du_lieu_base64) {
          const base64Data = data.du_lieu_base64.replace(/^data:.*?;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(targetDiskPath, buffer);
          fileSize = buffer.length;
        }

        db.prepare(`
          INSERT INTO tep_dinh_kem (ma_tep, ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          newFileId, taskId, data.userId || 'u-sv-01',
          rawFileName, relativeFilePath,
          data.loai_tep || 'application/octet-stream',
          fileSize
        );
        return sendJson(res, 201, { success: true, ma_tep: newFileId, duong_dan_tep: relativeFilePath });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // 11B. DELETE /api/attachments/:id hoặc /api/tasks/:taskId/attachments/:id (Xóa tệp đính kèm thật)
  const deleteFileMatch = pathname.match(/^\/?api\/attachments\/([^/]+)$/) || pathname.match(/^\/?api\/tasks\/[^/]+\/attachments\/([^/]+)$/);
  if (method === 'DELETE' && deleteFileMatch) {
    const fileId = decodeURIComponent(deleteFileMatch[1]);
    try {
      const file = db.prepare(`SELECT * FROM tep_dinh_kem WHERE ma_tep = ?`).get(fileId);
      if (file) {
        if (file.duong_dan_tep && file.duong_dan_tep.startsWith('/uploads/')) {
          const diskRel = file.duong_dan_tep.replace(/^\/uploads\//, '');
          const diskPath = path.join(uploadsDir, diskRel);
          if (diskPath.startsWith(uploadsDir) && fs.existsSync(diskPath)) {
            try { fs.unlinkSync(diskPath); } catch (e) {}
          }
        }
        db.prepare(`DELETE FROM tep_dinh_kem WHERE ma_tep = ?`).run(fileId);
      }
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 12. POST /api/auth/login — Đăng nhập bằng email
  if (method === 'POST' && (pathname === 'api/auth/login' || pathname === '/api/auth/login')) {
    try {
      const data = await parseBody(req);
      const email = (data.email || '').trim();
      if (!email) return sendJson(res, 400, { error: 'Thiếu email đăng nhập' });

      const user = db.prepare(`
        SELECT u.ma_nguoi_dung, u.email, u.ho_ten, u.vai_tro_he_thong, u.trang_thai_hoat_dong,
               tv.vai_tro_trong_nhom
        FROM nguoi_dung u
        LEFT JOIN thanh_vien_nhom tv ON u.ma_nguoi_dung = tv.ma_nguoi_dung
        WHERE LOWER(u.email) = LOWER(?) AND u.trang_thai_hoat_dong = 1
      `).get(email);

      if (!user) return sendJson(res, 401, { error: 'Email không tồn tại trong lớp hoặc tài khoản bị vô hiệu hóa' });
      return sendJson(res, 200, { success: true, user });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 12. GET /api/team?projectId=...
  if (method === 'GET' && (pathname === 'api/team' || pathname === '/api/team')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    const team = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(projectId);
    const members = team
      ? db.prepare(`
          SELECT tv.ma_thanh_vien_nhom, tv.vai_tro_trong_nhom, tv.thoi_gian_tham_gia,
                 u.ma_nguoi_dung, u.ho_ten, u.email, u.vai_tro_he_thong
          FROM thanh_vien_nhom tv
          JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
          WHERE tv.ma_nhom = ?
          ORDER BY CASE WHEN tv.vai_tro_trong_nhom = 'nhom_truong' THEN 0 ELSE 1 END
        `).all(team.ma_nhom)
      : [];
    const gv = db.prepare(`SELECT * FROM nguoi_dung WHERE vai_tro_he_thong = 'giangvien' LIMIT 1`).get();
    return sendJson(res, 200, { members, instructor: gv, team });
  }

  // 13. GET /api/notifications
  if (method === 'GET' && (pathname === 'api/notifications' || pathname === '/api/notifications')) {
    const userId = parsedUrl.searchParams.get('userId');
    const query = userId 
      ? `SELECT * FROM thong_bao WHERE ma_nguoi_dung = ? ORDER BY thoi_gian_tao DESC`
      : `SELECT * FROM thong_bao ORDER BY thoi_gian_tao DESC`;
    const notifications = userId ? db.prepare(query).all(userId) : db.prepare(query).all();
    return sendJson(res, 200, notifications);
  }

  // ==========================================
  // 14. GITHUB DASHBOARD INTEGRATION APIs
  // ==========================================
  function parseGithubRepoUrl(inputUrl = '') {
    const trimmed = inputUrl.trim().replace(/\.git$/i, '').replace(/\/+$/, '');
    const matchUrl = trimmed.match(/github\.com\/([^/\s]+)\/([^/\s]+)/i);
    if (matchUrl) {
      return { owner: matchUrl[1], repo: matchUrl[2], cleanUrl: `https://github.com/${matchUrl[1]}/${matchUrl[2]}` };
    }
    const matchSlug = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (matchSlug) {
      return { owner: matchSlug[1], repo: matchSlug[2], cleanUrl: `https://github.com/${matchSlug[1]}/${matchSlug[2]}` };
    }
    return null;
  }

  async function fetchGithubSnapshot(owner, repo, token = '') {
    const headers = {
      'User-Agent': 'DACS-Project-Tracker/1.0',
      'Accept': 'application/vnd.github+json'
    };
    if (token && token.trim()) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    const ghFetch = async (url) => {
      const r = await fetch(url, { headers });
      if (!r.ok) {
        const errBody = await r.json().catch(() => ({}));
        const msg = errBody.message || `GitHub HTTP ${r.status}`;
        if (r.status === 404) throw new Error(`Không tìm thấy Repository "${owner}/${repo}" (hoặc Repo ở chế độ Private cần Token).`);
        if (r.status === 403 && /rate limit/i.test(msg)) throw new Error('Đã chạm giới hạn truy vấn miễn phí của GitHub API (60 req/giờ). Hãy gắn Personal Access Token hoặc dùng dữ liệu cache.');
        throw new Error(`Lỗi GitHub API: ${msg}`);
      }
      return r.json();
    };

    const [repoInfo, commitsRaw, contributorsRaw, branchesRaw, pullsRaw] = await Promise.all([
      ghFetch(`https://api.github.com/repos/${owner}/${repo}`),
      ghFetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=35`),
      ghFetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=30`).catch(() => []),
      ghFetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=20`).catch(() => []),
      ghFetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=15`).catch(() => [])
    ]);

    return {
      repo: {
        fullName: repoInfo.full_name,
        description: repoInfo.description || '',
        htmlUrl: repoInfo.html_url,
        defaultBranch: repoInfo.default_branch,
        stars: repoInfo.stargazers_count || 0,
        forks: repoInfo.forks_count || 0,
        openIssues: repoInfo.open_issues_count || 0,
        visibility: repoInfo.private ? 'private' : 'public',
        pushedAt: repoInfo.pushed_at,
        updatedAt: repoInfo.updated_at
      },
      commits: (Array.isArray(commitsRaw) ? commitsRaw : []).map(c => ({
        sha: c.sha,
        shortSha: (c.sha || '').slice(0, 7),
        message: c.commit?.message || '',
        authorLogin: c.author?.login || c.committer?.login || null,
        authorName: c.commit?.author?.name || c.author?.login || 'Unknown',
        authorEmail: c.commit?.author?.email || '',
        authorAvatar: c.author?.avatar_url || null,
        date: c.commit?.author?.date || c.commit?.committer?.date || null,
        htmlUrl: c.html_url
      })),
      contributors: (Array.isArray(contributorsRaw) ? contributorsRaw : []).map(ct => ({
        login: ct.login,
        avatarUrl: ct.avatar_url,
        htmlUrl: ct.html_url,
        contributions: ct.contributions || 0
      })),
      branches: (Array.isArray(branchesRaw) ? branchesRaw : []).map(b => ({
        name: b.name,
        protected: Boolean(b.protected)
      })),
      pulls: (Array.isArray(pullsRaw) ? pullsRaw : []).map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.merged_at ? 'merged' : pr.state,
        userLogin: pr.user?.login || '',
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
        htmlUrl: pr.html_url
      }))
    };
  }

  function buildGithubDashboardResponse(linkRow, projectId) {
    if (!linkRow) {
      return { connected: false, config: null, dashboard: null };
    }

    let mapping = {};
    try { mapping = JSON.parse(linkRow.member_mapping_json || '{}'); } catch {}

    let payload = null;
    try { payload = linkRow.cached_payload_json ? JSON.parse(linkRow.cached_payload_json) : null; } catch {}

    // Lấy danh sách thành viên trong nhóm của dự án
    const team = db.prepare(`SELECT * FROM nhom WHERE ma_do_an = ?`).get(projectId);
    const members = team
      ? db.prepare(`
          SELECT tv.vai_tro_trong_nhom, u.ma_nguoi_dung, u.ho_ten, u.email
          FROM thanh_vien_nhom tv
          JOIN nguoi_dung u ON tv.ma_nguoi_dung = u.ma_nguoi_dung
          WHERE tv.ma_nhom = ?
          ORDER BY CASE WHEN tv.vai_tro_trong_nhom = 'nhom_truong' THEN 0 ELSE 1 END
        `).all(team.ma_nhom)
      : [];

    // Reverse lookup: githubLogin (lowercase) -> member
    const loginToMember = {};
    const emailToMember = {};
    members.forEach(m => {
      if (m.email) emailToMember[m.email.toLowerCase()] = m;
      const mappedLogin = mapping[m.ma_nguoi_dung];
      if (mappedLogin && mappedLogin.trim()) {
        loginToMember[mappedLogin.trim().toLowerCase()] = m;
      }
    });

    const commits = (payload?.commits || []).map(c => {
      const loginKey = (c.authorLogin || '').toLowerCase();
      const emailKey = (c.authorEmail || '').toLowerCase();
      const matched = loginToMember[loginKey] || emailToMember[emailKey] || null;
      return {
        ...c,
        mappedUserId: matched?.ma_nguoi_dung || null,
        mappedUserName: matched?.ho_ten || null
      };
    });

    // Thống kê theo từng thành viên nhóm
    const totalRecentCommits = commits.length;
    const memberStats = members.map(m => {
      const myCommits = commits.filter(c => c.mappedUserId === m.ma_nguoi_dung);
      const ghLogin = mapping[m.ma_nguoi_dung] || '';
      const contributorRecord = (payload?.contributors || []).find(
        ct => ghLogin && ct.login.toLowerCase() === ghLogin.toLowerCase()
      );
      return {
        ma_nguoi_dung: m.ma_nguoi_dung,
        ho_ten: m.ho_ten,
        email: m.email,
        vai_tro_trong_nhom: m.vai_tro_trong_nhom,
        github_username: ghLogin,
        recentCommitCount: myCommits.length,
        totalContributions: contributorRecord?.contributions ?? myCommits.length,
        sharePercent: totalRecentCommits > 0 ? Math.round((myCommits.length / totalRecentCommits) * 100) : 0,
        latestCommit: myCommits[0] || null,
        avatarUrl: contributorRecord?.avatarUrl || myCommits[0]?.authorAvatar || null
      };
    });

    return {
      connected: true,
      config: {
        ma_do_an: linkRow.ma_do_an,
        repo_url: linkRow.repo_url,
        repo_owner: linkRow.repo_owner,
        repo_name: linkRow.repo_name,
        default_branch: linkRow.default_branch,
        hasToken: Boolean(linkRow.access_token),
        member_mapping: mapping,
        last_synced_at: linkRow.last_synced_at
      },
      dashboard: payload ? {
        ...payload,
        commits,
        memberStats
      } : null
    };
  }

  // 14A. GET /api/github/dashboard?projectId=...
  if (method === 'GET' && (pathname === 'api/github/dashboard' || pathname === '/api/github/dashboard')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    let linkRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
    if (!linkRow) {
      return sendJson(res, 200, { connected: false, config: null, dashboard: null });
    }
    // Nếu mới seed chưa có cache thì tự đồng bộ lần đầu (không làm lỗi nếu offline)
    if (!linkRow.cached_payload_json) {
      try {
        const snapshot = await fetchGithubSnapshot(linkRow.repo_owner, linkRow.repo_name, linkRow.access_token || '');
        const nowIso = new Date().toISOString();
        db.prepare(`
          UPDATE lien_ket_github
          SET cached_payload_json = ?, default_branch = ?, last_synced_at = ?
          WHERE ma_do_an = ?
        `).run(JSON.stringify(snapshot), snapshot.repo.defaultBranch || linkRow.default_branch, nowIso, projectId);
        linkRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      } catch (err) {
        const resp = buildGithubDashboardResponse(linkRow, projectId);
        resp.syncWarning = err.message;
        return sendJson(res, 200, resp);
      }
    }
    return sendJson(res, 200, buildGithubDashboardResponse(linkRow, projectId));
  }

  // 14B. POST /api/github/connect (Kết nối / đổi repo GitHub cho đồ án)
  if (method === 'POST' && (pathname === 'api/github/connect' || pathname === '/api/github/connect')) {
    try {
      const data = await parseBody(req);
      const projectId = data.projectId || 'da-dacs-01';
      const parsed = parseGithubRepoUrl(data.repoUrl || '');
      if (!parsed) {
        return sendJson(res, 400, { error: 'URL Repository GitHub không hợp lệ. Ví dụ đúng: https://github.com/owner/repo' });
      }

      const existing = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      const tokenToUse = data.accessToken !== undefined ? (data.accessToken || '').trim() : (existing?.access_token || '');
      const mappingJson = data.memberMapping
        ? JSON.stringify(data.memberMapping)
        : (existing?.member_mapping_json || '{}');

      // Gọi GitHub API ngay để xác nhận repo tồn tại và lấy snapshot
      const snapshot = await fetchGithubSnapshot(parsed.owner, parsed.repo, tokenToUse);
      const nowIso = new Date().toISOString();

      if (existing) {
        db.prepare(`
          UPDATE lien_ket_github
          SET repo_url = ?, repo_owner = ?, repo_name = ?, default_branch = ?,
              access_token = ?, member_mapping_json = ?, cached_payload_json = ?, last_synced_at = ?
          WHERE ma_do_an = ?
        `).run(
          parsed.cleanUrl, parsed.owner, parsed.repo, snapshot.repo.defaultBranch || 'main',
          tokenToUse || null, mappingJson, JSON.stringify(snapshot), nowIso, projectId
        );
      } else {
        db.prepare(`
          INSERT INTO lien_ket_github (
            ma_lien_ket, ma_do_an, repo_url, repo_owner, repo_name, default_branch,
            access_token, member_mapping_json, cached_payload_json, last_synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `gh-${Date.now()}`, projectId, parsed.cleanUrl, parsed.owner, parsed.repo,
          snapshot.repo.defaultBranch || 'main', tokenToUse || null, mappingJson, JSON.stringify(snapshot), nowIso
        );
      }

      const updatedRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      return sendJson(res, 200, buildGithubDashboardResponse(updatedRow, projectId));
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 14C. POST /api/github/sync?projectId=... (Đồng bộ dữ liệu mới nhất từ GitHub)
  if (method === 'POST' && (pathname === 'api/github/sync' || pathname === '/api/github/sync')) {
    try {
      const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
      const linkRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      if (!linkRow) {
        return sendJson(res, 404, { error: 'Dự án này chưa kết nối Repository GitHub.' });
      }
      const snapshot = await fetchGithubSnapshot(linkRow.repo_owner, linkRow.repo_name, linkRow.access_token || '');
      const nowIso = new Date().toISOString();
      db.prepare(`
        UPDATE lien_ket_github
        SET cached_payload_json = ?, default_branch = ?, last_synced_at = ?
        WHERE ma_do_an = ?
      `).run(JSON.stringify(snapshot), snapshot.repo.defaultBranch || linkRow.default_branch, nowIso, projectId);
      const updatedRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      return sendJson(res, 200, buildGithubDashboardResponse(updatedRow, projectId));
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 14D. POST /api/github/mapping (Gắn GitHub username cho từng thành viên trong nhóm)
  if (method === 'POST' && (pathname === 'api/github/mapping' || pathname === '/api/github/mapping')) {
    try {
      const data = await parseBody(req);
      const projectId = data.projectId || 'da-dacs-01';
      const linkRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      if (!linkRow) {
        return sendJson(res, 404, { error: 'Dự án này chưa kết nối Repository GitHub.' });
      }
      db.prepare(`UPDATE lien_ket_github SET member_mapping_json = ? WHERE ma_do_an = ?`).run(
        JSON.stringify(data.mapping || {}), projectId
      );
      const updatedRow = db.prepare(`SELECT * FROM lien_ket_github WHERE ma_do_an = ?`).get(projectId);
      return sendJson(res, 200, buildGithubDashboardResponse(updatedRow, projectId));
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 14E. DELETE /api/github/connect?projectId=... (Ngắt kết nối repo)
  if (method === 'DELETE' && (pathname === 'api/github/connect' || pathname === '/api/github/connect')) {
    const projectId = parsedUrl.searchParams.get('projectId') || 'da-dacs-01';
    db.prepare(`DELETE FROM lien_ket_github WHERE ma_do_an = ?`).run(projectId);
    return sendJson(res, 200, { success: true });
  }

  // ==========================================
  // SERVE UPLOADED FILES (/uploads/...)
  // ==========================================
  if (pathname.startsWith('/uploads/')) {
    const safeRel = decodeURIComponent(pathname.replace(/^\/uploads\//, ''));
    const uploadFilePath = path.join(uploadsDir, safeRel);

    if (!uploadFilePath.startsWith(uploadsDir)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(uploadFilePath) && fs.statSync(uploadFilePath).isFile()) {
      const ext = path.extname(uploadFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(uploadFilePath))}"`
      });
      return fs.createReadStream(uploadFilePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('404 Không tìm thấy tệp đính kèm');
    }
  }

  // ==========================================
  // STATIC FILE SERVING (React build in dist/ or fallback)
  // ==========================================
  const distDir = path.join(__dirname, 'dist');
  const publicDir = path.join(__dirname, 'public');
  const hasDist = fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'));
  const staticRoot = hasDist ? distDir : __dirname;
  
  let relPath = pathname === '/' ? 'index.html' : pathname;
  let filePath = path.join(staticRoot, relPath);
  const isStaticAsset = /\.(png|jpg|jpeg|svg|ico|css|js|map|woff|woff2|ttf)$/i.test(pathname);

  // Fallback check in public folder if asset not found in dist
  if (!fs.existsSync(filePath)) {
    const pubCandidate = path.join(publicDir, relPath);
    if (fs.existsSync(pubCandidate)) {
      filePath = pubCandidate;
    }
  }

  // Security: Prevent Directory Traversal
  if (!filePath.startsWith(staticRoot) && !filePath.startsWith(__dirname) && !filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // SPA fallback ONLY for page routes, NEVER for static assets (images, css, js)
  if (!fs.existsSync(filePath)) {
    if (!isStaticAsset) {
      const fallbackPath = path.join(staticRoot, 'index.html');
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end(`404 Asset Not Found: ${pathname}`);
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isStaticAsset ? 'public, max-age=300' : 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[SERVER] Fullstack SQLite API Server đang chạy tại: http://localhost:${PORT}`);
});
