import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';

export default function MiniCalendarWidget() {
  const { filteredTasks, milestones, setSelectedTaskId } = useProject();

  // Mặc định tháng hiển thị: Tháng 10/2026 (trùng dữ liệu mẫu đồ án) hoặc tháng hiện tại
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    if (today.getFullYear() === 2026) return today;
    return new Date(2026, 9, 15); // Tháng 10/2026 (index 9)
  });

  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  // Điều hướng tháng
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today.getFullYear() === 2026 ? today : new Date(2026, 9, 21));
    setSelectedDate(null);
  };

  // Tính toán các ngày trong lưới lịch 7 cột (Thứ Hai -> Chủ Nhật)
  const calendarCells = useMemo(() => {
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Ngày của tháng trước lấp đầu hàng
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const iso = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateString: iso,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // Ngày của tháng hiện tại
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateString: iso,
        isCurrentMonth: true,
        isToday: iso === todayStr
      });
    }

    // Ngày của tháng sau lấp đủ số ô chia hết cho 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const iso = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateString: iso,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    return cells;
  }, [year, month]);

  // Gom các sự kiện theo ngày YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {};

    // 1. Milestones
    milestones.forEach(m => {
      if (!m.han_hoan_thanh) return;
      const dateKey = m.han_hoan_thanh.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push({
        type: 'milestone',
        id: m.ma_moc,
        title: m.ten_moc,
        shortTitle: m.ten_moc.split(':')[0] || m.ten_moc,
        isMilestone: true
      });
    });

    // 2. Tasks
    filteredTasks.forEach(t => {
      if (!t.han_chot) return;
      const dateKey = t.han_chot.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push({
        type: 'task',
        id: t.ma_cong_viec,
        title: t.tieu_de,
        status: t.trang_thai,
        progress: t.phan_tram_tien_do,
        assignee: t.ten_nguoi_thuc_hien,
        isLocked: Boolean(t.trang_thai_khoa)
      });
    });

    return map;
  }, [filteredTasks, milestones]);

  // Danh sách hạn chót sắp tới trong cả tháng
  const upcomingDeadlines = useMemo(() => {
    const list = [];
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    milestones.forEach(m => {
      if (m.han_hoan_thanh && m.han_hoan_thanh.startsWith(monthPrefix)) {
        list.push({
          type: 'milestone',
          id: m.ma_moc,
          title: m.ten_moc,
          date: m.han_hoan_thanh.substring(0, 10),
          isMilestone: true
        });
      }
    });

    filteredTasks.forEach(t => {
      if (t.han_chot && t.han_chot.startsWith(monthPrefix)) {
        list.push({
          type: 'task',
          id: t.ma_cong_viec,
          title: t.tieu_de,
          date: t.han_chot.substring(0, 10),
          status: t.trang_thai,
          progress: t.phan_tram_tien_do,
          assignee: t.ten_nguoi_thuc_hien
        });
      }
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTasks, milestones, year, month]);

  // Các sự kiện hiển thị ở danh sách dưới (ưu tiên ngày đang được chọn nếu có)
  const displayedItems = useMemo(() => {
    if (selectedDate) {
      const items = eventsByDate[selectedDate] || [];
      return items.map(item => ({
        ...item,
        date: selectedDate
      }));
    }
    return upcomingDeadlines;
  }, [selectedDate, eventsByDate, upcomingDeadlines]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Hàm xác định màu nền của ô ngày theo độ ưu tiên
  const getCellColorClass = (events) => {
    if (!events || events.length === 0) return '';
    if (events.some(e => e.status === 'tre_han')) return 'cell-overdue';
    if (events.some(e => e.isMilestone)) return 'cell-milestone';
    if (events.some(e => e.status === 'dang_lam')) return 'cell-in-progress';
    if (events.every(e => e.status === 'hoan_thanh')) return 'cell-done';
    return 'cell-todo';
  };

  return (
    <aside className="mini-calendar-widget" aria-label="Lịch tiến độ và hạn chót">
      {/* Widget Header */}
      <div className="mini-cal-header">
        <div className="mini-cal-title-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="mini-cal-title">Lịch Hạn Chót & Mốc</span>
        </div>
      </div>

      {/* Month Navigation Row */}
      <div className="mini-cal-nav-row">
        <div className="mini-cal-month-stepper">
          <button className="mini-cal-nav-btn" onClick={handlePrevMonth} title="Tháng trước">
            ‹
          </button>
          <span className="mini-cal-current-month num-tabular">
            {monthNames[month]} / {year}
          </span>
          <button className="mini-cal-nav-btn" onClick={handleNextMonth} title="Tháng sau">
            ›
          </button>
        </div>
        <button className="mini-cal-today-btn" onClick={handleGoToday}>
          Hôm nay
        </button>
      </div>

      {/* Color Legend (Ghi chú màu ô ngày) */}
      <div className="mini-cal-legend-bar">
        <span className="legend-item"><span className="legend-dot dot-milestone"></span> Mốc</span>
        <span className="legend-item"><span className="legend-dot dot-dang-lam"></span> Đang làm</span>
        <span className="legend-item"><span className="legend-dot dot-hoan-thanh"></span> Xong</span>
        <span className="legend-item"><span className="legend-dot dot-tre-han"></span> Trễ</span>
      </div>

      {/* 7-column Calendar Grid (Chỉ hiển thị số ngày và tô màu ô) */}
      <div className="mini-cal-grid-wrapper">
        <div className="mini-cal-weekdays-row">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>

        <div className="mini-cal-days-grid">
          {calendarCells.map((cell, idx) => {
            const events = eventsByDate[cell.dateString] || [];
            const isSelected = selectedDate === cell.dateString;
            const colorClass = getCellColorClass(events);

            // Xây dựng tooltip chi tiết khi rê chuột
            let tooltip = cell.dateString;
            if (events.length > 0) {
              const titles = events.map(e => `${e.isMilestone ? '[Mốc] ' : ''}${e.title}`).join('\n• ');
              tooltip = `${cell.dateString} (${events.length} sự kiện):\n• ${titles}`;
            }

            return (
              <div
                key={idx}
                className={`mini-cal-day-cell ${
                  !cell.isCurrentMonth ? 'other-month' : ''
                } ${cell.isToday ? 'is-today' : ''} ${
                  isSelected ? 'is-selected' : ''
                } ${colorClass}`}
                onClick={() => {
                  setSelectedDate(prev => (prev === cell.dateString ? null : cell.dateString));
                }}
                title={tooltip}
              >
                <span className="mini-cal-day-num num-tabular">
                  {cell.dayNumber}
                </span>

                {/* Các chấm nhỏ nếu có nhiều hơn 1 sự kiện */}
                {events.length > 0 && (
                  <div className="mini-cal-dot-row">
                    {events.slice(0, 3).map((e, eIdx) => {
                      const dotType = e.isMilestone ? 'dot-milestone' : `dot-${e.status}`;
                      return <span key={eIdx} className={`mini-cell-dot ${dotType}`}></span>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadlines Section below grid */}
      <div className="mini-cal-upcoming-section">
        <div className="mini-cal-upcoming-header">
          {selectedDate ? (
            <div className="selected-date-header">
              <span>Ngày {formatDate(selectedDate)} ({displayedItems.length})</span>
              <button
                className="btn-clear-date"
                onClick={() => setSelectedDate(null)}
                title="Xem toàn bộ hạn chót trong tháng"
              >
                Xem cả tháng
              </button>
            </div>
          ) : (
            <span>Hạn chót trong {monthNames[month]} ({displayedItems.length})</span>
          )}
        </div>

        <div className="mini-cal-upcoming-list">
          {displayedItems.length === 0 ? (
            <div className="mini-cal-empty">
              {selectedDate ? 'Không có hạn chót nào trong ngày này.' : 'Không có hạn chót nào trong tháng này.'}
            </div>
          ) : (
            displayedItems.map((item, idx) => {
              const dParts = item.date.split('-');
              const dayMonthStr = `${dParts[2]}/${dParts[1]}`;

              if (item.isMilestone) {
                return (
                  <div key={`up-m-${item.id}-${idx}`} className="upcoming-item milestone-item">
                    <span className="upcoming-date num-tabular">{dayMonthStr}</span>
                    <span className="upcoming-pill-tag tag-milestone">Mốc</span>
                    <span className="upcoming-title" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                );
              }

              let statusTag = 'tag-can-lam';
              let statusLabel = 'Cần làm';
              if (item.status === 'tre_han') {
                statusTag = 'tag-tre-han';
                statusLabel = 'Trễ hạn';
              } else if (item.status === 'hoan_thanh') {
                statusTag = 'tag-hoan-thanh';
                statusLabel = 'Xong';
              } else if (item.status === 'dang_lam') {
                statusTag = 'tag-dang-lam';
                statusLabel = 'Đang làm';
              }

              return (
                <div
                  key={`up-t-${item.id}-${idx}`}
                  className="upcoming-item task-item"
                  onClick={() => setSelectedTaskId(item.id)}
                  title="Nhấn để mở chi tiết công việc"
                >
                  <span className="upcoming-date num-tabular">{dayMonthStr}</span>
                  <span className={`upcoming-pill-tag ${statusTag}`}>{statusLabel}</span>
                  <span className="upcoming-title">{item.title}</span>
                  <span className="upcoming-progress num-tabular">{item.progress}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
