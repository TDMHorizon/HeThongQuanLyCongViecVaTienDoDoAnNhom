import React from 'react';
import { useProject } from './context/ProjectContext.jsx';
import BannerRoleBar from './components/BannerRoleBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import KpiCards from './components/KpiCards.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import TableView from './components/TableView.jsx';
import MilestonesView from './components/MilestonesView.jsx';
import TeamView from './components/TeamView.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';
import TaskDrawer from './components/TaskDrawer.jsx';
import TaskModal from './components/TaskModal.jsx';

export default function App() {
  const { activeTab, setActiveTab, loading, error } = useProject();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--ground)', color: 'var(--text-muted)' }}>
        Đang khởi động không gian làm việc đồ án (SQLite)...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--ground)', color: '#b91c1c', gap: '12px' }}>
        <h3>Lỗi kết nối máy chủ SQLite</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{error}</p>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <BannerRoleBar />

      <div className="workspace-wrapper">
        <Sidebar />

        <main className="main-canvas">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="canvas-body">
            {(activeTab === 'kanban' || activeTab === 'table') && <KpiCards />}

            {/* Dynamic View rendering */}
            {activeTab === 'kanban' && <KanbanBoard />}
            {activeTab === 'table' && <TableView />}
            {activeTab === 'milestones' && <MilestonesView />}
            {activeTab === 'team' && <TeamView />}
            {activeTab === 'notifications' && <NotificationCenter />}
          </div>
        </main>
      </div>

      <TaskDrawer />
      <TaskModal />
    </>
  );
}
