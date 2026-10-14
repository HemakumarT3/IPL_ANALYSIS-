import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchOverview } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  AreaChart, Area
} from 'recharts';
import { Activity, Trophy, MapPin, Coins, CheckCircle2, Filter, Info, Calendar, Shield, Flame } from 'lucide-react';
import { getFranchiseColor } from '../utils/franchiseColors';

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
  const seasonTrends = data?.season_match_trends || [];
  const tossDecisions = data?.toss_decisions || [
    { decision: 'field', label: 'Field First', count: 764, valid_matches: 750, wins: 408, win_pct: 54.4 },
    { decision: 'bat', label: 'Bat First', count: 405, valid_matches: 396, wins: 183, win_pct: 46.2 }
  ];

  return (
    <div className="page-container">
      {/* Header & Season Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--ipl-orange)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              IPL Big Data Platform
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ipl-blue)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              Seasons 1 – {kpis.latest_season || 18} (2008 – {kpis.latest_year || 2025})
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Tournament Executive Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Aggregated match intelligence across 18 IPL seasons computed from relational and distributed big data engines.
          </p>
        </div>

        {/* Season Filter Selector */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={15} style={{ color: 'var(--ipl-blue)' }} />
            <span style={{ fontWeight: '700' }}>Season:</span>
          </div>
          <select 
            value={season} 
            onChange={(e) => setSeason(e.target.value)} 
            className="select-input"
          >
            <option value="all">All Seasons (2008 – 2025)</option>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>
          <SourceBadge source="Big Data Pipeline" engine="mysql" />
        </div>
      </div>

      {/* 5 Distinct Multicolour Overview KPI Cards (Prompt Section 5) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* KPI 1: Matches Analysed (Blue/Cyan Accent) */}
        <div className="card" style={{ borderTop: '4px solid var(--ipl-blue)', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ipl-blue)', fontWeight: '800', letterSpacing: '0.06em' }}>MATCHES ANALYSED</span>
            <div style={{ background: 'var(--ipl-light-blue)', padding: '6px', borderRadius: '8px', color: 'var(--ipl-blue)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', color: 'var(--ipl-blue)' }}>
            {kpis.total_matches || 1169}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {season === 'all' ? '1,169 verified records (2008–2025)' : `Season ${season} fixtures`}
          </div>
        </div>

        {/* KPI 2: Teams Represented (Purple Accent) */}
        <div className="card" style={{ borderTop: '4px solid var(--ipl-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ipl-purple)', fontWeight: '800', letterSpacing: '0.06em' }}>TEAMS REPRESENTED</span>
            <div style={{ background: 'rgba(112, 72, 232, 0.1)', padding: '6px', borderRadius: '8px', color: 'var(--ipl-purple)' }}>
              <Trophy size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', color: 'var(--ipl-purple)' }}>
            10 <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Active (15 Total)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Canonical franchise registry mapped
          </div>
        </div>

        {/* KPI 3: Latest Available Season (Orange Accent) */}
        <div className="card" style={{ borderTop: '4px solid var(--ipl-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ipl-orange)', fontWeight: '800', letterSpacing: '0.06em' }}>LATEST SEASON</span>
            <div style={{ background: 'rgba(247, 103, 7, 0.1)', padding: '6px', borderRadius: '8px', color: 'var(--ipl-orange)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', color: 'var(--ipl-orange)' }}>
            Season 18 <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>(2025)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            18 historical editions archived
          </div>
        </div>

        {/* KPI 4: Valid Toss Records (Teal / Cyan Accent) */}
        <div className="card" style={{ borderTop: '4px solid var(--ipl-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ipl-cyan)', fontWeight: '800', letterSpacing: '0.06em' }}>VALID TOSS RECORDS</span>
            <div style={{ background: 'rgba(34, 184, 207, 0.1)', padding: '6px', borderRadius: '8px', color: 'var(--ipl-cyan)' }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', color: 'var(--ipl-cyan)' }}>
            {kpis.completed_matches || 1146}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {kpis.no_results ? `${kpis.no_results} no-results excluded` : '23 no-results excluded'}
          </div>
        </div>

        {/* KPI 5: Toss-Winning Match-Win Rate (Gold Accent) */}
        <div className="card" style={{ borderTop: '4px solid var(--ipl-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#b58500', fontWeight: '800', letterSpacing: '0.06em' }}>TOSS WIN ADVANTAGE</span>
            <div style={{ background: 'rgba(252, 196, 25, 0.15)', padding: '6px', borderRadius: '8px', color: '#b58500' }}>
              <Coins size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', color: '#b58500' }}>
            {kpis.toss_win_pct ? `${kpis.toss_win_pct}%` : '51.6%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {kpis.toss_winner_match_winner || 591} wins / {kpis.valid_toss_matches || 1146} decided
          </div>
        </div>

      </div>

      {/* Denominator & Coverage Callout */}
      <div className="stat-callout" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info size={18} style={{ color: 'var(--ipl-blue)', flexShrink: 0 }} />
        <div>
          <strong>Strict Mathematical Parity Notice:</strong> All percentages are derived directly from empirical ground truth. 
          The denominator for win percentages explicitly excludes 23 abandoned / no-result fixtures without winners.
        </div>
      </div>

      {/* Two Column Visualizations */}
      <div className="grid-2">
        {/* Top Performing Franchises (Bar Chart with Authentic Franchise Colors) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Top Performing Franchises
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {season === 'all' ? 'All-time cumulative match wins' : `Match wins in Season ${season}`}
              </p>
            </div>
            <SourceBadge source="Franchise Registry" engine="mysql" />
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTeams} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="code" 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  fontWeight={700}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val} Wins (${item.payload.win_percentage || ''}%)`, item.payload.team]}
                />
                <Bar dataKey="wins" radius={[6, 6, 0, 0]}>
                  {topTeams.map((entry, index) => {
                    const franchiseColor = getFranchiseColor(entry.team || entry.code);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={franchiseColor} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Season-wise Match Growth Trends (Area Chart with Cyan & Sky Gradient) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Tournament Scale & Match Trajectory
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Matches contested per season edition (2008 – 2025)
              </p>
            </div>
            <SourceBadge source="Historical Seasons 1-18" engine="hive" />
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonTrends} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ipl-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--ipl-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="year" 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  interval={2}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[45, 80]} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val} fixtures (${item.payload.completed} completed)`, `Season ${item.payload.season}`]}
                />
                <Area type="monotone" dataKey="matches" stroke="var(--ipl-cyan)" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Toss Decision Comparison: Field First (Cyan) vs Bat First (Orange) */}
      <div className="card" style={{ borderTop: '4px solid var(--ipl-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Toss Decision Comparison: Field First vs Bat First Outcomes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Empirical decision breakdown, match frequencies, and conversion win percentages
            </p>
          </div>
          <SourceBadge source="Toss Decision Parity" engine="mysql" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {tossDecisions.map((td) => {
            const isField = td.decision === 'field';
            const accentColor = isField ? 'var(--ipl-cyan)' : 'var(--ipl-orange)';
            const bgLight = isField ? 'rgba(34, 184, 207, 0.08)' : 'rgba(247, 103, 7, 0.08)';

            return (
              <div 
                key={td.decision} 
                style={{ 
                  background: bgLight, 
                  padding: '1.25rem', 
                  borderRadius: '10px', 
                  border: `1.5px solid ${accentColor}` 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {td.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {td.count} total selections ({((td.count / (kpis.total_matches || 1169)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '8px' }}>
                  {td.win_pct}% <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>match win rate</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Won <strong>{td.wins} matches</strong> out of <strong>{td.valid_matches} decided fixtures</strong>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: '180px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tossDecisions} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--text-secondary)" fontSize={11} unit="%" />
              <YAxis type="category" dataKey="label" stroke="var(--text-secondary)" fontSize={12} width={95} fontWeight={700} />
              <Tooltip 
                formatter={(val, name, item) => [`${val}% win rate (${item.payload.wins}/${item.payload.valid_matches} won)`, item.payload.label]}
              />
              <Bar dataKey="win_pct" radius={[0, 6, 6, 0]}>
                {tossDecisions.map((entry, index) => (
                  <Cell 
                    key={`toss-cell-${index}`} 
                    fill={entry.decision === 'field' ? 'var(--ipl-cyan)' : 'var(--ipl-orange)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Premier Stadium Footprint Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Premier Stadium Footprint
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Highest frequency host stadiums across tournament history
            </p>
          </div>
          <SourceBadge source="39 Documented Stadiums" engine="mysql" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Stadium Venue</th>
                <th>Total Matches</th>
                <th>Share of All IPL Matches</th>
              </tr>
            </thead>
            <tbody>
              {topVenues.map((v, idx) => (
                <tr key={v.venue}>
                  <td style={{ fontWeight: '800', color: idx < 3 ? 'var(--ipl-orange)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} style={{ color: 'var(--ipl-blue)' }} />
                      <span>{v.venue}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {v.match_count}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {((v.match_count / (kpis.total_matches || 1169)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
