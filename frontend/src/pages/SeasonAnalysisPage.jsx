import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchSeasons, fetchTeams } from '../services/api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { TrendingUp, Filter, Calendar } from 'lucide-react';

export const SeasonAnalysisPage = () => {
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teamList, setTeamList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams().then(res => setTeamList(res.teams || [])).catch(console.error);
  }, []);

  const loadData = async (s, t) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSeasons(s, t);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSeason, selectedTeam);
  }, [selectedSeason, selectedTeam]);

  if (loading && !data) return <LoadingState message="Calculating season trends and franchise dominance..." />;
  if (error && !data) return <ErrorState message={error} onRetry={() => loadData(selectedSeason, selectedTeam)} />;

  const seasonsList = (data?.seasons || []).map(s => ({
    seasonLabel: `S${s.season} (${s.year})`,
    season: s.season,
    year: s.year,
    matches: Number(s.match_count)
  }));

  const seasonTeamWins = data?.season_team_wins || [];

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            Season Trends & Historical Trajectories
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Tournament size growth, matches contested per edition, and franchise wins per season.
          </p>
        </div>

        {/* Season & Team Filters */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Calendar size={15} style={{ color: 'var(--accent-blue)' }} />
            <span>Season:</span>
          </div>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="select-input"
          >
            <option value="all">All 17 Seasons</option>
            {Array.from({ length: 17 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '6px' }}>
            <Filter size={15} style={{ color: 'var(--accent-blue)' }} />
            <span>Team:</span>
          </div>
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="select-input"
          >
            <option value="all">All Franchises</option>
            {teamList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <SourceBadge source="MySQL 8.4 Relational Analytics" engine="mysql" />
        </div>
      </div>

      {/* Season Fixture Growth Trend Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
              IPL Tournament Scale: Matches Hosted per Season (2008–2024)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Evolution from 58 fixtures in 2008 to 74 fixtures with 10-team expansion in 2022–2024.
            </p>
          </div>
          <SourceBadge source="MySQL COUNT(*) GROUP BY season" engine="mysql" />
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonsList} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="seasonLabel" stroke="var(--text-muted)" fontSize={10} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 80]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="matches" name="Matches Played" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Wins by Season Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Season Victories Matrix</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedTeam === 'all' ? 'Team wins across tournament editions' : `Wins for ${selectedTeam} by season`}
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SEASON</th>
                <th>YEAR</th>
                <th>FRANCHISE TEAM</th>
                <th style={{ textAlign: 'right' }}>SEASON WINS</th>
              </tr>
            </thead>
            <tbody>
              {seasonTeamWins.slice(0, 30).map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                    Season {row.season}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.year}</td>
                  <td style={{ fontWeight: '600', color: '#fff' }}>{row.team}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                    {row.wins} Wins
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
