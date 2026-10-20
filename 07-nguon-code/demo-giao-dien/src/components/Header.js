import { store } from '../state/store.js';
import { formatDate } from '../utils/formatters.js';

export function initHeader() {
  const projectTitle = document.getElementById('project-title-heading');
  const pillCourse = document.getElementById('pill-course-name');
  const pillType = document.getElementById('pill-project-type');
  const pillInstructor = document.getElementById('pill-instructor');
  const progressFill = document.getElementById('overall-progress-fill');
  const progressText = document.getElementById('overall-progress-text');
  const btnCreate = document.getElementById('btn-create-task');
  const btnFilterMilestone = document.getElementById('btn-filter-milestone');
  const labelFilterMilestone = document.getElementById('label-filter-milestone');
  const dropdownMenu = document.getElementById('dropdown-milestones-menu');
  const headerActions = document.querySelector('.header-actions');

  // Thêm Scope Filter Toggle vào header-actions nếu chưa có
  let scopeToggle = document.getElementById('scope-filter-toggle');
  if (!scopeToggle && headerActions && btnFilterMilestone) {
    scopeToggle = document.createElement('div');
    scopeToggle.id = 'scope-filter-toggle';
    scopeToggle.style.display = 'inline-flex';
    scopeToggle.style.gap = '4px';
    const wrapper = btnFilterMilestone.closest('.milestone-dropdown-wrapper') || btnFilterMilestone;
    headerActions.insertBefore(scopeToggle, wrapper);
  }

  // Render Dropdown Items
  function renderDropdownItems() {
    if (!dropdownMenu) return;

    const currentFilter = store.state.filterMilestoneId;
    const milestones = store.state.milestones;

    let itemsHtml = `
      <div class="dropdown-header-title">Lọc công việc theo mốc tiến độ</div>
      <div class="dropdown-item ${currentFilter === 'all' ? 'active' : ''}" data-milestone-id="all">
        <span>Tất cả các mốc (Toàn bộ)</span>
        ${currentFilter === 'all' ? '<span style="color: #15803d; font-weight: 700;">✓</span>' : ''}
      </div>
      <div class="dropdown-divider"></div>
    `;

    milestones.forEach(m => {
      const isSelected = currentFilter === m.ma_moc;
      itemsHtml += `
        <div class="dropdown-item ${isSelected ? 'active' : ''}" data-milestone-id="${m.ma_moc}">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-weight: 500;">${m.ten_moc}</span>
            <span style="font-size: 11px; color: var(--text-subtle);">Hạn chót: ${formatDate(m.han_hoan_thanh)}</span>
          </div>
          ${isSelected ? '<span style="color: #15803d; font-weight: 700; margin-left: 8px;">✓</span>' : ''}
        </div>
      `;
    });

    dropdownMenu.innerHTML = itemsHtml;

    // Attach click events to each dropdown item
    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const milestoneId = item.dataset.milestoneId;
        store.setFilterMilestone(milestoneId);
        dropdownMenu.style.display = 'none';
      };
    });
  }

  function render() {
    if (!store.state.projectData) return;
    const project = store.state.projectData.project;
    const instructor = store.state.projectData.instructor;

    projectTitle.textContent = project.ten_do_an;
    pillCourse.textContent = project.ten_mon_hoc;
    pillType.textContent = `Loại: ${project.loai_do_an === 'co_so' ? 'Đồ án cơ sở' : project.loai_do_an}`;
    pillInstructor.textContent = `GVHD: ${instructor ? instructor.ho_ten : 'N/A'}`;

    // Overall Progress
    const overall = (project.tien_do_tong || 0.0).toFixed(1);
    progressFill.style.width = `${overall}%`;
    progressText.textContent = `${overall}%`;

    // Quyền giao việc: Chỉ GVHD và Nhóm trưởng mới thấy nút "+ Giao việc mới"
    if (btnCreate) {
      btnCreate.style.display = store.canCreateTask() ? 'inline-flex' : 'none';
    }

    // Role-specific scope filter (Việc của tôi vs Việc toàn nhóm)
    if (scopeToggle) {
      if (store.isLecturer()) {
        scopeToggle.style.display = 'none'; // GVHD luôn xem toàn nhóm
      } else {
        scopeToggle.style.display = 'inline-flex';
        scopeToggle.innerHTML = `
          <div class="view-tabs" style="margin-right: 4px;">
            <button class="tab-btn ${store.state.filterScope === 'my_tasks' ? 'active' : ''}" id="btn-scope-my" style="padding: 4px 10px; font-size: 11.5px;">Việc của tôi</button>
            <button class="tab-btn ${store.state.filterScope === 'all_tasks' ? 'active' : ''}" id="btn-scope-all" style="padding: 4px 10px; font-size: 11.5px;">Toàn nhóm</button>
          </div>
        `;

        const btnMy = scopeToggle.querySelector('#btn-scope-my');
        const btnAll = scopeToggle.querySelector('#btn-scope-all');
        if (btnMy) btnMy.onclick = () => store.setFilterScope('my_tasks');
        if (btnAll) btnAll.onclick = () => store.setFilterScope('all_tasks');
      }
    }

    // Milestone Filter Button Label & Active Highlight
    if (btnFilterMilestone && labelFilterMilestone) {
      const activeMilestone = store.state.milestones.find(m => m.ma_moc === store.state.filterMilestoneId);
      if (activeMilestone) {
        labelFilterMilestone.textContent = activeMilestone.ten_moc.split(':')[0]; // Ví dụ: "Mốc 1", "Mốc 2"
        btnFilterMilestone.style.backgroundColor = 'var(--surface-subtle)';
        btnFilterMilestone.style.borderColor = 'var(--text)';
        btnFilterMilestone.style.fontWeight = '600';
      } else {
        labelFilterMilestone.textContent = 'Lọc theo Mốc';
        btnFilterMilestone.style.backgroundColor = 'transparent';
        btnFilterMilestone.style.borderColor = 'var(--border)';
        btnFilterMilestone.style.fontWeight = '500';
      }
    }

    renderDropdownItems();
  }

  // Toggle Dropdown Menu
  if (btnFilterMilestone && dropdownMenu) {
    btnFilterMilestone.onclick = (e) => {
      e.stopPropagation();
      const isVisible = dropdownMenu.style.display === 'flex';
      dropdownMenu.style.display = isVisible ? 'none' : 'flex';
    };

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!btnFilterMilestone.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
  }

  store.subscribe(render);
  render();
}
