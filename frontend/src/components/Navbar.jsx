import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Database, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, health }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const mainNav = [
    { id: 'home', label: 'Home' },
    { id: 'overview', label: 'Overview' },
    { id: 'points', label: 'Points Table' },
    { id: 'teams', label: 'Teams' },
    { id: 'toss', label: 'Toss Analysis' },
    { id: 'venues', label: 'Venues' },
    { id: 'seasons', label: 'Seasons' }
  ];

  const moreItems = [
    { id: 'status', label: 'Cluster Parity Engine', icon: <Database size={15} /> },
    { id: 'quality', label: 'Data Quality & Audit', icon: <ShieldCheck size={15} /> }
  ];

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isApiOnline = health && health.status === 'healthy';

  return (
    <header className="ipl-navbar">
      <div className="ipl-nav-inner">
        {/* Left: Custom Cricket Brandmark */}
        <div className="ipl-brand" onClick={() => handleNav('home')}>
          <div className="ipl-brand-badge">
            <span style={{ fontSize: '1.4rem' }}>🏏</span>
          </div>
          <div className="ipl-brand-title">
            <span>IPL Analytics</span>
            <span className="ipl-brand-sub">Big Data Platform</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className={`ipl-nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {mainNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`ipl-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}

          {/* More Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`ipl-nav-link ${['status', 'quality'].includes(activeTab) ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>More</span>
              <ChevronDown size={14} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {moreDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#0d1e44',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                padding: '6px',
                minWidth: '200px',
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: activeTab === item.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      color: activeTab === item.id ? '#38bdf8' : '#ffffff',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Live Engine Indicator & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isApiOnline ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${isApiOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: isApiOnline ? '#34d399' : '#f87171',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isApiOnline ? '#10b981' : '#ef4444',
              boxShadow: isApiOnline ? '0 0 6px #10b981' : '0 0 6px #ef4444'
            }}></span>
            <span className="hidden sm:inline">{isApiOnline ? 'API LIVE' : 'OFFLINE'}</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'none',
              padding: '6px'
            }}
            className="md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};
