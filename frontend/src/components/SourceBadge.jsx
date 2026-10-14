import React from 'react';
import { Database, Cpu, HardDrive, Layers, Server } from 'lucide-react';

export const SourceBadge = ({ source, engine = 'hive', note }) => {
  const getBadgeStyle = () => {
    const eng = engine.toLowerCase();
    if (eng.includes('hive')) {
      return {
        bg: 'rgba(252, 196, 25, 0.12)',
        border: 'rgba(252, 196, 25, 0.4)',
        text: '#996500',
        icon: <Cpu size={13} style={{ color: '#996500' }} />,
        label: 'Apache Hive MapReduce'
      };
    }
    if (eng.includes('pig')) {
      return {
        bg: 'rgba(214, 51, 132, 0.1)',
        border: 'rgba(214, 51, 132, 0.35)',
        text: 'var(--ipl-magenta)',
        icon: <Layers size={13} style={{ color: 'var(--ipl-magenta)' }} />,
        label: 'Apache Pig Latin'
      };
    }
    if (eng.includes('mysql') || eng.includes('sql')) {
      return {
        bg: 'rgba(25, 58, 131, 0.08)',
        border: 'rgba(25, 58, 131, 0.3)',
        text: 'var(--ipl-blue)',
        icon: <Database size={13} style={{ color: 'var(--ipl-blue)' }} />,
        label: 'MySQL 8.4 RDBMS'
      };
    }
    if (eng.includes('mongo') || eng.includes('nosql')) {
      return {
        bg: 'rgba(47, 158, 68, 0.1)',
        border: 'rgba(47, 158, 68, 0.35)',
        text: 'var(--ipl-green)',
        icon: <Server size={13} style={{ color: 'var(--ipl-green)' }} />,
        label: 'MongoDB 8.0 Aggregation'
      };
    }
    if (eng.includes('hdfs')) {
      return {
        bg: 'rgba(112, 72, 232, 0.1)',
        border: 'rgba(112, 72, 232, 0.35)',
        text: 'var(--ipl-purple)',
        icon: <HardDrive size={13} style={{ color: 'var(--ipl-purple)' }} />,
        label: 'Hadoop HDFS Storage'
      };
    }
    return {
      bg: 'rgba(104, 117, 139, 0.1)',
      border: 'rgba(104, 117, 139, 0.3)',
      text: 'var(--text-secondary)',
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
      fontWeight: '700',
      letterSpacing: '0.02em',
      fontFamily: 'var(--font-mono)'
    }}>
      {badge.icon}
      <span>{source || badge.label}</span>
      {note && <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>• {note}</span>}
    </div>
  );
};
