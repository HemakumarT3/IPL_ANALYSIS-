import React from 'react';
import { 
  BarChart3, 
  Trophy, 
  Coins, 
  MapPin, 
  TrendingUp, 
  Database,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, health }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} />, desc: 'KPIs & Top Winners' },
    { id: 'teams', label: 'Team Performance', icon: <Trophy size={18} />, desc: 'Rankings & Win Rates' },
    { id: 'toss', label: 'Toss Analysis', icon: <Coins size={18} />, desc: 'Decision & Win Advantage' },
    { id: 'venues', label: 'Venue Analytics', icon: <MapPin size={18} />, desc: 'Defend vs Chase Biases' },
    { id: 'seasons', label: 'Season Trends', icon: <TrendingUp size={18} />, desc: 'Historical Dominance' },
    { id: 'status', label: 'Engine Status', icon: <Database size={18} />, desc: 'Parity & Cluster Verification' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
        }}>
          🏏
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
            IPL Big Data
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Analytics Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
          ANALYTICS MODULES
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} style={{ color: 'var(--accent-blue)' }} />}
            </button>
          );
        })}
      </nav>

      {/* Live Cluster Footer */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            HADOOP CLUSTER ACTIVE
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Hive • Pig • MySQL • MongoDB
        </p>
      </div>
    </aside>
  );
};
