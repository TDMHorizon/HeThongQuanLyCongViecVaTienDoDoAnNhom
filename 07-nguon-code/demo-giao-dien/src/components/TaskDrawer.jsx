import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { apiService } from '../services/apiService.js';
import { formatDate, formatFileSize } from '../utils/formatters.js';

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
    reload
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

  const handleAddAttachment = async () => {
    const fileName = prompt('Nhập tên tệp tài liệu / báo cáo muốn nộp đính kèm:', 'Bao-cao-tuan-hoan-chinh.pdf');
    if (!fileName) return;

    try {
      await apiService.addAttachment(selectedTask.ma_cong_viec, {
        userId: currentUserId,
        ten_tep: fileName,
        loai_tep: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        dung_luong: Math.floor(Math.random() * 800000) + 20000
      });
      const updated = await apiService.getAttachments(selectedTask.ma_cong_viec);
      setAttachments(updated);
    } catch (err) {
      alert(`Lỗi nộp tệp: ${err.message}`);
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
            <label>Tiêu đề công việc (tieu_de)</label>
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
            <label>Mốc tiến độ trực thuộc (ma_moc &rarr; moc_tien_do)</label>
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
            <label>Người thực hiện (ma_nguoi_thuc_hien &rarr; nguoi_dung)</label>
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
            <label>Hạn chót hoàn thành (han_chot)</label>
            <input
              type="date"
              className="drawer-input"
              id="drawer-input-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="drawer-field">
            <label>Trạng thái (trang_thai: can_lam, dang_lam, hoan_thanh, tre_han)</label>
            <select
              className="drawer-select"
              id="drawer-select-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="can_lam">Cần làm (can_lam)</option>
              <option value="dang_lam">Đang làm (dang_lam)</option>
              <option value="hoan_thanh">Hoàn thành (hoan_thanh)</option>
              <option value="tre_han">Trễ hạn (tre_han)</option>
            </select>
          </div>

          <div className="drawer-field">
            <label>Nội dung mô tả (noi_dung_mo_ta)</label>
            <textarea
              className="drawer-textarea"
              id="drawer-textarea-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả công việc..."
            ></textarea>
          </div>

          {/* Progress Slider */}
          <div className="progress-slider-wrapper">
            <div className="slider-header">
              <span>Tiến độ thực tế (phan_tram_tien_do)</span>
              <span className="slider-val num-tabular" id="drawer-slider-val">
                {isLocked ? `${progress}% (Đã khóa)` : (!canEditProgress ? `${progress}% (Chỉ người làm mới được sửa)` : `${progress}%`)}
              </span>
            </div>
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
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

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
          <h4 className="drawer-section-title">Thảo luận & Bình luận (binh_luan)</h4>
          <div className="comments-list" id="drawer-comments-list">
            {comments.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Chưa có bình luận nào.</div>
            ) : (
              comments.map(c => (
                <div key={c.ma_binh_luan || c.thoi_gian_tao} className="comment-card">
                  <div className="comment-header">
                    <span className="comment-author">{c.ten_tac_gia || 'Thành viên'}</span>
                    <span className="comment-time">{formatDate(c.thoi_gian_tao)}</span>
                  </div>
                  <div>{c.noi_dung}</div>
                </div>
              ))
            )}
          </div>
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
          <h4 className="drawer-section-title">Tệp đính kèm (tep_dinh_kem)</h4>
          <div id="drawer-attachments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachments.length === 0 ? (
              <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>Chưa có tệp đính kèm.</div>
            ) : (
              attachments.map(f => (
                <div
                  key={f.ma_tep || f.ten_tep}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{f.ten_tep}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      {formatFileSize(f.dung_luong)} &bull; {f.ten_nguoi_tai_len || 'Đính kèm'}
                    </div>
                  </div>
                  <span className="meta-pill" style={{ fontSize: '10px' }}>{f.loai_tep}</span>
                </div>
              ))
            )}
          </div>
          <div style={{ marginMount: '6px', marginTop: '6px' }}>
            <button
              className="btn btn-outline btn-sm"
              id="btn-upload-file-demo"
              style={{ width: '100%' }}
              onClick={handleAddAttachment}
            >
              + Nộp tệp tài liệu / báo cáo đính kèm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
