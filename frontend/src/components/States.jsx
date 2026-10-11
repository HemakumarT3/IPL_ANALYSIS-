import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Querying Big Data Cluster...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
    minHeight: '300px'
  }}>
    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
      {message}
    </p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="card" style={{
    maxWidth: '550px',
    margin: '3rem auto',
    textAlign: 'center',
    borderLeft: '4px solid var(--accent-rose)',
    padding: '2rem'
  }}>
    <AlertCircle size={36} style={{ color: 'var(--accent-rose)', margin: '0 auto 1rem auto' }} />
    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Data Retrieval Error</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
      {message || 'Unable to retrieve analytical metrics from the backend service.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '1.25rem',
          padding: '8px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-blue)',
          color: '#080c14',
          border: 'none',
          fontWeight: '700',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
      >
        <RefreshCw size={14} /> Retry Query
      </button>
    )}
  </div>
);
