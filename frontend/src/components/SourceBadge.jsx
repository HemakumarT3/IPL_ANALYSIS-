import React from 'react';
import { Database, Cpu, HardDrive, Layers, Server } from 'lucide-react';

export const SourceBadge = ({ source, engine = 'hive', note }) => {
  const getBadgeStyle = () => {
    const eng = engine.toLowerCase();
    if (eng.includes('hive')) {
      return {
        bg: 'rgba(252, 209, 22, 0.12)',
        border: 'rgba(252, 209, 22, 0.35)',
        text: '#fde047',
        icon: <Cpu size={13} className="text-yellow-400" />,
        label: 'Apache Hive MapReduce'
      };
    }
    if (eng.includes('pig')) {
      return {
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.35)',
        text: '#fb7185',
        icon: <Layers size={13} className="text-rose-400" />,
        label: 'Apache Pig Latin'
      };
    }
    if (eng.includes('mysql') || eng.includes('sql')) {
      return {
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.35)',
        text: '#38bdf8',
        icon: <Database size={13} className="text-sky-400" />,
        label: 'MySQL 8.4 RDBMS'
      };
    }
    if (eng.includes('mongo') || eng.includes('nosql')) {
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        text: '#34d399',
        icon: <Server size={13} className="text-emerald-400" />,
        label: 'MongoDB 8.0 Aggregation'
      };
    }
    if (eng.includes('hdfs')) {
      return {
        bg: 'rgba(99, 102, 241, 0.12)',
        border: 'rgba(99, 102, 241, 0.35)',
        text: '#818cf8',
        icon: <HardDrive size={13} className="text-indigo-400" />,
        label: 'Hadoop HDFS Storage'
      };
    }
    return {
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.3)',
      text: '#cbd5e1',
      icon: <Layers size={13} />,
      label: source || 'Big Data Pipeline'
    };
  };

  const badge = getBadgeStyle();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: badge.bg,
      border: `1px solid ${badge.border}`,
      color: badge.text,
      fontSize: '0.73rem',
      fontWeight: '600',
      letterSpacing: '0.02em',
      fontFamily: 'var(--font-mono)'
    }}>
      {badge.icon}
      <span>{source || badge.label}</span>
      {note && <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>• {note}</span>}
    </div>
  );
};
