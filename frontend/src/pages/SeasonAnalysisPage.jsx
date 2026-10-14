import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchSeasons, fetchTeams } from '../services/api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell 
} from 'recharts';
import { TrendingUp, Filter, Calendar, Info, Trophy } from 'lucide-react';
import { getFranchiseColor, getFranchiseMetadata } from '../utils/franchiseColors';

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
    matches: Number(s.match_count),
    startDate: s.start_date,
    endDate: s.end_date
  }));

  const seasonTeamWins = data?.season_team_wins || [];
  const latestSeason = data?.latest_season || 18;
  const latestYear = data?.latest_year || 2025;

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--ipl-purple)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Historical Progression
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ipl-blue)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              Seasons 1 – {latestSeason} (2008 – {latestYear})
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Season Trends & Historical Trajectories
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Tournament size growth, matches contested per edition, and franchise wins across 18 editions.
          </p>
        </div>

        {/* Season & Team Filters */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Calendar size={15} style={{ color: 'var(--ipl-blue)' }} />
            <span style={{ fontWeight: '700' }}>Season:</span>
          </div>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="select-input"
          >
            <option value="all">All 18 Seasons (2008–2025)</option>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '6px' }}>
            <Filter size={15} style={{ color: 'var(--ipl-purple)' }} />
            <span style={{ fontWeight: '700' }}>Team:</span>
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

          <SourceBadge source="18 Verified Seasons" engine="hive" />
        </div>
      </div>

      {/* Dataset Coverage Label */}
      <div className="stat-callout" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info size={18} style={{ color: 'var(--ipl-blue)', flexShrink: 0 }} />
        <div>
          <strong>Data Coverage Indicator:</strong> Dataset comprehensively covers 2008 through 2025 (Seasons 1 – 18, 1,169 verified matches). 
          This is an authoritative historical big data repository computed across Hive and Pig batch pipelines.
        </div>
      </div>

      {/* Season Matches Bar Chart (Purple-to-Blue Palette) */}
      <div className="card" style={{ borderTop: '4px solid var(--ipl-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              IPL Tournament Expansion: Matches Contested per Edition
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Fixture volume growth from 58 matches (2008) to 74 matches (2022–2025)
            </p>
          </div>
          <SourceBadge source="HDFS Match Archives" engine="hdfs" />
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonsList} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="seasonLabel" stroke="var(--text-secondary)" fontSize={11} interval={0} angle={-25} textAnchor="end" fontWeight={600} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[40, 85]} />
              <Tooltip 
                formatter={(val, name, item) => [`${val} fixtures (${item.payload.startDate} to ${item.payload.endDate})`, item.payload.seasonLabel]}
              />
              <Bar dataKey="matches" fill="var(--ipl-purple)" radius={[5, 5, 0, 0]}>
                {seasonsList.map((entry, index) => (
                  <Cell 
                    key={`bar-${index}`} 
                    fill={index % 2 === 0 ? 'var(--ipl-blue)' : 'var(--ipl-purple)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Wins by Season */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Franchise Victories in Selected Scope
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedSeason === 'all' ? 'All seasons match wins distribution' : `Season ${selectedSeason} (${Number(selectedSeason) + 2007}) franchise wins`}
            </p>
          </div>
          <SourceBadge source="Hive Aggregation" engine="hive" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Year</th>
                <th>Franchise</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {seasonTeamWins.slice(0, 15).map((row, idx) => {
                const franchiseColor = getFranchiseColor(row.team);
                const meta = getFranchiseMetadata(row.team);

                return (
                  <tr key={`${row.season}-${row.team}-${idx}`}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      Season {row.season}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {row.year}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{ 
                            backgroundColor: franchiseColor, 
                            color: meta.textColor || '#ffffff',
                            width: '24px',
                            height: '18px',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: '800'
                          }}
                        >
                          {meta.shortName}
                        </span>
                        <span>{row.team}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--ipl-blue)' }}>
                      {row.wins}
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
