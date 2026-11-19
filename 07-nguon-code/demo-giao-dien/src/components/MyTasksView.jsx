import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate, formatFileSize, isTaskOverdue, getDaysOverdue } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function MyTasksView() {
  const {
    tasks,
    currentUser,
    currentUserId,
    setSelectedTaskId,
    selfRateTask,
    chibiMode
  } = useProject();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'todo' | 'in_progress' | 'done' | 'overdue'

  // Lọc tất cả công việc của người đang đăng nhập
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.ma_nguoi_thuc_hien === currentUserId);
  }, [tasks, currentUserId]);

  // Phân nhóm công việc theo yêu cầu: Sẽ làm, Đang làm, Đã làm và Trễ hạn (đếm kĩ)
  const todoTasks = useMemo(() => {
    return myTasks.filter(t => (t.trang_thai === 'can_lam' || Number(t.phan_tram_tien_do) === 0) && !isTaskOverdue(t));
  }, [myTasks]);

  const inProgressTasks = useMemo(() => {
    return myTasks.filter(t => {
      const p = Number(t.phan_tram_tien_do);
      return (t.trang_thai === 'dang_lam' || (p > 0 && p < 100)) && !isTaskOverdue(t);
    });
  }, [myTasks]);

  const doneTasks = useMemo(() => {
    return myTasks.filter(t => t.trang_thai === 'hoan_thanh' || Number(t.phan_tram_tien_do) >= 100);
  }, [myTasks]);

  // Đếm cho kĩ trễ hạn: bất kỳ công việc nào chưa hoàn thành mà đã quá ngày hạn chót
  const overdueTasks = useMemo(() => {
    return myTasks.filter(t => isTaskOverdue(t));
  }, [myTasks]);

  // Tỉ lệ hoàn thành cá nhân
  const completionRate = myTasks.length > 0 
    ? Math.round((doneTasks.length / myTasks.length) * 100) 
    : 0;

  return (
    <div className="view-container my-tasks-page" style={{ padding: '20px 24px', overflowY: 'auto' }}>
      {/* Banner người dùng cá nhân */}
      <div className="my-tasks-header" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#1d4ed8',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700
          }}>
            {currentUser?.ho_ten ? currentUser.ho_ten.split(' ').slice(-1)[0][0] : '👤'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Không gian việc cá nhân — {currentUser?.ho_ten || 'Thành viên'}
              </h2>
              <span className="badge" style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600
              }}>
                {currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên nhóm'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Theo dõi chính xác tiến độ cá nhân: việc cần làm, việc đang làm, việc đã xong và cảnh báo hạn chót.
            </p>
          </div>
        </div>

        {/* Thanh tiến độ cá nhân */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tỉ lệ hoàn thành của bạn</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: completionRate === 100 ? '#15803d' : '#1d4ed8' }}>
              {completionRate}%
            </div>
          </div>
          <div style={{
            width: '100px',
            height: '10px',
            background: 'var(--border)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: completionRate === 100 ? '#15803d' : '#1d4ed8',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* 4 Thẻ chỉ số cá nhân - Đếm kỹ Trễ hạn */}
      <div className="my-tasks-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Sẽ làm */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'todo' ? 'all' : 'todo')}
          style={{
            background: activeFilter === 'todo' ? '#eff6ff' : 'var(--surface)',
            border: activeFilter === 'todo' ? '2px solid #3b82f6' : '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>📋 Sẽ làm (Cần làm)</span>
            <span style={{ fontSize: '18px' }}>📝</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{todoTasks.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>Chưa bắt đầu thực hiện</div>
        </div>

        {/* Đang làm */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'in_progress' ? 'all' : 'in_progress')}
          style={{
            background: activeFilter === 'in_progress' ? '#eff6ff' : 'var(--surface)',
            border: activeFilter === 'in_progress' ? '2px solid #1d4ed8' : '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>⚡ Đang thực hiện</span>
            <span style={{ fontSize: '18px' }}>⏳</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1d4ed8' }}>{inProgressTasks.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>Đang trong hạn quy định</div>
        </div>

        {/* Đã làm */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'done' ? 'all' : 'done')}
          style={{
            background: activeFilter === 'done' ? '#f0fdf4' : 'var(--surface)',
            border: activeFilter === 'done' ? '2px solid #15803d' : '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>✅ Đã hoàn thành</span>
            <span style={{ fontSize: '18px' }}>🎉</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#15803d' }}>{doneTasks.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>Đã đạt 100% tiến độ</div>
        </div>

        {/* CẢNH BÁO TRỄ HẠN - ĐẾM THẬT KĨ */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
          style={{
            background: overdueTasks.length > 0 ? (activeFilter === 'overdue' ? '#fee2e2' : '#fef2f2') : 'var(--surface)',
            border: overdueTasks.length > 0 ? '2px solid #dc2626' : '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: overdueTasks.length > 0 ? '#b91c1c' : 'var(--text-muted)' }}>
              🚨 CẢNH BÁO TRỄ HẠN
            </span>
            <span style={{ fontSize: '18px' }}>🔥</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#b91c1c' }}>{overdueTasks.length}</div>
          <div style={{ fontSize: '11px', color: overdueTasks.length > 0 ? '#b91c1c' : 'var(--text-subtle)', fontWeight: overdueTasks.length > 0 ? 600 : 400, marginTop: '4px' }}>
            {overdueTasks.length > 0 ? '⚠️ Cần ưu tiên xử lý gấp!' : 'Không có việc nào trễ hạn'}
          </div>
        </div>
      </div>

      {/* Bộ lọc trạng thái */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Tất cả việc của bạn ({myTasks.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveFilter('todo')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Sẽ làm ({todoTasks.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setActiveFilter('in_progress')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Đang làm ({inProgressTasks.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'done' ? 'active' : ''}`}
            onClick={() => setActiveFilter('done')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Đã hoàn thành ({doneTasks.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveFilter('overdue')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              color: activeFilter === 'overdue' ? '#ffffff' : '#b91c1c',
              background: activeFilter === 'overdue' ? '#b91c1c' : '#fef2f2',
              borderColor: '#fca5a5',
              fontWeight: 600
            }}
          >
            🔥 Đã trễ hạn ({overdueTasks.length})
          </button>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
          Bấm vào công việc để xem chi tiết & nộp tài liệu
        </span>
      </div>

      {/* Hiển thị 3 Cột Tổng Quan hoặc Danh Sách Lọc */}
      {activeFilter === 'all' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          alignItems: 'start'
        }}>
          {/* CỘT 1: SẼ LÀM */}
          <div className="my-task-col" style={{
            background: 'var(--surface-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>📋 Sẽ làm (Cần làm)</span>
                <span className="col-badge" style={{ background: '#3b82f6', color: '#fff' }}>{todoTasks.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todoTasks.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12px' }}>
                  Không có công việc nào đang chờ.
                </div>
              ) : (
                todoTasks.map(task => renderPersonalCard(task, false))
              )}
            </div>
          </div>

          {/* CỘT 2: ĐANG LÀM */}
          <div className="my-task-col" style={{
            background: 'var(--surface-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>⚡ Đang thực hiện</span>
                <span className="col-badge" style={{ background: '#1d4ed8', color: '#fff' }}>{inProgressTasks.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inProgressTasks.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12px' }}>
                  Chưa có công việc nào đang làm dở.
                </div>
              ) : (
                inProgressTasks.map(task => renderPersonalCard(task, false))
              )}
            </div>
          </div>

          {/* CỘT 3: ĐÃ LÀM XONG */}
          <div className="my-task-col" style={{
            background: 'var(--surface-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>✅ Đã làm (Hoàn thành)</span>
                <span className="col-badge" style={{ background: '#15803d', color: '#fff' }}>{doneTasks.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doneTasks.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12px' }}>
                  Chưa có công việc hoàn thành.
                </div>
              ) : (
                doneTasks.map(task => renderPersonalCard(task, false))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Danh sách lọc theo tab cụ thể (Ví dụ: danh sách việc trễ hạn) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(activeFilter === 'todo' ? todoTasks :
            activeFilter === 'in_progress' ? inProgressTasks :
            activeFilter === 'done' ? doneTasks :
            overdueTasks).map(task => renderPersonalCard(task, true))}
        </div>
      )}
    </div>
  );

  // Render thẻ công việc cá nhân
  function renderPersonalCard(task, isExpanded = false) {
    const isOverdue = isTaskOverdue(task);
    const daysOverdue = isOverdue ? getDaysOverdue(task.han_chot) : 0;
    const isDone = task.trang_thai === 'hoan_thanh' || Number(task.phan_tram_tien_do) >= 100;
    const isLocked = Boolean(task.trang_thai_khoa);

    return (
      <div
        key={task.ma_cong_viec}
        className="my-task-card"
        onClick={() => setSelectedTaskId(task.ma_cong_viec)}
        style={{
          background: '#ffffff',
          border: isOverdue ? '2px solid #ef4444' : (isDone ? '1px solid #86efac' : '1px solid var(--border)'),
          borderRadius: '8px',
          padding: '12px 14px',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease',
          position: 'relative'
        }}
      >
        {/* Header thẻ: Tên việc + Trạng thái khóa */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <h4 style={{
            fontSize: '13.5px',
            fontWeight: 600,
            margin: 0,
            color: 'var(--text)',
            lineHeight: 1.35
          }}>
            {task.tieu_de}
          </h4>
          {isLocked && (
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, fontWeight: 600 }}>
              🔒 Đã khóa
            </span>
          )}
        </div>

        {/* Mốc tiến độ */}
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          🏷️ {task.ten_moc || 'Chưa gán mốc'}
        </div>

        {/* Nhãn thời gian & Cảnh báo trễ hạn */}
        <div style={{ marginBottom: '10px' }}>
          {isOverdue ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#000000',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600
            }}>
              <span>🔥</span>
              <span>Đã hết hạn vào ngày {formatDate(task.han_chot)}</span>
              {daysOverdue > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 700 }}> (Quá {daysOverdue} ngày)</span>
              )}
            </div>
          ) : isDone ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#000000',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600
            }}>
              <span>✅</span>
              <span>Đã hoàn thành</span>
            </div>
          ) : task.han_chot ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f4f4f5',
              border: '1px solid #e4e4e7',
              color: '#000000',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600
            }}>
              <span>📅</span>
              <span>Hạn chót: {formatDate(task.han_chot)}</span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Chưa đặt hạn chót</span>
          )}
        </div>

        {/* Nút tự chấm tiến độ % */}
        {!isLocked && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', marginRight: '2px' }}>Tự chấm:</span>
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                className={`btn-quick-rate ${task.phan_tram_tien_do === pct ? 'active' : ''}`}
                onClick={() => selfRateTask(task.ma_cong_viec, pct)}
                style={{ padding: '2px 8px', fontSize: '10.5px' }}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        {/* Footer: Thanh tiến độ % + Nút nộp tệp */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '60px',
              height: '6px',
              background: '#e4e4e7',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${task.phan_tram_tien_do || 0}%`,
                height: '100%',
                background: isDone ? '#15803d' : (isOverdue ? '#dc2626' : '#1d4ed8')
              }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>
              {task.phan_tram_tien_do || 0}%
            </span>
          </div>

          <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600 }}>
            Chi tiết & Nộp bài &rarr;
          </span>
        </div>
      </div>
    );
  }
}

