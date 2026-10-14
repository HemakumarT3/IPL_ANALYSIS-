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
    <Loader2 size={36} className="animate-spin" style={{ color: 'var(--ipl-blue)' }} />
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
      {message}
    </p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="card" style={{
    maxWidth: '550px',
    margin: '3rem auto',
    textAlign: 'center',
    borderTop: '4px solid var(--ipl-red)',
    padding: '2.5rem'
  }}>
    <AlertCircle size={40} style={{ color: 'var(--ipl-red)', margin: '0 auto 1rem auto' }} />
    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Data Retrieval Error</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px' }}>
      {message || 'Unable to retrieve analytical metrics from the backend service.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ipl-btn-primary"
        style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <RefreshCw size={15} /> Retry Query
      </button>
    )}
  </div>
);
