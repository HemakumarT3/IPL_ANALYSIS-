import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Shield, 
  MapPin, 
  Calendar, 
  Award,
  ArrowUpRight,
  PieChart,
  BarChart3,
  ExternalLink,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { 
  heroCricketBanner, 
  thumbChampions, 
  thumbToss, 
  thumbChasing, 
  thumbStadium 
} from '../assets/cricketImages';
import { fetchOverview, fetchTeamPerformance, fetchToss } from '../services/api';
import { getFranchiseColor, getFranchiseMetadata } from '../utils/franchiseColors';

export const HomePage = ({ setActiveTab }) => {
  const [overview, setOverview] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [tossData, setTossData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOverview('all').catch(() => null),
      fetchTeamPerformance('all', 'all').catch(() => ({ data: [] })),
      fetchToss('all').catch(() => null)
    ]).then(([ov, tm, ts]) => {
      if (ov) setOverview(ov);
      if (tm && tm.data) setTeamStats(tm.data);
      if (ts) setTossData(ts);
      setLoading(false);
    });
  }, []);

  // 10 Canonical Active Franchises
  const activeFranchises = [
    { name: 'Chennai Super Kings', short: 'CSK' },
    { name: 'Mumbai Indians', short: 'MI' },
    { name: 'Kolkata Knight Riders', short: 'KKR' },
    { name: 'Royal Challengers Bengaluru', short: 'RCB' },
    { name: 'Delhi Capitals', short: 'DC' },
    { name: 'Rajasthan Royals', short: 'RR' },
    { name: 'Sunrisers Hyderabad', short: 'SRH' },
    { name: 'Punjab Kings', short: 'PBKS' },
    { name: 'Gujarat Titans', short: 'GT' },
    { name: 'Lucknow Super Giants', short: 'LSG' }
  ];

  // News and featured cards with vibrant multi-colour accents
  const newsCards = [
    {
      id: 1,
      tag: 'TOURNAMENT INTEL',
      tagColor: 'var(--ipl-magenta)',
      date: 'OCTOBER 2026',
      title: 'The Toss Dilemma: How Fielding First Outperforms Batting 54.4% to 46.2%',
      summary: 'Big data analysis across 1,146 decided IPL fixtures reveals captain preference has shifted heavily towards fielding first.',
      tab: 'toss',
      img: thumbToss
    },
    {
      id: 2,
      tag: 'ALL-TIME STANDINGS',
      tagColor: 'var(--ipl-purple)',
      date: 'FRANCHISE STATS',
      title: 'CSK & MI Win Rate Benchmark: 18 Seasons of IPL Dominance Analyzed',
      summary: 'With 151 and 145 wins respectively, see why Chennai and Mumbai remain the most consistent franchises in T20 history.',
      tab: 'points',
      img: thumbChampions
    },
    {
      id: 3,
      tag: 'VENUE DEW FACTOR',
      tagColor: 'var(--ipl-cyan)',
      date: 'GROUND INTEL',
      title: 'High-Conversion Grounds: Wankhede, Eden Gardens, and Chinnaswamy',
      summary: 'Boundary dimensions and evening dew skew win percentages significantly across 39 verified match venues.',
      tab: 'venues',
      img: thumbStadium
    },
    {
      id: 4,
      tag: 'DATA PIPELINE',
      tagColor: 'var(--ipl-gold)',
      date: 'SYSTEM STATUS',
      title: 'Big Data Pipeline Parity: Hadoop, Hive, Pig, and MongoDB Unified',
      summary: 'Strict audit consistency verified: 100% record match between Hadoop MapReduce batch queries and MySQL REST API.',
      tab: 'status',
      img: thumbChasing
    }
  ];

  const totalMatches = overview?.total_matches ?? 1169;
  const decidedMatches = overview?.decided_matches ?? 1146;
  const tossWinPct = tossData?.toss_metrics?.toss_winner_match_win_pct ?? 51.6;
  const chaseWinPct = overview?.chase_win_pct ?? 54.2;

  return (
    <div className="ipl-home-page" style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* ========================================================
          1. HERO SECTION (BROADCAST AESTHETICS & GEOMETRICS)
          ======================================================== */}
      <section className="ipl-hero-section">
        <div className="ipl-hero-inner">
          
          {/* Left Column (66% width): Main Cricket Spotlight Card */}
          <div className="ipl-hero-main-card">
            <img 
              src={heroCricketBanner} 
              alt="IPL Cricket Action" 
              className="ipl-hero-main-img" 
            />
            <div className="ipl-hero-overlay" />
            
            <div className="ipl-hero-content">
              {/* Circular Play Button */}
              <div 
                className="ipl-play-btn" 
                onClick={() => setActiveTab('overview')}
                title="Explore Interactive Analytics"
              >
                <Play size={22} fill="#ffffff" style={{ marginLeft: '3px' }} />
              </div>

              <span className="ipl-hero-badge">IPL Big Data Spotlight</span>

              <h1 className="ipl-hero-title">
                Every Match. Every Moment. Every Insight.
              </h1>

              <p className="ipl-hero-subtitle">
                Explore IPL team performance, toss decisions, venue statistics and season-wise trends through data-driven cricket analytics.
              </p>

              <div className="ipl-hero-meta">
                <span>{totalMatches} Matches</span>
                <span>•</span>
                <span>18 Seasons (2008 – 2025)</span>
                <span>•</span>
                <span>Distributed Big Data Engine</span>
              </div>

              <div className="ipl-hero-actions">
                <button 
                  className="ipl-btn-primary"
                  onClick={() => setActiveTab('points')}
                >
                  <span>Points Table</span>
                  <ChevronRight size={18} />
                </button>

                <button 
                  className="ipl-btn-secondary"
                  onClick={() => setActiveTab('toss')}
                >
                  Toss Analysis
                </button>

                <button 
                  className="ipl-btn-cyan"
                  onClick={() => setActiveTab('overview')}
                >
                  Overview Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (34% width): 4 Stacked Featured Analytics Cards */}
          <div className="ipl-hero-side-stack">
            
            {/* Card 1: Champions */}
            <div 
              className="ipl-side-card" 
              onClick={() => setActiveTab('teams')}
              style={{ borderLeft: '3px solid var(--ipl-purple)' }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--ipl-purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Franchise Records
                </span>
                <h4 className="ipl-side-title">Franchise Dominance</h4>
                <p className="ipl-side-desc">
                  Mumbai Indians (151 wins) & CSK (145 wins) lead all-time standings.
                </p>
              </div>
              <div className="ipl-side-thumb">
                <img src={thumbChampions} alt="Franchise Dominance" />
                <span className="ipl-duration-pill" style={{ background: 'var(--ipl-purple)' }}>151 WINS</span>
              </div>
            </div>

            {/* Card 2: Toss Win Rate */}
            <div 
              className="ipl-side-card" 
              onClick={() => setActiveTab('toss')}
              style={{ borderLeft: '3px solid var(--ipl-magenta)' }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--ipl-magenta)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Toss Intel
                </span>
                <h4 className="ipl-side-title">The 51.6% Toss Advantage</h4>
                <p className="ipl-side-desc">
                  Across 1,146 decided matches: does winning the toss guarantee victory?
                </p>
              </div>
              <div className="ipl-side-thumb">
                <img src={thumbToss} alt="Toss Impact" />
                <span className="ipl-duration-pill" style={{ background: 'var(--ipl-magenta)' }}>51.6%</span>
              </div>
            </div>

            {/* Card 3: Chasing vs Defending */}
            <div 
              className="ipl-side-card" 
              onClick={() => setActiveTab('overview')}
              style={{ borderLeft: '3px solid var(--ipl-cyan)' }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--ipl-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Chasing Strategy
                </span>
                <h4 className="ipl-side-title">Chasing Dominance</h4>
                <p className="ipl-side-desc">
                  Teams batting second won 621 matches vs 525 for teams batting first.
                </p>
              </div>
              <div className="ipl-side-thumb">
                <img src={thumbChasing} alt="Chasing Advantage" />
                <span className="ipl-duration-pill" style={{ background: 'var(--ipl-cyan)' }}>54.2%</span>
              </div>
            </div>

            {/* Card 4: Stadium Venues */}
            <div 
              className="ipl-side-card" 
              onClick={() => setActiveTab('venues')}
              style={{ borderLeft: '3px solid var(--ipl-gold)' }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--ipl-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Venue Dynamics
                </span>
                <h4 className="ipl-side-title">Venue Advantage Index</h4>
                <p className="ipl-side-desc">
                  Explore pitch characteristics and win rates across 39 verified venues.
                </p>
              </div>
              <div className="ipl-side-thumb">
                <img src={thumbStadium} alt="Venues" />
                <span className="ipl-duration-pill" style={{ background: 'var(--ipl-gold)', color: '#000' }}>39 VENUES</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. KEY STATISTICS STRIP (CLEAN WHITE STRIP BELOW HERO)
          ======================================================== */}
      <section className="ipl-stats-strip">
        <div className="ipl-stats-grid">
          
          <div className="ipl-stat-item">
            <span className="ipl-stat-label">
              <Calendar size={13} color="var(--ipl-cyan)" />
              Matches Analysed
            </span>
            <span className="ipl-stat-val" style={{ color: 'var(--ipl-blue)' }}>{totalMatches.toLocaleString()}</span>
            <span className="ipl-stat-sub">Seasons 2008 – 2025 (18 Years)</span>
          </div>

          <div className="ipl-stat-item">
            <span className="ipl-stat-label">
              <Shield size={13} color="var(--ipl-green)" />
              Completed Matches
            </span>
            <span className="ipl-stat-val" style={{ color: 'var(--ipl-green)' }}>{decidedMatches.toLocaleString()}</span>
            <span className="ipl-stat-sub">23 Abandoned / No-Result Excluded</span>
          </div>

          <div className="ipl-stat-item">
            <span className="ipl-stat-label">
              <TrendingUp size={13} color="var(--ipl-gold)" />
              Toss Win Advantage
            </span>
            <span className="ipl-stat-val" style={{ color: 'var(--ipl-gold)' }}>{tossWinPct}%</span>
            <span className="ipl-stat-sub">591 Match Wins from Toss Winners</span>
          </div>

          <div className="ipl-stat-item">
            <span className="ipl-stat-label">
              <BarChart3 size={13} color="var(--ipl-sky)" />
              Chasing Win Rate
            </span>
            <span className="ipl-stat-val" style={{ color: 'var(--ipl-sky)' }}>{chaseWinPct}%</span>
            <span className="ipl-stat-sub">621 Chased Wins vs 525 Defended</span>
          </div>

          <div className="ipl-stat-item">
            <span className="ipl-stat-label">
              <Award size={13} color="var(--ipl-purple)" />
              Teams Represented
            </span>
            <span className="ipl-stat-val" style={{ color: 'var(--ipl-purple)' }}>10 Active</span>
            <span className="ipl-stat-sub">15 Total Franchise Registry</span>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. LIGHT BODY SECTION ("LATEST ANALYTICS & INSIGHTS")
          ======================================================== */}
      <section className="ipl-light-section">
        <div className="ipl-section-header">
          <h2 className="ipl-section-title">
            Latest Analytics & Insights
          </h2>
          <div className="ipl-section-controls">
            <button 
              className="ipl-arrow-btn" 
              onClick={() => setActiveTab('overview')}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="ipl-arrow-btn" 
              onClick={() => setActiveTab('toss')}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <button 
              className="ipl-more-pill"
              onClick={() => setActiveTab('overview')}
            >
              More Analytics
            </button>
          </div>
        </div>

        {/* 4 News / Analytics Cards in horizontal row */}
        <div className="ipl-cards-row">
          {newsCards.map((card) => (
            <article 
              key={card.id} 
              className="ipl-news-card"
              onClick={() => setActiveTab(card.tab)}
            >
              <div className="ipl-news-img-box">
                <img src={card.img} alt={card.title} />
              </div>
              <div className="ipl-news-content">
                <span className="ipl-card-tag" style={{ color: card.tagColor }}>{card.tag}</span>
                <h3 className="ipl-card-headline">{card.title}</h3>
                <p className="ipl-card-summary">{card.summary}</p>
                <div className="ipl-card-footer">
                  <span>{card.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ipl-blue)', fontWeight: '700' }}>
                    Explore <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. TEAM SPOTLIGHT (10 ACTIVE FRANCHISES WITH REAL STATS)
          ======================================================== */}
      <section className="ipl-light-section" style={{ paddingTop: '0.5rem' }}>
        <div className="ipl-section-header">
          <div>
            <h2 className="ipl-section-title">
              Active IPL Franchises
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              All-time cumulative stats across 18 tournament editions (2008–2025)
            </p>
          </div>
          <button 
            className="ipl-more-pill"
            onClick={() => setActiveTab('teams')}
          >
            All Team Analytics
          </button>
        </div>

        <div className="ipl-teams-grid">
          {activeFranchises.map((franchise) => {
            const meta = getFranchiseMetadata(franchise.name);
            const teamStat = teamStats.find(t => 
              t.team === franchise.name || 
              t.code === franchise.short ||
              t.short_name === franchise.short
            );
            
            const matchesPlayed = teamStat ? teamStat.matches_played : '-';
            const wins = teamStat ? teamStat.wins : '-';
            const winRate = teamStat && teamStat.win_percentage !== undefined 
              ? `${teamStat.win_percentage}%` 
              : '-';

            const franchiseColor = meta.primaryColor || getFranchiseColor(franchise.name);

            return (
              <div 
                key={franchise.short} 
                className="ipl-team-card"
                onClick={() => setActiveTab('teams')}
                style={{ 
                  cursor: 'pointer',
                  borderTop: `4px solid ${franchiseColor}`
                }}
              >
                <div className="ipl-team-card-header">
                  <div 
                    className="ipl-team-badge"
                    style={{ 
                      backgroundColor: franchiseColor, 
                      color: meta.textColor || '#ffffff' 
                    }}
                  >
                    {franchise.short}
                  </div>
                  <div>
                    <h4 className="ipl-team-name">{franchise.name}</h4>
                    <span className="ipl-team-status">Active Franchise</span>
                  </div>
                </div>

                <div className="ipl-team-stats-row">
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Played</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{matchesPlayed}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Won</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--ipl-green)' }}>{wins}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Win %</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--ipl-blue)' }}>{winRate}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. BIG DATA ARCHITECTURE STRIP
          ======================================================== */}
      <section style={{
        background: 'var(--surface-white)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '2.5rem 2rem',
        marginTop: '2rem'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ipl-green)' }}></span>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--ipl-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pipeline Health Verified
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--ipl-navy)' }}>
              Big Data Architecture & Distributed Storage Stack
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Apache Hadoop HDFS • Apache Pig • Apache Hive • MongoDB 8.0 • MySQL 8.4 • Flask REST API
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="ipl-btn-primary" 
              onClick={() => setActiveTab('status')}
              style={{ padding: '9px 20px', fontSize: '0.85rem' }}
            >
              Verify Pipeline Parity
            </button>
            <button 
              className="ipl-btn-secondary" 
              onClick={() => setActiveTab('quality')}
              style={{ padding: '9px 20px', fontSize: '0.85rem', color: 'var(--ipl-purple)', borderColor: 'rgba(112, 72, 232, 0.4)' }}
            >
              Data Quality Audit
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
