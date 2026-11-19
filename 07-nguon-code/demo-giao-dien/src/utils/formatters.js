/**
 * Các hàm tiện ích định dạng dữ liệu hiển thị (TasteSkill & CSDL)
 */

export function formatDate(isoStr) {
  if (!isoStr) return 'Chưa gán';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Kiểm tra chuẩn xác xem một công việc có bị trễ hạn hay không:
 * - Đã hoàn thành (100% hoặc trang_thai === 'hoan_thanh') thì KHÔNG tính là trễ
 * - Trạng thái là 'tre_han' HOẶC (có han_chot và ngày han_chot < hôm nay)
 */
export function isTaskOverdue(task) {
  if (!task) return false;
  if (task.trang_thai === 'hoan_thanh' || Number(task.phan_tram_tien_do) >= 100) return false;
  if (task.trang_thai === 'tre_han') return true;
  if (!task.han_chot) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.han_chot);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Tính số ngày trễ hạn của một công việc
 */
export function getDaysOverdue(hanChot) {
  if (!hanChot) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(hanChot);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
