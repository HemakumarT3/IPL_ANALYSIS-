import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, HardDrive } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="ipl-footer">
      <div className="ipl-footer-inner">
        <div className="ipl-footer-grid">
          {/* Col 1: About Platform */}
          <div className="ipl-footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>🏏</span>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' }}>
                  IPL Analytics Platform
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--ipl-accent-gold)', fontWeight: '700' }}>
                  Big Data Engineering Engine
                </span>
              </div>
            </div>
            <p>
              An independent, polyglot Big Data analytics engine processing 1,169 official IPL matches across 18 tournament seasons (2008–2025). 
              Executing identical analytical logic across Hadoop HDFS, Apache Pig, Apache Hive, MySQL 8.4 RDBMS, and MongoDB 8.0 NoSQL with verified 100% mathematical parity.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="ipl-footer-col">
            <h4>Quick Navigation</h4>
            <ul className="ipl-footer-links">
              <li><button onClick={() => setActiveTab('home')}>Home</button></li>
              <li><button onClick={() => setActiveTab('overview')}>Overview</button></li>
              <li><button onClick={() => setActiveTab('points')}>Points Table</button></li>
              <li><button onClick={() => setActiveTab('teams')}>Franchise Teams</button></li>
              <li><button onClick={() => setActiveTab('toss')}>Toss Analysis</button></li>
              <li><button onClick={() => setActiveTab('venues')}>Venue Intelligence</button></li>
              <li><button onClick={() => setActiveTab('seasons')}>Season History</button></li>
            </ul>
          </div>

          {/* Col 3: Big Data Engines */}
          <div className="ipl-footer-col">
            <h4>Big Data Stack</h4>
            <ul className="ipl-footer-links">
              <li><button onClick={() => setActiveTab('status')}>Apache Hadoop 3.4 HDFS</button></li>
              <li><button onClick={() => setActiveTab('status')}>Apache Pig 0.18 (Pig Latin)</button></li>
              <li><button onClick={() => setActiveTab('status')}>Apache Hive 3.1.3 (HQL)</button></li>
              <li><button onClick={() => setActiveTab('status')}>MySQL 8.4 RDBMS</button></li>
              <li><button onClick={() => setActiveTab('status')}>MongoDB 8.0 Document Store</button></li>
              <li><button onClick={() => setActiveTab('quality')}>Python ETL Audit Pipeline</button></li>
            </ul>
          </div>

          {/* Col 4: Dataset Integrity */}
          <div className="ipl-footer-col">
            <h4>Data Governance</h4>
            <p style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
              <strong>Dataset Scope:</strong> 1,169 fixtures • 1,146 decided match outcomes • 23 no-results/abandoned games excluded from win-rate denominators.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.74rem',
              color: '#94a3b8'
            }}>
              <strong>Notice:</strong> This is an independent academic research and analytics project. Not affiliated with, endorsed by, or sponsored by the Board of Control for Cricket in India (BCCI) or the Indian Premier League.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ipl-footer-bottom">
          <div>
            © 2026 IPL Big Data Analytics Project • Created by Hemakumar T • Built with React 18, Vite, Flask, & Distributed Hadoop
          </div>
          <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
            <span>Seasons: 2008 – 2025</span>
            <span>Parity: 100% Verified</span>
            <span>Matches: 1,169</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
