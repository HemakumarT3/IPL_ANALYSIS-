import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchTeamPerformance, fetchTeams, fetchHeadToHead } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { Trophy, Filter, ArrowRightLeft, Award, Search, Info, Shield, CheckCircle2 } from 'lucide-react';
import { getFranchiseColor, getFranchiseMetadata } from '../utils/franchiseColors';

export const TeamAnalysisPage = () => {
  const [season, setSeason] = useState('all');
  const [teamList, setTeamList] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [franchiseFilter, setFranchiseFilter] = useState('active'); // 'active', 'all', 'historical'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comparison Selector States
  const [compareTeam1, setCompareTeam1] = useState('Mumbai Indians');
  const [compareTeam2, setCompareTeam2] = useState('Chennai Super Kings');
  const [h2hData, setH2hData] = useState(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  useEffect(() => {
    fetchTeams().then(res => {
      setTeamList(res.teams || []);
    }).catch(console.error);
  }, []);

  const loadData = async (selSeason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTeamPerformance(selSeason, 'all');
      setPerformanceData(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(season);
  }, [season]);

  // Load Head-to-Head comparison whenever teams change
  useEffect(() => {
    if (compareTeam1 && compareTeam2 && compareTeam1 !== compareTeam2) {
      setH2hLoading(true);
      fetchHeadToHead(compareTeam1, compareTeam2)
        .then(res => setH2hData(res))
        .catch(err => console.error("H2H error:", err))
        .finally(() => setH2hLoading(false));
    }
  }, [compareTeam1, compareTeam2]);

  if (loading && performanceData.length === 0) return <LoadingState message="Calculating franchise performance statistics..." />;
  if (error && performanceData.length === 0) return <ErrorState message={error} onRetry={() => loadData(season)} />;

  // Filtered teams based on franchiseFilter and searchQuery
  const filteredTeams = performanceData.filter(t => {
    const matchesSearch = t.team.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (franchiseFilter === 'active') return t.is_active;
    if (franchiseFilter === 'historical') return !t.is_active;
    return true;
  });

  const chartData = filteredTeams.slice(0, 10).map(t => ({
    team: t.team,
    code: t.code,
    matches: Number(t.matches_played),
    wins: Number(t.wins),
    winPct: Number(t.win_percentage),
    primaryColor: getFranchiseColor(t.team)
  }));

  const t1Color = getFranchiseColor(compareTeam1);
  const t2Color = getFranchiseColor(compareTeam2);

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--ipl-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Franchise Standings & Records
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ipl-blue)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              10 Active Franchises & 5 Historical Teams
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Franchise Performance & Win Ratios
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Standardized franchise records with canonical rebranding resolution and explicit win-rate denominators.
          </p>
        </div>

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
            <option value="all">All Seasons (Cumulative 2008–2025)</option>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>
          <SourceBadge source="Canonical Registry" engine="mysql" />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`pill-btn ${franchiseFilter === 'active' ? 'active' : ''}`}
            onClick={() => setFranchiseFilter('active')}
          >
            Current Active Franchises (10)
          </button>
          <button 
            className={`pill-btn ${franchiseFilter === 'all' ? 'active' : ''}`}
            onClick={() => setFranchiseFilter('all')}
          >
            All Teams (15)
          </button>
          <button 
            className={`pill-btn ${franchiseFilter === 'historical' ? 'active' : ''}`}
            onClick={() => setFranchiseFilter('historical')}
          >
            Historical Teams (5)
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search franchise..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-white)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Head-to-Head Rivalry Comparison Card */}
      <div className="card" style={{ borderTop: '4px solid var(--ipl-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--ipl-orange)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                FRANCHISE RIVALRY MATRIX
              </span>
              <SourceBadge source="Verified H2H Engine" engine="mysql" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              Head-to-Head Comparative Encounter
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={compareTeam1} 
              onChange={(e) => setCompareTeam1(e.target.value)}
              className="select-input"
              style={{ fontWeight: '700', borderLeft: `3px solid ${t1Color}` }}
            >
              {teamList.map(t => (
                <option key={`t1-${t}`} value={t} disabled={t === compareTeam2}>{t}</option>
              ))}
            </select>

            <span style={{ fontWeight: '800', color: 'var(--ipl-orange)', fontSize: '0.88rem' }}>VS</span>

            <select 
              value={compareTeam2} 
              onChange={(e) => setCompareTeam2(e.target.value)}
              className="select-input"
              style={{ fontWeight: '700', borderLeft: `3px solid ${t2Color}` }}
            >
              {teamList.map(t => (
                <option key={`t2-${t}`} value={t} disabled={t === compareTeam1}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {h2hLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Comparing head-to-head encounters...
          </div>
        ) : h2hData ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Team 1 Card */}
              <div style={{ 
                background: 'var(--surface-light)', 
                padding: '1.25rem', 
                borderRadius: '10px', 
                borderLeft: `4px solid ${t1Color}`,
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '800' }}>FRANCHISE A</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {h2hData.team1.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>H2H WINS</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: t1Color }}>
                      {h2hData.team1.wins}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>H2H WIN %</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--ipl-green)' }}>
                      {h2hData.team1.win_pct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Team 2 Card */}
              <div style={{ 
                background: 'var(--surface-light)', 
                padding: '1.25rem', 
                borderRadius: '10px', 
                borderLeft: `4px solid ${t2Color}`,
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '800' }}>FRANCHISE B</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {h2hData.team2.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>H2H WINS</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: t2Color }}>
                      {h2hData.team2.wins}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>H2H WIN %</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--ipl-green)' }}>
                      {h2hData.team2.win_pct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
              <span>Total Encounters: <strong style={{ color: 'var(--text-primary)' }}>{h2hData.total_matches}</strong></span>
              <span>•</span>
              <span>Decided Matches: <strong style={{ color: 'var(--text-primary)' }}>{h2hData.valid_matches}</strong></span>
              {h2hData.no_results > 0 && (
                <>
                  <span>•</span>
                  <span>No Results Excluded: <strong style={{ color: 'var(--text-primary)' }}>{h2hData.no_results}</strong></span>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bar Chart: Team Wins Comparison with Authentic Franchise Colors */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Franchise Victories Comparison
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Top teams ranked by total match wins with authentic franchise colors
            </p>
          </div>
          <SourceBadge source="Verified Pipeline Registry" engine="mysql" />
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="code" stroke="var(--text-secondary)" fontSize={11} fontWeight={700} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} />
              <Tooltip 
                formatter={(val, name, item) => [`${val} wins (${item.payload.winPct}% win rate)`, item.payload.team]}
              />
              <Bar dataKey="wins" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.primaryColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Team Performance Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Detailed Franchise Statistics & Standings
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Full breakdown including matches, wins, losses, no-results, win rates, and toss records
            </p>
          </div>
          <SourceBadge source="18 Season Aggregate" engine="mysql" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Franchise</th>
                <th>Status</th>
                <th>Played</th>
                <th>Won</th>
                <th>Lost</th>
                <th>NR</th>
                <th>Win % (Valid)</th>
                <th>Loss %</th>
                <th>Win % (All)</th>
                <th>Toss Wins</th>
                <th>Toss Conv. %</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((t, idx) => {
                const franchiseColor = getFranchiseColor(t.team);
                const meta = getFranchiseMetadata(t.team);
                const isTopPerformer = idx < 3;

                return (
                  <tr key={t.team}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          style={{ 
                            backgroundColor: franchiseColor, 
                            color: meta.textColor || '#ffffff',
                            width: '32px',
                            height: '24px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {t.code}
                        </span>
                        <span>{t.team}</span>
                        {isTopPerformer && (
                          <span style={{ color: 'var(--ipl-gold)', fontSize: '0.75rem', fontWeight: '800' }}>★</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        backgroundColor: t.is_active ? 'rgba(47, 158, 68, 0.12)' : 'rgba(104, 117, 139, 0.12)',
                        color: t.is_active ? 'var(--ipl-green)' : 'var(--text-secondary)',
                        fontWeight: '800'
                      }}>
                        {t.is_active ? 'Active' : 'Historical'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{t.matches_played}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--ipl-blue)' }}>{t.wins}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{t.losses}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{t.no_results}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '900', color: 'var(--ipl-green)' }}>
                      {t.win_percentage}%
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--ipl-red)' }}>{t.loss_percentage}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{t.win_percentage_all_matches}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{t.toss_wins}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#b58500' }}>
                      {t.toss_to_win_conversion_pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
