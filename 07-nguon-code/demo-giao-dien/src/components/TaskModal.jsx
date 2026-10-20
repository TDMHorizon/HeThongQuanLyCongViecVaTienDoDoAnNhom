import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext.jsx';

export default function TaskModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    milestones,
    teamMembers,
    currentUserId,
    createTask
  } = useProject();

  const [title, setTitle] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isTaskModalOpen && milestones.length > 0 && !milestoneId) {
      setMilestoneId(milestones[0].ma_moc);
    }
    if (!isTaskModalOpen) {
      setTitle('');
      setAssigneeId('');
      setDeadline('');
      setDesc('');
    }
  }, [isTaskModalOpen, milestones]);

  if (!isTaskModalOpen) return null;

  const members = teamMembers?.members || [];

  const handleConfirm = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề công việc!');
      return;
    }
    if (!milestoneId) {
      alert('Vui lòng chọn mốc tiến độ trực thuộc!');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTask({
        ma_moc: milestoneId,
        tieu_de: title.trim(),
        noi_dung_mo_ta: desc.trim(),
        han_chot: deadline || null,
        ma_nguoi_thuc_hien: assigneeId || null,
        ma_nguoi_tao: currentUserId
      });
      setIsTaskModalOpen(false);
    } catch (err) {
      // error already handled or alerted
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="create-task-modal"
      className="task-drawer-overlay"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => {
        if (e.target.id === 'create-task-modal') setIsTaskModalOpen(false);
      }}
    >
      <div
        style={{
          width: '480px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-modal)',
          padding: '22px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Giao công việc mới</h3>
          <button className="btn-close" id="btn-close-modal" onClick={() => setIsTaskModalOpen(false)}>
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="drawer-field">
            <label>Tiêu đề công việc (*)</label>
            <input
              type="text"
              className="drawer-input"
              id="new-task-title"
              placeholder="Ví dụ: Thiết kế giao diện chi tiết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="drawer-field">
            <label>Mốc tiến độ trực thuộc (*)</label>
            <select
              className="drawer-select"
              id="new-task-milestone"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
            >
              {milestones.map(m => (
                <option key={m.ma_moc} value={m.ma_moc}>{m.ten_moc}</option>
              ))}
            </select>
          </div>
          <div className="drawer-field">
            <label>Phân công cho thành viên</label>
            <select
              className="drawer-select"
              id="new-task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
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
              id="new-task-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="drawer-field">
            <label>Nội dung mô tả</label>
            <textarea
              className="drawer-textarea"
              id="new-task-desc"
              placeholder="Chi tiết yêu cầu..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button className="btn btn-outline" id="btn-cancel-modal" onClick={() => setIsTaskModalOpen(false)}>
              Hủy
            </button>
            <button
              className="btn btn-primary"
              id="btn-confirm-create-task"
              disabled={isSubmitting}
              onClick={handleConfirm}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
