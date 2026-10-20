import { store } from '../state/store.js';
import { apiService } from '../services/apiService.js';
import { formatDate, formatFileSize } from '../utils/formatters.js';

export function initTaskDrawer() {
  const overlay = document.getElementById('task-drawer-overlay');
  const btnClose = document.getElementById('btn-close-drawer');
  const inputTitle = document.getElementById('drawer-input-title');
  const selectMilestone = document.getElementById('drawer-select-milestone');
  const selectAssignee = document.getElementById('drawer-select-assignee');
  const inputDeadline = document.getElementById('drawer-input-deadline');
  const selectStatus = document.getElementById('drawer-select-status');
  const textareaDesc = document.getElementById('drawer-textarea-desc');
  const slider = document.getElementById('drawer-slider');
  const sliderVal = document.getElementById('drawer-slider-val');
  const lockBanner = document.getElementById('drawer-lock-banner');
  const lockActionContainer = document.getElementById('drawer-lock-action-container');
  const btnLock = document.getElementById('btn-lock-task');
  const btnUnlock = document.getElementById('btn-unlock-task');
  const btnSave = document.getElementById('btn-save-task-changes');
  const commentsList = document.getElementById('drawer-comments-list');
  const inputComment = document.getElementById('input-new-comment');
  const btnSendComment = document.getElementById('btn-send-comment');
  const attachmentsList = document.getElementById('drawer-attachments-list');
  const btnUpload = document.getElementById('btn-upload-file-demo');

  let currentComments = [];
  let currentAttachments = [];

  async function renderDrawer(taskId) {
    if (!taskId) {
      overlay.style.display = 'none';
      return;
    }

    const task = store.state.tasks.find(t => t.ma_cong_viec === taskId);
    if (!task) return;

    // Populate Selects
    selectMilestone.innerHTML = store.state.milestones.map(m => `
      <option value="${m.ma_moc}" ${m.ma_moc === task.ma_moc ? 'selected' : ''}>${m.ten_moc}</option>
    `).join('');

    const members = store.state.teamData ? store.state.teamData.members : [];
    selectAssignee.innerHTML = `
      <option value="">-- Chưa gán (Unassigned) --</option>
      ${members.map(u => `
        <option value="${u.ma_nguoi_dung}" ${u.ma_nguoi_dung === task.ma_nguoi_thuc_hien ? 'selected' : ''}>
          ${u.ho_ten} (${u.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên'})
        </option>
      `).join('')}
    `;

    // Populate Fields
    inputTitle.value = task.tieu_de || '';
    inputDeadline.value = task.han_chot ? task.han_chot.substring(0, 10) : '';
    selectStatus.value = task.trang_thai;
    textareaDesc.value = task.noi_dung_mo_ta || '';
    slider.value = task.phan_tram_tien_do;
    sliderVal.textContent = `${task.phan_tram_tien_do}%`;

    // ==========================================
    // PHÂN QUYỀN VAI TRÒ CHẶT CHẼ TRONG DRAWER
    // ==========================================
    const isLocked = Boolean(task.trang_thai_khoa);
    const canLock = store.canLockTask(); // Chỉ GVHD và Nhóm trưởng
    const canEditProgress = store.canEditTaskProgress(task); // Người được giao hoặc Lead/GV (chỉ khi chưa khóa)

    // 1. Cờ báo trạng thái khóa
    lockBanner.style.display = isLocked ? 'flex' : 'none';
    if (btnUnlock) {
      btnUnlock.style.display = (isLocked && canLock) ? 'inline-block' : 'none';
    }

    // 2. Nút bấm Khóa tiến độ
    if (lockActionContainer) {
      lockActionContainer.style.display = (!isLocked && canLock) ? 'block' : 'none';
    }

    // 3. Slider % tiến độ
    slider.disabled = !canEditProgress;
    if (isLocked) {
      sliderVal.textContent = `${task.phan_tram_tien_do}% (Đã khóa)`;
    } else if (!canEditProgress) {
      sliderVal.textContent = `${task.phan_tram_tien_do}% (Chỉ người làm mới được sửa)`;
    }

    // 4. Các input tiêu đề / người làm (Chỉ Lead hoặc GV mới được đổi người làm)
    selectAssignee.disabled = !store.canCreateTask();

    // Tải bình luận và tệp từ SQLite API
    overlay.style.display = 'flex';
    loadComments(taskId);
    loadAttachments(taskId);
  }

  async function loadComments(taskId) {
    try {
      currentComments = await apiService.getComments(taskId);
      commentsList.innerHTML = currentComments.map(c => `
        <div class="comment-card">
          <div class="comment-header">
            <span class="comment-author">${c.ten_tac_gia || 'Thành viên'}</span>
            <span class="comment-time">${formatDate(c.thoi_gian_tao)}</span>
          </div>
          <div>${c.noi_dung}</div>
        </div>
      `).join('');
    } catch (e) {
      commentsList.innerHTML = '<div style="color: var(--text-muted); font-size: 11.5px;">Chưa có bình luận nào.</div>';
    }
  }

  async function loadAttachments(taskId) {
    try {
      currentAttachments = await apiService.getAttachments(taskId);
      if (!currentAttachments.length) {
        attachmentsList.innerHTML = '<div style="font-size: 11.5px; color: var(--text-subtle);">Chưa có tệp đính kèm nào.</div>';
        return;
      }
      attachmentsList.innerHTML = currentAttachments.map(f => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px;">
          <div>
            <div style="font-weight: 600; color: var(--text);">${f.ten_tep}</div>
            <div style="font-size: 11px; color: var(--text-subtle);">${formatFileSize(f.dung_luong)} &bull; ${f.ten_nguoi_tai_len || 'Đính kèm'}</div>
          </div>
          <span class="meta-pill" style="font-size: 10px;">${f.loai_tep}</span>
        </div>
      `).join('');
    } catch (e) {
      attachmentsList.innerHTML = '<div style="font-size: 11.5px; color: var(--text-subtle);">Chưa có tệp đính kèm.</div>';
    }
  }

  // Event Listeners
  slider.oninput = (e) => {
    sliderVal.textContent = `${e.target.value}%`;
  };

  btnClose.onclick = () => store.setSelectedTaskId(null);
  overlay.onclick = (e) => {
    if (e.target === overlay) store.setSelectedTaskId(null);
  };

  // Lưu thay đổi công việc vào SQLite
  btnSave.onclick = async () => {
    const taskId = store.state.selectedTaskId;
    if (!taskId) return;

    const task = store.state.tasks.find(t => t.ma_cong_viec === taskId);
    if (!task) return;

    btnSave.textContent = 'Đang lưu vào SQLite...';
    btnSave.disabled = true;

    try {
      const updateData = {
        tieu_de: inputTitle.value.trim(),
        ma_moc: selectMilestone.value,
        ma_nguoi_thuc_hien: selectAssignee.value || null,
        han_chot: inputDeadline.value || null,
        trang_thai: selectStatus.value,
        noi_dung_mo_ta: textareaDesc.value.trim()
      };

      if (!task.trang_thai_khoa && store.canEditTaskProgress(task)) {
        updateData.phan_tram_tien_do = parseFloat(slider.value);
      }

      await apiService.updateTask(taskId, updateData);
      await store.reloadTasks();
      store.setSelectedTaskId(null);
    } catch (err) {
      alert(`Lỗi khi lưu công việc vào CSDL: ${err.message}`);
    } finally {
      btnSave.textContent = 'Lưu thay đổi';
      btnSave.disabled = false;
    }
  };

  // Khóa tiến độ
  if (btnLock) {
    btnLock.onclick = async () => {
      const taskId = store.state.selectedTaskId;
      if (!taskId) return;
      try {
        await apiService.lockTask(taskId, store.state.currentUserId);
        await store.reloadTasks();
        renderDrawer(taskId);
      } catch (err) {
        alert(`Lỗi khi khóa tiến độ: ${err.message}`);
      }
    };
  }

  // Mở khóa tiến độ
  if (btnUnlock) {
    btnUnlock.onclick = async () => {
      const taskId = store.state.selectedTaskId;
      if (!taskId) return;
      try {
        await apiService.unlockTask(taskId);
        await store.reloadTasks();
        renderDrawer(taskId);
      } catch (err) {
        alert(`Lỗi khi mở khóa tiến độ: ${err.message}`);
      }
    };
  }

  // Gửi bình luận
  btnSendComment.onclick = async () => {
    const taskId = store.state.selectedTaskId;
    const text = inputComment.value.trim();
    if (!taskId || !text) return;

    try {
      await apiService.addComment(taskId, {
        userId: store.state.currentUserId,
        noi_dung: text
      });
      inputComment.value = '';
      loadComments(taskId);
    } catch (err) {
      alert(`Lỗi khi gửi bình luận: ${err.message}`);
    }
  };

  // Nộp tệp đính kèm
  btnUpload.onclick = async () => {
    const taskId = store.state.selectedTaskId;
    if (!taskId) return;
    const fileName = prompt("Nhập tên tệp tài liệu / báo cáo muốn nộp đính kèm:", "Bao-cao-tuan-hoan-chinh.pdf");
    if (!fileName) return;

    try {
      await apiService.addAttachment(taskId, {
        userId: store.state.currentUserId,
        ten_tep: fileName,
        loai_tep: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        dung_luong: Math.floor(Math.random() * 800000) + 20000
      });
      loadAttachments(taskId);
    } catch (err) {
      alert(`Lỗi khi nộp tệp: ${err.message}`);
    }
  };

  store.subscribe(state => {
    if (state.selectedTaskId) {
      renderDrawer(state.selectedTaskId);
    } else {
      overlay.style.display = 'none';
    }
  });
}
