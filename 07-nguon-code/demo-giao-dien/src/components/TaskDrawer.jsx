import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { apiService } from '../services/apiService.js';
import { formatDate, formatFileSize } from '../utils/formatters.js';
import { CHIBI_ASSETS, renderCommentWithStickers } from '../constants/chibiAssets.js';

// Tiện ích hiển thị icon theo loại tệp
function getFileIcon(fileName) {
  if (!fileName) return '📎';
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') return '📕';
  if (['doc', 'docx'].includes(ext)) return '📘';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['ppt', 'pptx'].includes(ext)) return '📙';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
  if (['txt', 'md', 'json', 'sql', 'js', 'html', 'css'].includes(ext)) return '📝';
  return '📎';
}

export default function TaskDrawer() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    selectedTask,
    tasks,
    milestones,
    teamMembers,
    currentUserId,
    canCreateTask,
    canLockTask,
    canEditTaskProgress,
    isLeader,
    isLecturer,
    reload,
    chibiMode
  } = useProject();

  const [title, setTitle] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('can_lam');
  const [desc, setDesc] = useState('');
  const [progress, setProgress] = useState(0);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sync state when selectedTask changes
  useEffect(() => {
    if (!selectedTask) return;
    setTitle(selectedTask.tieu_de || '');
    setMilestoneId(selectedTask.ma_moc || '');
    setAssigneeId(selectedTask.ma_nguoi_thuc_hien || '');
    setDeadline(selectedTask.han_chot ? selectedTask.han_chot.substring(0, 10) : '');
    setStatus(selectedTask.trang_thai || 'can_lam');
    setDesc(selectedTask.noi_dung_mo_ta || '');
    setProgress(selectedTask.phan_tram_tien_do || 0);

    // Load comments and attachments
    apiService.getComments(selectedTask.ma_cong_viec)
      .then(setComments)
      .catch(() => setComments([]));

    apiService.getAttachments(selectedTask.ma_cong_viec)
      .then(setAttachments)
      .catch(() => setAttachments([]));
  }, [selectedTask]);

  if (!selectedTaskId || !selectedTask) return null;

  const isLocked = Boolean(selectedTask.trang_thai_khoa);
  const canEditProgress = canEditTaskProgress(selectedTask);
  const members = teamMembers?.members || [];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        tieu_de: title.trim(),
        ma_moc: milestoneId,
        ma_nguoi_thuc_hien: assigneeId || null,
        han_chot: deadline || null,
        trang_thai: status,
        noi_dung_mo_ta: desc.trim()
      };

      if (!isLocked && canEditProgress) {
        updateData.phan_tram_tien_do = parseFloat(progress);
      }

      await apiService.updateTask(selectedTask.ma_cong_viec, updateData);
      await reload();
      setSelectedTaskId(null);
    } catch (err) {
      alert(`Lỗi lưu công việc vào SQLite: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLock = async (lock) => {
    try {
      if (lock) {
        await apiService.lockTask(selectedTask.ma_cong_viec, currentUserId);
      } else {
        await apiService.unlockTask(selectedTask.ma_cong_viec);
      }
      await reload();
    } catch (err) {
      alert(`Lỗi thay đổi trạng thái khóa: ${err.message}`);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiService.addComment(selectedTask.ma_cong_viec, {
        userId: currentUserId,
        noi_dung: newComment.trim()
      });
      setNewComment('');
      const updated = await apiService.getComments(selectedTask.ma_cong_viec);
      setComments(updated);
    } catch (err) {
      alert(`Lỗi gửi bình luận: ${err.message}`);
    }
  };

  const handleSendSticker = async (stickerCode) => {
    try {
      await apiService.addComment(selectedTask.ma_cong_viec, {
        userId: currentUserId,
        noi_dung: stickerCode
      });
      const updated = await apiService.getComments(selectedTask.ma_cong_viec);
      setComments(updated);
    } catch (err) {
      alert(`Lỗi gửi sticker phản hồi: ${err.message}`);
    }
  };

  const handleQuickProgress = (val) => {
    setProgress(val);
    if (val === 100) {
      setStatus('hoan_thanh');
    } else if (val > 0 && status === 'can_lam') {
      setStatus('dang_lam');
    }
  };

  // Xử lý nộp tệp tài liệu thực tế từ máy tính
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn dung lượng 25MB
    if (file.size > 25 * 1024 * 1024) {
      alert('Tệp vượt quá dung lượng tối đa cho phép (25MB).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setUploadSuccessMsg('');

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          await apiService.addAttachment(selectedTask.ma_cong_viec, {
            userId: currentUserId,
            ten_tep: file.name,
            loai_tep: file.type || 'application/octet-stream',
            dung_luong: file.size,
            du_lieu_base64: base64Data
          });
          const updated = await apiService.getAttachments(selectedTask.ma_cong_viec);
          setAttachments(updated);
          setUploadSuccessMsg(`Đã nộp thành công tệp: ${file.name}`);
          setTimeout(() => setUploadSuccessMsg(''), 4000);
        } catch (err) {
          alert(`Lỗi khi nộp tệp: ${err.message}`);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        alert('Lỗi đọc tệp tin từ máy tính.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(`Lỗi nộp tệp: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Xóa tệp đính kèm
  const handleDeleteAttachment = async (fileId, fileName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tệp "${fileName}" không?`)) return;
    try {
      await apiService.deleteAttachment(fileId);
      const updated = await apiService.getAttachments(selectedTask.ma_cong_viec);
      setAttachments(updated);
    } catch (err) {
      alert(`Lỗi khi xóa tệp: ${err.message}`);
    }
  };

  return (
    <div
      id="task-drawer-overlay"
      className="task-drawer-overlay"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target.id === 'task-drawer-overlay') setSelectedTaskId(null);
      }}
    >
      <div className="task-drawer">
        <div className="drawer-header">
          <h3 id="drawer-task-title-header">Chi tiết công việc</h3>
          <button className="btn-close" id="btn-close-drawer" onClick={() => setSelectedTaskId(null)}>
            &times;
          </button>
        </div>

        <div className="drawer-body">
          {/* Lock Banner */}
          {isLocked && (
            <div id="drawer-lock-banner" className="lock-banner" style={{ display: 'flex' }}>
              <span>🔒 Công việc đã được chốt tiến độ và khóa.</span>
              {canLockTask && (
                <button
                  className="btn btn-outline btn-sm"
                  id="btn-unlock-task"
                  style={{ background: '#ffffff' }}
                  onClick={() => handleToggleLock(false)}
                >
                  Mở khóa
                </button>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="drawer-field">
            <label>Tiêu đề công việc</label>
            <input
              type="text"
              className="drawer-input"
              id="drawer-input-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div className="drawer-field">
            <label>Mốc tiến độ trực thuộc</label>
            <select
              className="drawer-select"
              id="drawer-select-milestone"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
            >
              {milestones.map(m => (
                <option key={m.ma_moc} value={m.ma_moc}>{m.ten_moc}</option>
              ))}
            </select>
          </div>

          <div className="drawer-field">
            <label>Người thực hiện</label>
            <select
              className="drawer-select"
              id="drawer-select-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={!canCreateTask}
            >
              <option value="">-- Chưa gán (Unassigned) --</option>
              {members.map(u => (
                <option key={u.ma_nguoi_dung} value={u.ma_nguoi_dung}>
                  {u.ho_ten} ({u.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên'})
                </option>
              ))}
            </select>
          </div>

          <div className="drawer-field">
            <label>Hạn chót hoàn thành</label>
            <input
              type="date"
              className="drawer-input"
              id="drawer-input-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="drawer-field">
            <label>Trạng thái công việc</label>
            <select
              className="drawer-select"
              id="drawer-select-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="can_lam">Cần làm</option>
              <option value="dang_lam">Đang làm</option>
              <option value="hoan_thanh">Hoàn thành</option>
              <option value="tre_han">Trễ hạn</option>
            </select>
          </div>

          <div className="drawer-field">
            <label>Nội dung mô tả</label>
            <textarea
              className="drawer-textarea"
              id="drawer-textarea-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả công việc..."
            ></textarea>
          </div>

          {/* Progress Slider & Tự Chấm Tiến Độ Cá Nhân */}
          <div className="progress-slider-wrapper" style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Tự chấm tiến độ cá nhân:</span>
                {chibiMode && (
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                    {progress === 100 ? '🎉 Hoàn tất!' : (progress >= 50 ? '⚡ Đang tiến triển' : '💪 Cố lên')}
                  </span>
                )}
              </div>
              <span className="slider-val num-tabular" id="drawer-slider-val" style={{ fontWeight: 700, fontSize: '15px', color: progress === 100 ? '#15803d' : '#1d4ed8' }}>
                {isLocked ? `${progress}% (🔒 Đã khóa)` : `${progress}%`}
              </span>
            </div>

            {/* Quick Self-Rate Pills */}
            {!isLocked && canEditProgress && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[0, 25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`btn-quick-rate-pill ${progress === val ? 'active' : ''}`}
                    onClick={() => handleQuickProgress(val)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      border: progress === val ? '2px solid #1d4ed8' : '1px solid var(--border)',
                      background: progress === val ? '#eff6ff' : '#ffffff',
                      color: progress === val ? '#1d4ed8' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            )}

            <input
              type="range"
              className="slider-control"
              id="drawer-slider"
              min="0"
              max="100"
              step="5"
              value={progress}
              disabled={!canEditProgress || isLocked}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: progress === 100 ? '#15803d' : '#1d4ed8' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>0% (Cần làm)</span>
              <span>50% (Đang làm)</span>
              <span>100% (Hoàn thành)</span>
            </div>

            {/* Sân khấu Cảm xúc Mascot khi tự chấm tiến độ */}
            {chibiMode && (
              <div
                className={`mascot-stage-card stage-${progress === 100 ? 'done' : progress >= 75 ? 'sprint' : progress >= 50 ? 'coding' : progress > 0 ? 'start' : 'wait'}`}
              >
                <div className="mascot-stage-figure">
                  <img
                    src={
                      progress === 100 ? CHIBI_ASSETS.characters.success :
                      (progress >= 75 ? CHIBI_ASSETS.characters.deadline :
                      (progress >= 50 ? CHIBI_ASSETS.characters.coding :
                      (progress > 0 ? CHIBI_ASSETS.characters.coLen : CHIBI_ASSETS.characters.emptyWait)))
                    }
                    alt="Mascot Stage"
                    className="mascot-stage-img"
                  />
                  {progress === 100 && (
                    <span className="mascot-stage-confetti">🎉✨</span>
                  )}
                </div>
                <div className="mascot-stage-dialogue">
                  <div className="mascot-stage-title">
                    {progress === 100 && '🎉 Đỉnh nóc kịch trần! (100%)'}
                    {progress >= 75 && progress < 100 && '🚀 Nước rút deadline! (75%)'}
                    {progress >= 50 && progress < 75 && '💻 Code miệt mài! (50%)'}
                    {progress > 0 && progress < 50 && '🌱 Đã khởi động! (25%)'}
                    {progress === 0 && '📌 Chờ việc vào guồng (0%)'}
                  </div>
                  <div className="mascot-stage-quote">
                    {progress === 100 && 'Mục tiêu hoàn thành mỹ mãn! Đề xuất chuyển trạng thái để Nhóm trưởng/GVHD chốt khóa.'}
                    {progress >= 75 && progress < 100 && 'Đang dốc toàn lực những bước cuối, sắp tới mốc nghiệm thu rồi!'}
                    {progress >= 50 && progress < 75 && 'Đã qua nửa chặng đường quan trọng, tiếp tục giữ vững phong độ nhé!'}
                    {progress > 0 && progress < 50 && 'Đã khảo sát và phân tích tài liệu xong, chuẩn bị tăng tốc thực thi.'}
                    {progress === 0 && 'Task chưa bắt đầu, hãy chọn % phía trên mỗi khi bạn có tiến độ mới nhé.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Locked Status Banner with Seal */}
          {isLocked && (
            <div className="task-locked-seal-banner">
              {chibiMode && (
                <img
                  src={CHIBI_ASSETS.labels.approved}
                  alt="Approved"
                  className="locked-seal-img"
                />
              )}
              <div className="locked-seal-info">
                <span className="locked-seal-title">🔒 Đã Chốt & Niêm Phong Tiến Độ</span>
                <span className="locked-seal-desc">Công việc đã được nghiệm thu và khóa bảo vệ. Chỉ Nhóm trưởng hoặc GVHD mới có quyền mở lại.</span>
              </div>
            </div>
          )}

          {/* Lock Action Button */}
          {!isLocked && canLockTask && (
            <div id="drawer-lock-action-container">
              <button
                className="btn btn-outline"
                id="btn-lock-task"
                style={{ width: '100%', borderColor: 'var(--lock-border)', color: 'var(--lock-ink)' }}
                onClick={() => handleToggleLock(true)}
              >
                🔒 Chốt & Khóa tiến độ công việc này
              </button>
            </div>
          )}

          <button
            className="btn btn-primary"
            id="btn-save-task-changes"
            style={{ width: '100%' }}
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Đang lưu vào SQLite...' : 'Lưu thay đổi'}
          </button>

          {/* Comments Section */}
          <h4 className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Thảo luận & Bình luận</span>
            {chibiMode && <span style={{ fontSize: '11px', color: '#16a34a' }}>&bull; Có Sticker Chibi</span>}
          </h4>
          <div className="comments-list" id="drawer-comments-list">
            {comments.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Chưa có bình luận nào.</div>
            ) : (
              comments.map(c => {
                const parts = renderCommentWithStickers(c.noi_dung);
                return (
                  <div key={c.ma_binh_luan || c.thoi_gian_tao} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author">{c.ten_tac_gia || 'Thành viên'}</span>
                      <span className="comment-time">{formatDate(c.thoi_gian_tao)}</span>
                    </div>
                    <div className="comment-body-content">
                      {parts.map((p, pIdx) => {
                        if (p.type === 'sticker') {
                          return (
                            <div key={pIdx} style={{ margin: '6px 0' }}>
                              <img
                                src={p.sticker.src}
                                alt={p.sticker.name}
                                title={p.sticker.name}
                                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                              />
                            </div>
                          );
                        }
                        return <span key={pIdx}>{p.content}</span>;
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticker Reaction Picker Strip - Redesigned to be Big, Clear & Fun */}
          {chibiMode && (
            <div
              className="sticker-picker-container"
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  Gửi nhanh Sticker Chibi phản hồi:
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Nhấp 1 chạm để gửi ngay
                </span>
              </div>
              <div
                className="sticker-picker-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px'
                }}
              >
                {CHIBI_ASSETS.stickers.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSendSticker(s.code)}
                    title={`Gửi sticker: ${s.name}`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 4px 6px 4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(59,130,246,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  >
                    <img
                      src={s.src}
                      alt={s.name}
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="comment-input-row">
            <input
              type="text"
              className="drawer-input"
              id="input-new-comment"
              placeholder="Viết phản hồi trao đổi..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendComment();
              }}
            />
            <button className="btn btn-outline btn-sm" id="btn-send-comment" onClick={handleSendComment}>
              Gửi
            </button>
          </div>

          {/* Attachments Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px' }}>
            <h4 className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              {chibiMode && (
                <img src={CHIBI_ASSETS.icons.upload} alt="Upload" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
              )}
              <span>Tài liệu & Tệp nộp ({attachments.length})</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Hỗ trợ PDF, Word, Excel, ZIP...</span>
          </div>

          {/* Thông báo nộp thành công */}
          {uploadSuccessMsg && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#15803d',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              ✅ {uploadSuccessMsg}
            </div>
          )}

          {/* Danh sách tệp đính kèm */}
          <div id="drawer-attachments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachments.length === 0 ? (
              <div style={{
                fontSize: '12px',
                color: 'var(--text-subtle)',
                background: 'var(--surface)',
                border: '1px dashed var(--border)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                Chưa có tài liệu hoặc báo cáo nào được nộp cho công việc này.
              </div>
            ) : (
              attachments.map(f => {
                const canDelete = isLeader || isLecturer || f.ma_nguoi_dung === currentUserId;
                const fileIcon = getFileIcon(f.ten_tep);
                return (
                  <div
                    key={f.ma_tep || f.ten_tep}
                    className="attachment-item-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{fileIcon}</span>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={f.ten_tep}
                        >
                          {f.ten_tep}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'flex', gap: '6px' }}>
                          <span>{formatFileSize(f.dung_luong)}</span>
                          <span>&bull;</span>
                          <span>{f.ten_nguoi_tai_len || 'Thành viên'}</span>
                          {f.thoi_gian_tao && (
                            <>
                              <span>&bull;</span>
                              <span>{formatDate(f.thoi_gian_tao)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {/* Nút Xem / Tải về */}
                      <a
                        href={f.duong_dan_tep || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={f.ten_tep}
                        className="btn-attachment-action"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: '#ffffff',
                          color: '#1d4ed8',
                          fontSize: '11px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        title="Tải về tệp tài liệu"
                      >
                        📥 Tải về
                      </a>

                      {/* Nút Xóa tệp (nếu có quyền) */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(f.ma_tep, f.ten_tep)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Xóa tệp đính kèm này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Nút chọn tệp từ máy tính */}
          <div style={{ marginTop: '10px' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              id="btn-upload-file-real"
              disabled={isUploading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                fontWeight: 600,
                border: '1px solid #3b82f6',
                color: '#1d4ed8',
                background: '#eff6ff',
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span>{isUploading ? '⏳ Đang nộp tệp...' : '📁 Chọn tệp từ máy để nộp tài liệu / báo cáo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
