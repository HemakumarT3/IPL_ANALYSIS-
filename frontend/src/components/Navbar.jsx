import React from 'react';
import { 
  BarChart3, 
  Trophy, 
  Coins, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, health }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
    { id: 'teams', label: 'Team Rankings', icon: <Trophy size={17} /> },
    { id: 'toss', label: 'Toss Analytics', icon: <Coins size={17} /> },
    { id: 'venues', label: 'Venue Bias', icon: <MapPin size={17} /> },
    { id: 'seasons', label: 'Seasons & Rivalries', icon: <Calendar size={17} /> },
    { id: 'validation', label: 'Engine Validation', icon: <CheckCircle2 size={17} /> },
    { id: 'quality', label: 'Data Quality', icon: <ShieldCheck size={17} /> },
  ];

  return (
    <header style={{
      background: 'rgba(18, 23, 34, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 2rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
          }}>
            🏏
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              IPL Big Data Analytics
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Hadoop • HDFS • Hive • Pig • MySQL • MongoDB
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Health Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: '#34d399',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          <span>4 Engines Online</span>
        </div>
      </div>
    </header>
  );
};
