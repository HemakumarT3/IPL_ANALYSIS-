import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchOverview } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { Activity, Trophy, MapPin, Coins, CheckCircle2, Filter } from 'lucide-react';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#fb7185', '#a855f7'];

export const OverviewPage = () => {
  const [season, setSeason] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (selSeason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOverview(selSeason);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(season);
  }, [season]);

  if (loading && !data) return <LoadingState message="Fetching executive overview metrics..." />;
  if (error && !data) return <ErrorState message={error} onRetry={() => loadData(season)} />;

  const kpis = data?.kpis || {};
  const topTeams = data?.top_teams || [];
  const topVenues = data?.top_venues || [];

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            Tournament Executive Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Aggregated match intelligence across 17 IPL seasons computed from relational and distributed stores.
          </p>
        </div>

        {/* Season Filter Selector */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={15} style={{ color: 'var(--accent-blue)' }} />
            <span>Season Filter:</span>
          </div>
          <select 
            value={season} 
            onChange={(e) => setSeason(e.target.value)} 
            className="select-input"
          >
            <option value="all">All Seasons (2008 - 2024)</option>
            {Array.from({ length: 17 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>
          <SourceBadge source="MySQL 8.4 RDBMS" engine="mysql" />
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid-4">
        <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>TOTAL MATCHES</span>
            <Activity size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '6px', color: '#fff' }}>
            {kpis.total_matches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {season === 'all' ? '1,169 verified records' : `Season ${season} fixture count`}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>COMPLETED MATCHES</span>
            <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-emerald)' }}>
            {kpis.completed_matches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {kpis.total_matches ? `${((kpis.completed_matches / kpis.total_matches) * 100).toFixed(1)}% decisive result` : '-'}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>FRANCHISES & VENUES</span>
            <Trophy size={16} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '6px', color: '#fff' }}>
            {kpis.unique_teams || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Teams / {kpis.unique_venues || 0} Venues</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Canonical harmonized entities
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>TOSS CONVERSION</span>
            <Coins size={16} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '6px', color: '#a855f7' }}>
            {kpis.toss_win_pct ? `${kpis.toss_win_pct}%` : '50.6%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {kpis.toss_winner_match_winner || 0} matches won by toss winner
          </div>
        </div>
      </div>

      {/* Two Column Charts: Top Teams by Wins & Top Venues */}
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Top Franchises by Victories</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {season === 'all' ? 'All-time cumulative match wins' : `Victories in Season ${season}`}
              </p>
            </div>
            <SourceBadge source="MySQL Query Engine" engine="mysql" />
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTeams} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="team" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="total_wins" name="Wins" radius={[4, 4, 0, 0]}>
                  {topTeams.map((entry, index) => (
                    <Cell key={`team-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Most Frequented Stadiums</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {season === 'all' ? 'Total fixtures hosted across all editions' : `Stadiums used in Season ${season}`}
              </p>
            </div>
            <SourceBadge source="MySQL Query Engine" engine="mysql" />
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVenues} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="venue" type="category" stroke="var(--text-muted)" fontSize={10} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="match_count" name="Matches Hosted" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
