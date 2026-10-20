import { store } from '../state/store.js';
import { apiService } from '../services/apiService.js';

export function initTaskModal() {
  const modal = document.getElementById('create-task-modal');
  const btnOpen = document.getElementById('btn-create-task');
  const btnClose = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel-modal');
  const btnConfirm = document.getElementById('btn-confirm-create-task');

  const inputTitle = document.getElementById('new-task-title');
  const selectMilestone = document.getElementById('new-task-milestone');
  const selectAssignee = document.getElementById('new-task-assignee');
  const inputDeadline = document.getElementById('new-task-deadline');
  const textareaDesc = document.getElementById('new-task-desc');

  function openModal() {
    if (!store.canCreateTask()) {
      alert("Chỉ Giảng viên hướng dẫn hoặc Nhóm trưởng mới có quyền giao việc mới!");
      return;
    }

    // Populate milestones
    selectMilestone.innerHTML = store.state.milestones.map(m => `
      <option value="${m.ma_moc}">${m.ten_moc}</option>
    `).join('');

    // Populate assignees
    const members = store.state.teamData ? store.state.teamData.members : [];
    selectAssignee.innerHTML = `
      <option value="">-- Chưa gán (Unassigned) --</option>
      ${members.map(u => `
        <option value="${u.ma_nguoi_dung}">
          ${u.ho_ten} (${u.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên'})
        </option>
      `).join('')}
    `;

    inputTitle.value = '';
    inputDeadline.value = '';
    textareaDesc.value = '';

    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (btnOpen) btnOpen.onclick = openModal;
  if (btnClose) btnClose.onclick = closeModal;
  if (btnCancel) btnCancel.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  btnConfirm.onclick = async () => {
    const title = inputTitle.value.trim();
    if (!title) {
      alert("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    btnConfirm.textContent = 'Đang tạo...';
    btnConfirm.disabled = true;

    try {
      await apiService.createTask({
        ma_moc: selectMilestone.value,
        tieu_de: title,
        noi_dung_mo_ta: textareaDesc.value.trim(),
        han_chot: inputDeadline.value || null,
        ma_nguoi_thuc_hien: selectAssignee.value || null,
        ma_nguoi_tao: store.state.currentUserId
      });

      await store.reloadTasks();
      closeModal();
    } catch (err) {
      alert(`Lỗi khi tạo công việc vào CSDL: ${err.message}`);
    } finally {
      btnConfirm.textContent = 'Tạo công việc';
      btnConfirm.disabled = false;
    }
  };
}
