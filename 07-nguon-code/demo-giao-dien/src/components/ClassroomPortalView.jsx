import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function ClassroomPortalView() {
  const {
    classes,
    activeClassId,
    setActiveClassId,
    createClass,
    topics,
    users,
    currentUser,
    currentUserId,
    setCurrentUserId,
    isLecturer,
    studentProject,
    chibiMode,
    enterWorkspace,
    createTopic,
    registerSoloTopic,
    registerTeamTopic,
    resetTopicRegistration
  } = useProject();

  // Bộ lọc & tìm kiếm cho Bảng Tổng hợp Lớp duy nhất của GVPTMH
  const [lecturerFilter, setLecturerFilter] = useState('all'); // 'all' | 'active' | 'open' | 'unassigned_sv'
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [studentTopicFilter, setStudentTopicFilter] = useState('all'); // 'all' | 'open' | 'taken'

  // Modals
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [teamModalTopic, setTeamModalTopic] = useState(null);
  const [soloConfirmTopic, setSoloConfirmTopic] = useState(null);
  const [detailTopicModal, setDetailTopicModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo lớp mới
  const [classForm, setClassForm] = useState({
    ma_lop: '',
    ten_lop: '',
    ten_mon_hoc: 'Công nghệ phần mềm',
    hoc_ky: 'Học kỳ 1 • 2026',
    mo_ta: ''
  });

  // Chế độ nhập đề tài: 'rows' (Nhiều dòng linh hoạt) | 'bulk' (Dán danh sách nhanh từ Word/Excel)
  const [topicInputMode, setTopicInputMode] = useState('rows');

  // Danh sách các dòng đề tài nhập cùng lúc (cho phép thêm nhiều đề tài cho 1 lớp)
  const [topicRows, setTopicRows] = useState([
    { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
    { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
  ]);

  // Văn bản dán nhanh hàng loạt
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultScale, setBulkDefaultScale] = useState('nhom'); // 'nhom' | 'ca_nhan' | 'alternate'

  // Form cũ tương thích
  const [newTopicForm, setNewTopicForm] = useState({
    ten_do_an: '',
    quy_mo: 'nhom',
    ten_mon_hoc: 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    noi_dung_muc_tieu: ''
  });

  // Form lập nhóm & chọn nhóm trưởng
  const [teamForm, setTeamForm] = useState({
    ten_nhom: '',
    leaderId: '',
    memberIds: []
  });

  // Modal nhận đề tài cá nhân
  const [soloStudentId, setSoloStudentId] = useState('');

  // Danh sách sinh viên
  const students = useMemo(() => {
    return users.filter(u => u.vai_tro_he_thong === 'sinhvien');
  }, [users]);

  // Các nhóm đã hình thành trong lớp
  const registeredGroups = useMemo(() => {
    return topics.filter(t => t.da_dang_ky);
  }, [topics]);

  // Đề tài còn trống chờ đăng ký
  const openTopics = useMemo(() => {
    return topics.filter(t => !t.da_dang_ky);
  }, [topics]);

  // Sinh viên chưa có nhóm & tiến độ trung bình lớp (phục vụ thanh tổng hợp GVPTMH)
  const unassignedStudents = useMemo(() => {
    return students.filter(s => !s.da_co_nhom);
  }, [students]);

  const averageClassProgress = useMemo(() => {
    if (registeredGroups.length === 0) return 0;
    const sum = registeredGroups.reduce((acc, g) => acc + Number(g.tien_do_tong || 0), 0);
    return Math.round(sum / registeredGroups.length);
  }, [registeredGroups]);

  const filteredLecturerTopics = useMemo(() => {
    const keyword = lecturerSearch.trim().toLowerCase();
    return topics.filter(t => {
      if (lecturerFilter === 'active' && !t.da_dang_ky) return false;
      if (lecturerFilter === 'open' && t.da_dang_ky) return false;
      if (!keyword) return true;
      const inTitle = (t.ten_do_an || '').toLowerCase().includes(keyword);
      const inTeam = (t.team?.ten_nhom || '').toLowerCase().includes(keyword);
      const inMembers = (t.team?.members || []).some(m => (m.ho_ten || '').toLowerCase().includes(keyword));
      return inTitle || inTeam || inMembers;
    });
  }, [topics, lecturerFilter, lecturerSearch]);

  const filteredUnassignedStudents = useMemo(() => {
    const keyword = lecturerSearch.trim().toLowerCase();
    if (!keyword) return unassignedStudents;
    return unassignedStudents.filter(s =>
      (s.ho_ten || '').toLowerCase().includes(keyword) ||
      (s.email || '').toLowerCase().includes(keyword)
    );
  }, [unassignedStudents, lecturerSearch]);

  // Thông tin lớp hiện tại
  const currentClassInfo = useMemo(() => {
    return classes.find(c => c.ma_lop === activeClassId) || {
      ma_lop: '21DTHC5',
      ten_lop: 'Lớp 21DTHC5 - CNPM',
      ten_mon_hoc: 'Công nghệ phần mềm',
      hoc_ky: 'Học kỳ 1 • 2026',
      mo_ta: 'Lớp học phần chính thức môn Công nghệ phần mềm'
    };
  }, [classes, activeClassId]);

  // Sinh viên hiện tại đã có nhóm hay chưa
  const hasEnrolledProject = Boolean(studentProject);

  // Thao tác Tạo Lớp mới (GVPTMH)
  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.ma_lop.trim()) return;
    try {
      setSubmitting(true);
      await createClass(classForm);
      setClassForm({
        ma_lop: '',
        ten_lop: '',
        ten_mon_hoc: 'Công nghệ phần mềm',
        hoc_ky: 'Học kỳ 1 • 2026',
        mo_ta: ''
      });
      setIsCreateClassModalOpen(false);
      alert('Tạo Lớp môn học mới thành công!');
    } catch (err) {
      alert(`Lỗi tạo lớp: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Thêm dòng đề tài mới vào danh sách
  const handleAddTopicRow = () => {
    setTopicRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ten_do_an: '',
        quy_mo: prev.length % 2 === 0 ? 'nhom' : 'ca_nhan',
        noi_dung_muc_tieu: ''
      }
    ]);
  };

  // Xóa một dòng đề tài
  const handleRemoveTopicRow = (id) => {
    if (topicRows.length <= 1) return;
    setTopicRows(prev => prev.filter(r => r.id !== id));
  };

  // Cập nhật giá trị trường dữ liệu của 1 dòng
  const handleUpdateTopicRow = (id, field, value) => {
    setTopicRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Nạp 4 đề tài mẫu phong phú chuẩn CNPM cho lớp
  const handleLoadSampleTopics = () => {
    setTopicRows([
      {
        id: Date.now() + 1,
        ten_do_an: 'Xây dựng cổng tra cứu thông tin học vụ và lịch thi tích hợp AI Chatbot',
        quy_mo: 'nhom',
        noi_dung_muc_tieu: 'Hệ thống web SPA hỗ trợ sinh viên tra cứu điểm thi, học phí và hỏi đáp quy chế học vụ qua AI.'
      },
      {
        id: Date.now() + 2,
        ten_do_an: 'Hệ thống quản lý điểm rèn luyện và hoạt động phong trào sinh viên',
        quy_mo: 'nhom',
        noi_dung_muc_tieu: 'Nền tảng trực tuyến chấm điểm rèn luyện minh bạch, duyệt minh chứng tham gia phong trào Khoa CNTT.'
      },
      {
        id: Date.now() + 3,
        ten_do_an: 'Ứng dụng nhắc nhở thời khóa biểu và lộ trình chứng chỉ tốt nghiệp',
        quy_mo: 'ca_nhan',
        noi_dung_muc_tieu: 'Module theo dõi tiến độ tích lũy chứng chỉ ngoại ngữ, tin học và cảnh báo học vụ cá nhân theo tuần.'
      },
      {
        id: Date.now() + 4,
        ten_do_an: 'Nền tảng chia sẻ tài liệu ôn tập và ngân hàng câu hỏi trắc nghiệm',
        quy_mo: 'ca_nhan',
        noi_dung_muc_tieu: 'Ứng dụng lưu trữ, tìm kiếm và phân quyền tải tài liệu học tập theo từng học phần.'
      }
    ]);
    setTopicInputMode('rows');
  };

  // Chuyển văn bản dán hàng loạt thành các dòng đề tài
  const handleParseBulkText = () => {
    if (!bulkText.trim()) {
      alert('Vui lòng dán danh sách đề tài vào ô văn bản trước!');
      return;
    }
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Không tìm thấy dòng đề tài nào hợp lệ!');
      return;
    }

    const newRows = lines.map((line, idx) => {
      let scale = bulkDefaultScale;
      if (bulkDefaultScale === 'alternate') {
        scale = idx % 2 === 0 ? 'nhom' : 'ca_nhan';
      }
      return {
        id: Date.now() + idx,
        ten_do_an: line,
        quy_mo: scale,
        noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}", chuẩn hóa CSDL BCNF và báo cáo nghiệm thu.`
      };
    });

    setTopicRows(newRows);
    setTopicInputMode('rows');
  };

  // Thao tác Tạo & Công bố Đề tài mới (GVPTMH - Hỗ trợ NHIỀU ĐỀ TÀI CÙNG LÚC)
  const handleCreateTopicSubmit = async (e) => {
    e.preventDefault();

    let rowsToSubmit = topicRows;
    if (topicInputMode === 'bulk') {
      if (!bulkText.trim()) {
        alert('Vui lòng dán danh sách đề tài hoặc chuyển sang tab Nhập theo danh sách!');
        return;
      }
      const lines = bulkText
        .split('\n')
        .map(l => l.trim().replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
        .filter(l => l.length > 0);
      rowsToSubmit = lines.map((line, idx) => ({
        id: Date.now() + idx,
        ten_do_an: line,
        quy_mo: bulkDefaultScale === 'alternate' ? (idx % 2 === 0 ? 'nhom' : 'ca_nhan') : bulkDefaultScale,
        noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}".`
      }));
    }

    const validRows = rowsToSubmit.filter(r => r.ten_do_an && r.ten_do_an.trim());
    if (validRows.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên đề tài!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ten_mon_hoc: `Môn: ${currentClassInfo.ten_mon_hoc} • ${currentClassInfo.ten_lop}`,
        ma_giang_vien: 'u-gv-01',
        topics: validRows.map(r => ({
          ten_do_an: r.ten_do_an.trim(),
          quy_mo: r.quy_mo,
          noi_dung_muc_tieu: r.noi_dung_muc_tieu ? r.noi_dung_muc_tieu.trim() : undefined
        }))
      };

      await createTopic(payload);

      // Reset về trạng thái mặc định
      setTopicRows([
        { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
        { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
      ]);
      setBulkText('');
      setIsCreateTopicModalOpen(false);
    } catch (err) {
      alert(`Lỗi công bố đề tài: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal nhận đề tài cá nhân
  const handleOpenSoloConfirm = (topic) => {
    const defaultSvId = !isLecturer && currentUser ? currentUser.ma_nguoi_dung : 'u-sv-04';
    setSoloStudentId(defaultSvId);
    setSoloConfirmTopic(topic);
  };

  const handleConfirmSoloSubmit = async (e) => {
    e.preventDefault();
    if (!soloConfirmTopic || !soloStudentId) return;
    try {
      setSubmitting(true);
      await registerSoloTopic(soloConfirmTopic.ma_do_an, soloStudentId);
      if (!isLecturer) setCurrentUserId(soloStudentId);
      setSoloConfirmTopic(null);
    } catch (err) {
      alert(`Lỗi nhận đề tài cá nhân: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal lập nhóm
  const handleOpenTeamModal = (topic) => {
    const unassigned = students.filter(s => !s.da_co_nhom);
    let defaultMembers = [];
    let defaultLeader = '';

    if (!isLecturer && currentUser) {
      defaultLeader = currentUser.ma_nguoi_dung;
      const partner = unassigned.find(s => s.ma_nguoi_dung !== currentUser.ma_nguoi_dung) || students.find(s => s.ma_nguoi_dung !== currentUser.ma_nguoi_dung);
      defaultMembers = partner ? [currentUser.ma_nguoi_dung, partner.ma_nguoi_dung] : [currentUser.ma_nguoi_dung];
    } else if (unassigned.length >= 2) {
      defaultLeader = unassigned[0].ma_nguoi_dung;
      defaultMembers = [unassigned[0].ma_nguoi_dung, unassigned[1].ma_nguoi_dung];
    } else {
      defaultLeader = students[0]?.ma_nguoi_dung || '';
      defaultMembers = students.slice(0, 2).map(s => s.ma_nguoi_dung);
    }

    const nextNum = registeredGroups.filter(g => g.quy_mo === 'nhom').length + 5;
    setTeamForm({
      ten_nhom: `Nhóm Đồ án Môn học 0${nextNum}`,
      leaderId: defaultLeader,
      memberIds: defaultMembers
    });
    setTeamModalTopic(topic);
  };

  const handleToggleMember = (studentId) => {
    setTeamForm(prev => {
      const exists = prev.memberIds.includes(studentId);
      let nextMembers = exists ? prev.memberIds.filter(id => id !== studentId) : [...prev.memberIds, studentId];
      if (nextMembers.length > 3) {
        alert('Đề tài nhóm giới hạn tối đa 3 sinh viên!');
        return prev;
      }
      let nextLeader = prev.leaderId;
      if (!nextMembers.includes(nextLeader)) {
        nextLeader = nextMembers[0] || '';
      }
      return { ...prev, memberIds: nextMembers, leaderId: nextLeader };
    });
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamModalTopic) return;
    if (!teamForm.ten_nhom.trim()) {
      alert('Vui lòng đặt tên nhóm!');
      return;
    }
    if (teamForm.memberIds.length < 2) {
      alert('Đề tài nhóm cần tối thiểu 2 sinh viên tham gia!');
      return;
    }
    try {
      setSubmitting(true);
      await registerTeamTopic(teamModalTopic.ma_do_an, {
        ten_nhom: teamForm.ten_nhom.trim(),
        leaderId: teamForm.leaderId,
        memberIds: teamForm.memberIds
      });
      if (!isLecturer) setCurrentUserId(teamForm.leaderId);
      setTeamModalTopic(null);
    } catch (err) {
      alert(`Lỗi đăng ký nhóm: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="classroom-portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '36px' }}>

      {/* =====================================================================
          1. HEADER BANNER (GVPTMH: TỐI GIẢN HỌC THUẬT · SV: THÂN THIỆN)
         ===================================================================== */}
      <div
        data-tour-id="tour-class-selector"
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderTop: isLecturer ? '1px solid var(--border)' : '3px solid #2563eb',
          borderRadius: '12px',
          padding: isLecturer ? '16px 20px' : '16px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {!isLecturer && chibiMode && (
              <img
                src={hasEnrolledProject ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.characters.chiaTask}
                alt="Portal Mascot"
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  background: '#eff6ff',
                  borderRadius: '10px',
                  padding: '4px',
                  border: '1px solid #bfdbfe',
                  flexShrink: 0
                }}
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {!isLecturer && (
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    SINH VIÊN
                  </span>
                )}
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                  {currentClassInfo.ten_lop}
                </h2>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  &bull; {currentClassInfo.ten_mon_hoc} &bull; {currentClassInfo.hoc_ky}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '3px' }}>
                GVHD: <strong style={{ color: 'var(--text)' }}>ThS. Bùi Phú Khuyên</strong> &bull; Sĩ số: <strong style={{ color: 'var(--text)' }}>{students.length} SV</strong>
              </div>
            </div>
          </div>

          {/* Chọn Lớp & Tác vụ cấp lớp cho Giảng viên */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={activeClassId}
              onChange={e => setActiveClassId(e.target.value)}
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {classes.map(c => (
                <option key={c.ma_lop} value={c.ma_lop}>
                  {c.ten_lop} ({c.hoc_ky})
                </option>
              ))}
            </select>

            {isLecturer && (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsCreateClassModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  + Tạo Lớp
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  data-tour-id="tour-gv-add-topics"
                  onClick={() => setIsCreateTopicModalOpen(true)}
                  style={{ fontWeight: 700 }}
                >
                  + Thêm Đề tài
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1 DÒNG TÓM TẮT SỐ LIỆU TOÀN LỚP (THAY THẾ 4 Ô KPI TO) */}
        {isLecturer && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <span>Tổng đề tài: <strong style={{ color: 'var(--text)' }}>{topics.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Đang thực hiện: <strong style={{ color: '#15803d' }}>{registeredGroups.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Còn trống: <strong style={{ color: 'var(--text)' }}>{openTopics.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Tiến độ TB lớp: <strong style={{ color: '#1d4ed8' }}>{averageClassProgress}%</strong></span>
            </div>

            {unassignedStudents.length > 0 ? (
              <button
                type="button"
                onClick={() => setLecturerFilter('unassigned_sv')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#b45309',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {unassignedStudents.length}/{students.length} SV chưa có nhóm
              </button>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                100% SV đã có nhóm
              </span>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          2. NỘI DUNG CHÍNH
         ===================================================================== */}

      {isLecturer ? (
        /* -------------------------------------------------------------------
           A. GIAO DIỆN GIẢNG VIÊN: 1 BẢNG TỔNG HỢP LỚP DUY NHẤT (SIÊU TỐI GIẢN)
           ------------------------------------------------------------------- */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Thanh lọc nhanh + tìm kiếm gọn trên đầu bảng */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`tab-btn ${lecturerFilter === 'all' ? 'active' : ''}`}
                data-tour-id="tour-gv-groups-tab"
                onClick={() => setLecturerFilter('all')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Tất cả ({topics.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'active' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('active')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Đang làm ({registeredGroups.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'open' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('open')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Còn trống ({openTopics.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'unassigned_sv' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('unassigned_sv')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                SV chưa nhóm ({unassignedStudents.length})
              </button>
            </div>

            <input
              type="text"
              className="form-control"
              placeholder={lecturerFilter === 'unassigned_sv' ? 'Tìm tên hoặc email SV...' : 'Tìm đề tài, nhóm, trưởng nhóm...'}
              value={lecturerSearch}
              onChange={e => setLecturerSearch(e.target.value)}
              style={{ width: '240px', maxWidth: '100%', padding: '5px 10px', fontSize: '12.5px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            {lecturerFilter === 'unassigned_sv' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px', width: '48px' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>Họ và tên</th>
                    <th style={{ padding: '10px 14px' }}>Email</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnassignedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                        {unassignedStudents.length === 0
                          ? 'Tất cả sinh viên trong lớp đều đã tham gia nhóm.'
                          : 'Không tìm thấy sinh viên phù hợp.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUnassignedStudents.map((sv, idx) => (
                      <tr key={sv.ma_nguoi_dung} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-subtle)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>{sv.ho_ten}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{sv.email}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#b45309', fontSize: '12px', fontWeight: 600 }}>
                          Chưa có nhóm
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Đề tài &amp; Nhóm</th>
                    <th style={{ padding: '10px 14px', width: '210px' }}>Trưởng nhóm &amp; Sĩ số</th>
                    <th style={{ padding: '10px 14px', width: '140px' }}>Tiến độ</th>
                    <th style={{ padding: '10px 14px', width: '120px' }}>GitHub</th>
                    <th style={{ padding: '10px 14px', width: '84px', textAlign: 'right' }}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLecturerTopics.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                        Không có đề tài phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredLecturerTopics.map((topic, idx) => {
                      const pct = Number(topic.tien_do_tong || 0).toFixed(0);
                      const gh = topic.github_summary;
                      const members = topic.team?.members || [];
                      const leader = members.find(m => m.vai_tro_trong_nhom === 'nhom_truong') || members[0];
                      return (
                        <tr
                          key={topic.ma_do_an}
                          onClick={() => setDetailTopicModal(topic)}
                          style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '11px 14px', maxWidth: '420px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>
                              <span style={{ color: 'var(--text-subtle)', marginRight: '6px', fontWeight: 500 }}>{idx + 1}.</span>
                              {topic.ten_do_an}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {topic.da_dang_ky
                                ? `${topic.team?.ten_nhom} · ${topic.quy_mo === 'ca_nhan' ? 'Cá nhân' : 'Nhóm'}`
                                : `Chưa có nhóm · ${topic.quy_mo === 'ca_nhan' ? 'Cá nhân (1 SV)' : 'Nhóm'}`}
                            </div>
                          </td>

                          <td style={{ padding: '11px 14px', color: 'var(--text)', fontSize: '12.5px' }}>
                            {topic.da_dang_ky && leader ? (
                              <span>
                                {leader.ho_ten}{' '}
                                <span style={{ color: 'var(--text-muted)' }}>({members.length} SV)</span>
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-subtle)' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px' }}>
                            {topic.da_dang_ky ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '5px', background: '#e4e4e7', borderRadius: '99px', overflow: 'hidden', minWidth: '64px' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: '#16a34a' }} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', minWidth: '32px', textAlign: 'right' }}>
                                  {pct}%
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Còn trống</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            {topic.da_dang_ky ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  enterWorkspace(topic.ma_do_an, 'github');
                                }}
                                style={{ fontSize: '11.5px', padding: '3px 8px', color: gh?.connected ? 'var(--text)' : 'var(--text-subtle)' }}
                              >
                                {gh?.connected
                                  ? (gh.commit_count > 0 ? `${gh.commit_count} commits` : 'Đã gắn')
                                  : 'Chưa gắn'}
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-subtle)' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailTopicModal(topic);
                              }}
                              style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                            >
                              Xem
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------------
           B. GIAO DIỆN SINH VIÊN TINH GỌN (STUDENT PORTAL)
           ------------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* KHỐI 1: VIỆC CỦA BẠN LÚC NÀY */}
          {hasEnrolledProject ? (
            <div
              data-tour-id="tour-sv-status-card"
              style={{
                background: 'var(--surface-raised)',
                borderRadius: '12px',
                padding: '18px 22px',
                border: '1px solid var(--border)',
                borderLeft: '4px solid #2563eb',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
                    ✓ ĐỀ TÀI CỦA BẠN
                  </span>
                  <span style={{ background: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#fef3c7' : '#f4f4f5', color: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#b45309' : '#52525b', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    {currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '⭐ Nhóm trưởng' : 'Thành viên'}
                  </span>
                  <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    Tiến độ: {Number(studentProject.tien_do_tong || 0).toFixed(0)}%
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
                  {studentProject.ten_do_an}
                </h3>
                <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>
                  {studentProject.ten_nhom}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => enterWorkspace(studentProject.ma_do_an, 'github')}
                  style={{ fontWeight: 700, padding: '8px 12px' }}
                >
                  🐙 GitHub Nhóm
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => enterWorkspace(studentProject.ma_do_an, 'kanban')}
                  style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 700, padding: '8px 16px' }}
                >
                  🚀 Vào Bảng việc Kanban &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div
              data-tour-id="tour-sv-status-card"
              style={{
                background: 'var(--surface)',
                border: '1.5px dashed #f59e0b',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
                  CHƯA CÓ ĐỀ TÀI
                </span>
                <h3 style={{ margin: '6px 0 4px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  Hãy chọn đề tài cá nhân hoặc lập nhóm để bắt đầu
                </h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Hiện còn <strong>{openTopics.length}</strong> đề tài đang mở trong lớp {currentClassInfo.ten_lop}.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const firstSolo = openTopics.find(t => t.quy_mo === 'ca_nhan') || openTopics[0];
                    if (firstSolo) handleOpenSoloConfirm(firstSolo);
                    else alert('Hiện chưa có đề tài còn trống!');
                  }}
                  style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 700, padding: '8px 14px' }}
                >
                  ⚡ Nhận Đề tài Cá nhân
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const firstTeam = openTopics.find(t => t.quy_mo === 'nhom') || openTopics[0];
                    if (firstTeam) handleOpenTeamModal(firstTeam);
                    else alert('Hiện chưa có đề tài còn trống!');
                  }}
                  style={{ background: '#7c3aed', borderColor: '#7c3aed', fontWeight: 700, padding: '8px 14px' }}
                >
                  👥 Lập Nhóm &amp; Đăng ký
                </button>
              </div>
            </div>
          )}

          {/* KHỐI 2: NGÂN HÀNG ĐỀ TÀI RÚT GỌN (DỄ NHÌN, BẤM CHI TIẾT ĐỂ XEM MÔ TẢ) */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>
                📚 Ngân hàng Đề tài ({topics.length})
              </h4>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all', label: `Tất cả (${topics.length})` },
                  { id: 'open', label: `Còn trống (${openTopics.length})` },
                  { id: 'taken', label: `Đã có nhóm (${registeredGroups.length})` }
                ].map(f => (
                  <button
                    key={f.id}
                    className={`tab-btn ${studentTopicFilter === f.id ? 'active' : ''}`}
                    onClick={() => setStudentTopicFilter(f.id)}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {topics
                .filter(t => {
                  if (studentTopicFilter === 'open') return !t.da_dang_ky;
                  if (studentTopicFilter === 'taken') return t.da_dang_ky;
                  return true;
                })
                .map(t => {
                  const isMyProject = hasEnrolledProject && (studentProject?.ma_do_an === t.ma_do_an);
                  const isSolo = t.quy_mo === 'ca_nhan';
                  const isRegistered = t.da_dang_ky;

                  return (
                    <div
                      key={t.ma_do_an}
                      style={{
                        border: isMyProject ? '2px solid #2563eb' : '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        background: isMyProject ? '#f8faff' : 'var(--surface-raised)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: isSolo ? '#0369a1' : '#6d28d9',
                              background: isSolo ? '#e0f2fe' : '#f3e8ff',
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}
                          >
                            {isSolo ? '1 SV' : 'Nhóm'}
                          </span>

                          {isMyProject ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '999px' }}>
                              ⭐ Của bạn &bull; {Number(t.tien_do_tong || 0).toFixed(0)}%
                            </span>
                          ) : isRegistered ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: '999px' }}>
                              ✓ {t.team?.ten_nhom} ({Number(t.tien_do_tong || 0).toFixed(0)}%)
                            </span>
                          ) : (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '999px' }}>
                              🟢 Còn trống
                            </span>
                          )}
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', lineHeight: 1.35 }}>
                          {t.ten_do_an}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setDetailTopicModal(t)}
                          style={{ fontSize: '11.5px', padding: '5px 10px' }}
                        >
                          Chi tiết
                        </button>

                        {isRegistered ? (
                          <button
                            className={isMyProject ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                            onClick={() => enterWorkspace(t.ma_do_an, 'kanban')}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              background: isMyProject ? '#2563eb' : undefined,
                              color: isMyProject ? '#fff' : '#1d4ed8',
                              borderColor: isMyProject ? '#2563eb' : '#93c5fd'
                            }}
                          >
                            {isMyProject ? '🚀 Vào Kanban →' : '👀 Xem nhóm →'}
                          </button>
                        ) : !hasEnrolledProject ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => isSolo ? handleOpenSoloConfirm(t) : handleOpenTeamModal(t)}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              background: isSolo ? '#0284c7' : '#7c3aed',
                              borderColor: isSolo ? '#0284c7' : '#7c3aed'
                            }}
                          >
                            {isSolo ? '⚡ Nhận đề tài' : '👥 Lập nhóm'}
                          </button>
                        ) : (
                          <span style={{ flex: 1, textAlign: 'right', fontSize: '11px', color: 'var(--text-subtle)' }}>
                            Chờ SV khác chọn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL A: TẠO LỚP MÔN HỌC MỚI (DÀNH CHO GVPTMH)
         ===================================================================== */}
      {isCreateClassModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateClassModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>🏫 Giảng viên Tạo Lớp Môn học Mới</h3>
              <button className="drawer-close-btn" onClick={() => setIsCreateClassModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClassSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Mã lớp học phần (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: 21DTHC6 hoặc 22DTHE9"
                    value={classForm.ma_lop}
                    onChange={e => setClassForm(prev => ({ ...prev, ma_lop: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên môn học</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.ten_mon_hoc}
                    onChange={e => setClassForm(prev => ({ ...prev, ten_mon_hoc: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Học kỳ / Niên khóa</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.hoc_ky}
                    onChange={e => setClassForm(prev => ({ ...prev, hoc_ky: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả lớp học phần</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Mô tả thông tin phòng máy, lịch học..."
                    value={classForm.mo_ta}
                    onChange={e => setClassForm(prev => ({ ...prev, mo_ta: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateClassModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : '+ Hoàn tất Tạo Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL B: GIẢNG VIÊN TẠO NHIỀU ĐỀ TÀI CÙNG LÚC VÀO NGÂN HÀNG CỦA LỚP
         ===================================================================== */}
      {isCreateTopicModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateTopicModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw' }}>
            <div className="modal-header" style={{ paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  📚 GVPTMH Thêm Đề tài vào Ngân hàng ({currentClassInfo.ten_lop})
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cho phép nhập nhiều đề tài cùng lúc để sinh viên trong lớp chọn làm đề tài Cá nhân (1 SV) hoặc Nhóm (2-3 SV).
                </p>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsCreateTopicModalOpen(false)}>✕</button>
            </div>

            {/* Thanh chuyển chế độ nhập: Nhập danh sách vs Dán hàng loạt */}
            <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', paddingBottom: '8px' }}>
                <button
                  type="button"
                  className={`tab-btn ${topicInputMode === 'rows' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('rows')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📝 Nhập theo danh sách ({topicRows.length} dòng)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${topicInputMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('bulk')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📋 Dán nhanh hàng loạt (Bulk Paste)
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLoadSampleTopics}
                title="Tự động điền 4 đề tài mẫu thực tế chuẩn Công nghệ phần mềm"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#2563eb',
                  borderColor: '#bfdbfe',
                  background: '#eff6ff',
                  padding: '4px 10px'
                }}
              >
                ✨ Nạp 4 đề tài mẫu gợi ý
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit}>
              <div className="modal-body" style={{ maxHeight: '56vh', overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* ---------------- CHẾ ĐỘ 1: NHẬP THEO DANH SÁCH TỪNG DÒNG ---------------- */}
                {topicInputMode === 'rows' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                        Danh sách các đề tài chuẩn bị công bố:
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleAddTopicRow}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff' }}
                      >
                        + Thêm dòng đề tài
                      </button>
                    </div>

                    {topicRows.map((row, idx) => (
                      <div
                        key={row.id}
                        style={{
                          background: 'var(--surface-raised)',
                          border: '1px solid var(--border)',
                          borderLeft: row.quy_mo === 'ca_nhan' ? '4px solid #0284c7' : '4px solid #7c3aed',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        {/* Header của từng dòng đề tài: STT + Chọn Quy mô + Nút Xóa */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>
                            Đề tài #{idx + 1}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Toggle Quy mô */}
                            <div style={{ display: 'inline-flex', background: 'var(--surface-subtle)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateTopicRow(row.id, 'quy_mo', 'nhom')}
                                style={{
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: row.quy_mo === 'nhom' ? 700 : 500,
                                  background: row.quy_mo === 'nhom' ? '#7c3aed' : 'transparent',
                                  color: row.quy_mo === 'nhom' ? '#ffffff' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                👥 Nhóm (2-3 SV)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateTopicRow(row.id, 'quy_mo', 'ca_nhan')}
                                style={{
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: row.quy_mo === 'ca_nhan' ? 700 : 500,
                                  background: row.quy_mo === 'ca_nhan' ? '#0284c7' : 'transparent',
                                  color: row.quy_mo === 'ca_nhan' ? '#ffffff' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                👤 Cá nhân (1 SV)
                              </button>
                            </div>

                            {/* Nút xóa dòng nếu có từ 2 dòng trở lên */}
                            {topicRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicRow(row.id)}
                                title="Xóa dòng đề tài này"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tên đề tài */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Tên đề tài đồ án môn học (*)..."
                            value={row.ten_do_an}
                            onChange={e => handleUpdateTopicRow(row.id, 'ten_do_an', e.target.value)}
                            required
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        {/* Mô tả ngắn */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Mô tả mục tiêu / yêu cầu chính (tùy chọn)..."
                            value={row.noi_dung_muc_tieu}
                            onChange={e => handleUpdateTopicRow(row.id, 'noi_dung_muc_tieu', e.target.value)}
                            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddTopicRow}
                      style={{
                        borderStyle: 'dashed',
                        borderColor: '#93c5fd',
                        color: '#2563eb',
                        justifyContent: 'center',
                        fontWeight: 700,
                        padding: '10px'
                      }}
                    >
                      + Thêm dòng đề tài thứ {topicRows.length + 1}
                    </button>
                  </div>
                )}

                {/* ---------------- CHẾ ĐỘ 2: DÁN VĂN BẢN HÀNG LOẠT ---------------- */}
                {topicInputMode === 'bulk' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1d4ed8' }}>
                      💡 <strong>Mẹo giảng viên:</strong> Copy danh sách đề tài từ Word/Excel hoặc File ghi chú rồi dán vào khung dưới đây. Hệ thống sẽ tự động bóc tách từng dòng thành các đề tài riêng biệt!
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Quy mô áp dụng mặc định:</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'nhom' ? '2px solid #7c3aed' : '1px solid var(--border)', background: bulkDefaultScale === 'nhom' ? '#faf5ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'nhom'} onChange={() => setBulkDefaultScale('nhom')} />
                          <span>👥 Tất cả là Nhóm</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'ca_nhan' ? '2px solid #0284c7' : '1px solid var(--border)', background: bulkDefaultScale === 'ca_nhan' ? '#f0f9ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'ca_nhan'} onChange={() => setBulkDefaultScale('ca_nhan')} />
                          <span>👤 Tất cả là Cá nhân</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'alternate' ? '2px solid #2563eb' : '1px solid var(--border)', background: bulkDefaultScale === 'alternate' ? '#eff6ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'alternate'} onChange={() => setBulkDefaultScale('alternate')} />
                          <span>⚡ Đan xen 50/50</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dán danh sách đề tài (mỗi dòng 1 đề tài):</label>
                      <textarea
                        className="form-textarea"
                        rows="7"
                        placeholder="Ví dụ:&#10;1. Xây dựng cổng tra cứu thông tin học vụ và lịch thi&#10;2. Hệ thống quản lý điểm rèn luyện sinh viên&#10;3. Ứng dụng theo dõi chứng chỉ tốt nghiệp cá nhân&#10;4. Nền tảng chia sẻ tài liệu ôn tập trực tuyến..."
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.5 }}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleParseBulkText}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8' }}
                      >
                        ⚡ Chuyển thành danh sách để xem & chỉnh sửa &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {topicInputMode === 'rows' ? (
                    <span>
                      Đang chuẩn bị <strong>{topicRows.filter(r => r.ten_do_an.trim()).length}</strong> đề tài cho lớp
                    </span>
                  ) : (
                    <span>
                      {bulkText.trim().split('\n').filter(l => l.trim()).length > 0
                        ? `Tìm thấy ${bulkText.trim().split('\n').filter(l => l.trim()).length} dòng đề tài`
                        : 'Chưa có nội dung dán'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateTopicModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang tạo...' : '+ Công bố Danh sách Đề tài'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL C: SINH VIÊN NHẬN ĐỀ TÀI CÁ NHÂN (1 NGƯỜI)
         ===================================================================== */}
      {soloConfirmTopic && (
        <div className="modal-backdrop open" onClick={() => setSoloConfirmTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>👤 Nhận Đề tài Cá nhân (1 Sinh viên)</h3>
              <button className="drawer-close-btn" onClick={() => setSoloConfirmTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmSoloSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    Đề tài Cá nhân (1 Người thực hiện)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', marginTop: '4px' }}>
                    {soloConfirmTopic.ten_do_an}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Sinh viên nhận đề tài này về cho mình:</label>
                  <select
                    className="form-select"
                    value={soloStudentId}
                    onChange={e => setSoloStudentId(e.target.value)}
                    required
                  >
                    {students.map(s => (
                      <option key={s.ma_nguoi_dung} value={s.ma_nguoi_dung}>
                        {s.ho_ten} ({s.email}) {s.da_co_nhom ? '— Đã có đề tài' : '— Chưa có đề tài'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: '8px' }}>
                  ℹ️ Bạn sẽ là người duy nhất quản lý tiến độ cho đề tài này và làm việc trực tiếp với Giảng viên.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSoloConfirmTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
                  {submitting ? 'Đang xử lý...' : '⚡ Xác nhận Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL D: SINH VIÊN LẬP NHÓM & ĐĂNG KÝ ĐỀ TÀI NHÓM
         ===================================================================== */}
      {teamModalTopic && (
        <div className="modal-backdrop open" onClick={() => setTeamModalTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>👥 Thiết lập Nhóm & Đăng ký Đề tài</h3>
              <button className="drawer-close-btn" onClick={() => setTeamModalTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                    Đề tài Nhóm (2 - 3 Sinh viên)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4c1d95', marginTop: '3px' }}>
                    {teamModalTopic.ten_do_an}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">1. Đặt Tên Nhóm Đồ án (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nhóm Đồ án Môn học 06"
                    value={teamForm.ten_nhom}
                    onChange={e => setTeamForm(prev => ({ ...prev, ten_nhom: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">2. Chọn Thành viên & Chỉ định ai là Nhóm trưởng (*)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {students.map(sv => {
                      const isSelected = teamForm.memberIds.includes(sv.ma_nguoi_dung);
                      const isLeaderSelected = teamForm.leaderId === sv.ma_nguoi_dung;
                      return (
                        <div
                          key={sv.ma_nguoi_dung}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border)',
                            background: isSelected ? '#faf5ff' : 'var(--surface)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleMember(sv.ma_nguoi_dung)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => { }}
                              style={{ accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px' }}>{sv.ho_ten}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sv.email}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <div onClick={e => e.stopPropagation()}>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: isLeaderSelected ? '#b45309' : '#475569', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="portalLeaderRadio"
                                  checked={isLeaderSelected}
                                  onChange={() => setTeamForm(prev => ({ ...prev, leaderId: sv.ma_nguoi_dung }))}
                                  style={{ accentColor: '#d97706' }}
                                />
                                <span>{isLeaderSelected ? '⭐ Nhóm trưởng' : 'Làm Nhóm trưởng'}</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setTeamModalTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                  {submitting ? 'Đang tạo...' : '🚀 Hoàn tất Lập Nhóm & Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL E: XEM CHI TIẾT ĐỀ TÀI & NHÓM (BẢNG BÊN NGOÀI LUÔN GỌN SẠCH)
         ===================================================================== */}
      {detailTopicModal && (
        <div className="modal-backdrop open" onClick={() => setDetailTopicModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>📄 Chi tiết Đề tài &amp; Nhóm thực hiện</h3>
              <button className="drawer-close-btn" onClick={() => setDetailTopicModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: detailTopicModal.quy_mo === 'ca_nhan' ? '#e0f2fe' : '#f3e8ff', color: detailTopicModal.quy_mo === 'ca_nhan' ? '#0369a1' : '#6d28d9' }}>
                  {detailTopicModal.quy_mo === 'ca_nhan' ? 'Đề tài Cá nhân (1 SV)' : 'Đề tài Nhóm'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: detailTopicModal.da_dang_ky ? '#dcfce7' : '#fef3c7', color: detailTopicModal.da_dang_ky ? '#15803d' : '#b45309' }}>
                  {detailTopicModal.da_dang_ky ? `Đã nhận (${detailTopicModal.team?.ten_nhom})` : 'Còn trống'}
                </span>
                {detailTopicModal.github_summary?.connected && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: '#f4f4f5', color: 'var(--text)' }}>
                    GitHub: {detailTopicModal.github_summary.repo_slug}
                  </span>
                )}
              </div>

              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                {detailTopicModal.ten_do_an}
              </h4>

              <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {detailTopicModal.mo_ta_sach || 'Chưa có mô tả chi tiết cho đề tài này.'}
              </div>

              {detailTopicModal.da_dang_ky && (detailTopicModal.team?.members?.length || 0) > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    Thành viên ({detailTopicModal.team.members.length} sinh viên):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {detailTopicModal.team.members.map(m => (
                      <div key={m.ma_nguoi_dung} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text)', fontWeight: m.vai_tro_trong_nhom === 'nhom_truong' ? 700 : 500 }}>
                          {m.ho_ten}{m.vai_tro_trong_nhom === 'nhom_truong' ? ' (Nhóm trưởng)' : ''}
                        </span>
                        <span>{m.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>Mốc tiến độ: <strong>{detailTopicModal.so_moc || 0}</strong></span>
                <span>Công việc: <strong>{detailTopicModal.so_cong_viec || 0}</strong></span>
                {detailTopicModal.da_dang_ky && (
                  <span>Tiến độ: <strong>{Number(detailTopicModal.tien_do_tong || 0).toFixed(0)}%</strong></span>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                {isLecturer && detailTopicModal.da_dang_ky && detailTopicModal.ma_do_an !== 'da-dacs-01' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (window.confirm('Đặt lại đề tài này về trạng thái trống?')) {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        resetTopicRegistration(targetId);
                      }
                    }}
                    style={{ color: '#dc2626', borderColor: '#fecaca' }}
                  >
                    Đặt lại về trống
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setDetailTopicModal(null)}>
                  Đóng
                </button>
                {detailTopicModal.da_dang_ky && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        enterWorkspace(targetId, 'github');
                      }}
                    >
                      GitHub
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        enterWorkspace(targetId, 'kanban');
                      }}
                    >
                      Mở Kanban &rarr;
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
