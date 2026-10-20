import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';

export default function TableView() {
  const { filteredTasks, setSelectedTaskId } = useProject();

  return (
    <div id="view-table-container" className="view-container">
      <div className="table-view-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>Tiêu đề công việc</th>
              <th style={{ width: '20%' }}>Mốc trực thuộc</th>
              <th style={{ width: '16%' }}>Người phụ trách</th>
              <th style={{ width: '12%' }}>Hạn chót</th>
              <th style={{ width: '8%', textAlign: 'right' }}>% Tiến độ</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Khóa</th>
            </tr>
          </thead>
          <tbody id="table-tasks-body">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  Không có công việc nào trong danh mục này.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => {
                const isLocked = Boolean(task.trang_thai_khoa);
                return (
                  <tr
                    key={task.ma_cong_viec}
                    data-task-id={task.ma_cong_viec}
                    onClick={() => setSelectedTaskId(task.ma_cong_viec)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>
                      {task.tieu_de}
                      {isLocked && <span style={{ fontSize: '11px', color: '#b45309', marginLeft: '4px' }}>&#128274;</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{task.ten_moc || 'N/A'}</td>
                    <td>
                      {task.ten_nguoi_thuc_hien || (
                        <span style={{ color: 'var(--text-subtle)' }}>Chưa gán</span>
                      )}
                    </td>
                    <td className="date-cell">{formatDate(task.han_chot)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }} className="num-tabular">
                      {task.phan_tram_tien_do}%
                    </td>
                    <td style={{ textAlign: 'center' }}>{isLocked ? '🔒' : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
