import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchTeamPerformance, fetchTeams } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell 
} from 'recharts';
import { Trophy, Filter, ArrowRightLeft, Award } from 'lucide-react';

export const TeamAnalysisPage = () => {
  const [season, setSeason] = useState('all');
  const [teamList, setTeamList] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comparison Selector States
  const [compareTeam1, setCompareTeam1] = useState('Mumbai Indians');
  const [compareTeam2, setCompareTeam2] = useState('Chennai Super Kings');

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

  if (loading && performanceData.length === 0) return <LoadingState message="Calculating franchise performance statistics..." />;
  if (error && performanceData.length === 0) return <ErrorState message={error} onRetry={() => loadData(season)} />;

  // Find teams for comparison
  const team1Stats = performanceData.find(t => t.team === compareTeam1) || { team: compareTeam1, matches_played: 0, wins: 0, win_percentage: 0 };
  const team2Stats = performanceData.find(t => t.team === compareTeam2) || { team: compareTeam2, matches_played: 0, wins: 0, win_percentage: 0 };

  const chartData = performanceData.slice(0, 10).map(t => ({
    team: t.team,
    shortName: t.team.split(' ').map(w => w[0]).join(''),
    matches: Number(t.matches_played),
    wins: Number(t.wins),
    winPct: Number(t.win_percentage)
  }));

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            Franchise Performance & Win Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Official match win records, matches played, and win ratios with live filters.
          </p>
        </div>

        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={15} style={{ color: 'var(--accent-blue)' }} />
            <span>Season:</span>
          </div>
          <select 
            value={season} 
            onChange={(e) => setSeason(e.target.value)} 
            className="select-input"
          >
            <option value="all">All Seasons (Cumulative)</option>
            {Array.from({ length: 17 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>
          <SourceBadge source="MySQL 8.4 RDBMS Query Engine" engine="mysql" />
        </div>
      </div>

      {/* Team Comparison Feature */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={20} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Head-to-Head Franchise Comparison</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select any two franchises to compare record statistics</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={compareTeam1} 
              onChange={(e) => setCompareTeam1(e.target.value)}
              className="select-input"
            >
              {teamList.map(t => <option key={`c1-${t}`} value={t}>{t}</option>)}
            </select>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>VS</span>
            <select 
              value={compareTeam2} 
              onChange={(e) => setCompareTeam2(e.target.value)}
              className="select-input"
            >
              {teamList.map(t => <option key={`c2-${t}`} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Team 1 Card */}
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '700' }}>TEAM 1</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{team1Stats.team}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MATCHES</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{team1Stats.matches_played}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WINS</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-blue)' }}>{team1Stats.wins}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WIN %</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                  {team1Stats.win_percentage ? `${team1Stats.win_percentage}%` : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Team 2 Card */}
          <div style={{ background: 'rgba(253, 224, 71, 0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(253, 224, 71, 0.2)' }}>
            <div style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: '700' }}>TEAM 2</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{team2Stats.team}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MATCHES</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{team2Stats.matches_played}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WINS</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fde047' }}>{team2Stats.wins}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WIN %</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                  {team2Stats.win_percentage ? `${team2Stats.win_percentage}%` : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar Chart: Wins & Matches */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
              Franchise Standings: Matches Contested vs Victories
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Top 10 franchises visualized. Sorted by total wins.
            </p>
          </div>
          <SourceBadge source="MySQL Matches & Wins Query" engine="mysql" />
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="team" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="matches" name="Matches Played" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wins" name="Wins" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Data Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Complete Franchise Records Table</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Detailed breakdown of matches, wins, losses, and win percentages
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {performanceData.length} Franchises Listed
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>FRANCHISE</th>
                <th style={{ textAlign: 'right' }}>MATCHES PLAYED</th>
                <th style={{ textAlign: 'right' }}>WINS</th>
                <th style={{ textAlign: 'right' }}>LOSSES</th>
                <th style={{ textAlign: 'right' }}>NO RESULTS</th>
                <th style={{ textAlign: 'right' }}>WIN PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row, idx) => (
                <tr key={`team-row-${idx}`}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: idx < 3 ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: '600', color: '#fff' }}>
                    {row.team}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {row.matches_played}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: '700' }}>
                    {row.wins}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {row.losses}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {row.no_results}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: Number(row.win_percentage) >= 50 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '700' }}>
                    {Number(row.win_percentage).toFixed(2)}%
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
