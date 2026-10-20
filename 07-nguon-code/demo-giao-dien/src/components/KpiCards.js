import { store } from '../state/store.js';

export function initKpiCards() {
  const kpiTotal = document.getElementById('kpi-total-tasks');
  const kpiInProgress = document.getElementById('kpi-in-progress');
  const kpiCompleted = document.getElementById('kpi-completed');
  const kpiOverdue = document.getElementById('kpi-overdue');

  function render() {
    const tasks = store.getFilteredTasks();

    const inProgress = tasks.filter(t => t.trang_thai === 'dang_lam').length;
    const completed = tasks.filter(t => t.trang_thai === 'hoan_thanh').length;
    const overdue = tasks.filter(t => t.trang_thai === 'tre_han').length;

    if (kpiTotal) kpiTotal.textContent = tasks.length;
    if (kpiInProgress) kpiInProgress.textContent = inProgress;
    if (kpiCompleted) kpiCompleted.textContent = completed;
    if (kpiOverdue) kpiOverdue.textContent = overdue;
  }

  store.subscribe(render);
  render();
}
