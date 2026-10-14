import React, { useState, useEffect } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { LoadingState, ErrorState } from '../components/States';
import { fetchVenuesPerformance, fetchVenues } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { MapPin, Filter, Shield, Zap, Search, AlertCircle, Info } from 'lucide-react';

export const VenueAnalysisPage = () => {
  const [season, setSeason] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [venueList, setVenueList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVenues('all').then(res => {
      setVenueList(res.venues || []);
    }).catch(console.error);
  }, []);

  const loadData = async (v, s) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchVenuesPerformance(v, s);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedVenue, season);
  }, [selectedVenue, season]);

  if (loading && !data) return <LoadingState message="Calculating stadium defend vs chase pitch dynamics..." />;
  if (error && !data) return <ErrorState message={error} onRetry={() => loadData(selectedVenue, season)} />;

  const venuesPerf = (data?.venue_performance || []).filter(v => 
    v.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const teamAtVenue = data?.team_at_venue || [];
  const activeVenueName = data?.selected_venue || 'Wankhede Stadium';

  const chartData = venuesPerf.slice(0, 10).map(v => ({
    venue: v.venue.length > 20 ? v.venue.slice(0, 18) + '...' : v.venue,
    fullName: v.venue,
    matches: Number(v.total_matches),
    defendingPct: Number(v.defending_win_pct),
    chasingPct: Number(v.chasing_win_pct),
    isReliable: v.is_reliable_sample
  }));

  return (
    <div className="page-container">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--ipl-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Ground Intelligence
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ipl-sky)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              39 Documented Stadium Venues
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Venue Intelligence & Pitch Outcomes
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Empirical breakdown of first-innings defending vs second-innings chasing win rates by stadium.
          </p>
        </div>

        {/* Venue & Season Filters */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <MapPin size={15} style={{ color: 'var(--ipl-blue)' }} />
            <span style={{ fontWeight: '700' }}>Venue:</span>
          </div>
          <select 
            value={selectedVenue} 
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="select-input"
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Major Venues</option>
            {venueList.map(v => (
              <option key={v.venue} value={v.venue}>{v.venue} ({v.match_count})</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '6px' }}>
            <Filter size={15} style={{ color: 'var(--ipl-blue)' }} />
            <span style={{ fontWeight: '700' }}>Season:</span>
          </div>
          <select 
            value={season} 
            onChange={(e) => setSeason(e.target.value)}
            className="select-input"
          >
            <option value="all">All Seasons (2008–2025)</option>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s} ({s + 2007})
              </option>
            ))}
          </select>

          <SourceBadge source="Venue Aggregates" engine="mysql" />
        </div>
      </div>

      {/* Search & Reliability Callout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="stat-callout" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Info size={16} style={{ color: 'var(--ipl-blue)', flexShrink: 0 }} />
          <span>
            Venues with <strong>≥10 matches</strong> represent statistically reliable sample sizes. 
            Stadiums with under 10 fixtures are flagged with <AlertCircle size={13} style={{ display: 'inline', color: 'var(--ipl-orange)' }} /> small sample indicators.
          </span>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search stadium..." 
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

      {/* Defend (Orange) vs Chase (Cyan) Bar Chart */}
      <div className="card" style={{ borderTop: '4px solid var(--ipl-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Stadium Defending vs Chasing Win Rates (%)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              First innings batting win % (Orange) vs second innings chasing win % (Cyan)
            </p>
          </div>
          <SourceBadge source="Pitch Defend/Chase Ratio" engine="mysql" />
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="venue" stroke="var(--text-secondary)" fontSize={11} interval={0} angle={-20} textAnchor="end" fontWeight={600} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} unit="%" />
              <Tooltip 
                formatter={(val, name, item) => [`${val}%`, name === 'defendingPct' ? 'Defending Win %' : 'Chasing Win %']}
                labelFormatter={(label, item) => item && item[0] ? item[0].payload.fullName : label}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="defendingPct" name="Defending (Bat 1st)" fill="var(--ipl-orange)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chasingPct" name="Chasing (Field 1st)" fill="var(--ipl-cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Venue Detailed Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Comprehensive Venue Analytics
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Complete match history, defend/chase splits, and sample size validity
            </p>
          </div>
          <SourceBadge source="Venue Defend/Chase Pig Output" engine="pig" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stadium Venue</th>
                <th>Total Matches</th>
                <th>Defending Wins</th>
                <th>Chasing Wins</th>
                <th>Ties</th>
                <th>Defending Win %</th>
                <th>Chasing Win %</th>
                <th>Sample Validity</th>
              </tr>
            </thead>
            <tbody>
              {venuesPerf.map((v) => (
                <tr key={v.venue}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} style={{ color: 'var(--ipl-blue)' }} />
                      <span>{v.venue}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{v.total_matches}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--ipl-orange)' }}>{v.defending_wins}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--ipl-cyan)' }}>{v.chasing_wins}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{v.tied_matches}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--ipl-orange)' }}>
                    {v.defending_win_pct}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--ipl-cyan)' }}>
                    {v.chasing_win_pct}%
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: v.is_reliable_sample ? 'rgba(47, 158, 68, 0.12)' : 'rgba(247, 103, 7, 0.12)',
                      color: v.is_reliable_sample ? 'var(--ipl-green)' : 'var(--ipl-orange)',
                      fontWeight: '800'
                    }}>
                      {v.sample_status}
                    </span>
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
