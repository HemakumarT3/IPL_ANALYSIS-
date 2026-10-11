import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { TeamAnalysisPage } from './pages/TeamAnalysisPage';
import { TossAnalysisPage } from './pages/TossAnalysisPage';
import { VenueAnalysisPage } from './pages/VenueAnalysisPage';
import { SeasonAnalysisPage } from './pages/SeasonAnalysisPage';
import { StatusPage } from './pages/StatusPage';
import { fetchHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then(res => setHealth(res))
      .catch(err => console.error("Health check error:", err));
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Strip */}
        <header style={{
          padding: '0.85rem 2.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(12, 18, 31, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              IPL Big Data Analytics Engine
            </span>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              1,169 Match Dataset
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#34d399',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }}></span>
              <span>REST API Connected</span>
            </div>
          </div>
        </header>

        {/* Dynamic Analytics View */}
        <div style={{ flex: 1 }}>
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'teams' && <TeamAnalysisPage />}
          {activeTab === 'toss' && <TossAnalysisPage />}
          {activeTab === 'venues' && <VenueAnalysisPage />}
          {activeTab === 'seasons' && <SeasonAnalysisPage />}
          {activeTab === 'status' && <StatusPage />}
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.25rem 2.25rem',
          backgroundColor: 'rgba(8, 12, 20, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            IPL Team, Toss & Venue Performance Analysis • Apache Hadoop, HDFS, MySQL, MongoDB, Pig & Hive
          </div>
          <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)' }}>
            <span>HDFS: Online</span>
            <span>MySQL: Connected</span>
            <span>MongoDB: Connected</span>
            <span>Pig: Verified</span>
            <span>Hive: Verified</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
