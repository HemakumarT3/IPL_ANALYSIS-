const API_BASE = '/api';

export const fetchHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to connect to Big Data backend');
  return res.json();
};

export const fetchOverview = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  const res = await fetch(`${API_BASE}/overview${query}`);
  if (!res.ok) throw new Error('Failed to fetch overview data');
  return res.json();
};

export const fetchTeams = async () => {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error('Failed to fetch teams list');
  return res.json();
};

export const fetchTeamPerformance = async (season, team) => {
  const params = new URLSearchParams();
  if (season && season !== 'all') params.append('season', season);
  if (team && team !== 'all') params.append('team', team);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/teams/performance${query}`);
  if (!res.ok) throw new Error('Failed to fetch team performance metrics');
  return res.json();
};

export const fetchToss = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  const res = await fetch(`${API_BASE}/toss${query}`);
  if (!res.ok) throw new Error('Failed to fetch toss analytics');
  return res.json();
};

export const fetchVenues = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  const res = await fetch(`${API_BASE}/venues${query}`);
  if (!res.ok) throw new Error('Failed to fetch venues list');
  return res.json();
};

export const fetchVenuesPerformance = async (venue, season) => {
  const params = new URLSearchParams();
  if (venue && venue !== 'all') params.append('venue', venue);
  if (season && season !== 'all') params.append('season', season);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/venues/performance${query}`);
  if (!res.ok) throw new Error('Failed to fetch venue performance');
  return res.json();
};

export const fetchSeasons = async (season, team) => {
  const params = new URLSearchParams();
  if (season && season !== 'all') params.append('season', season);
  if (team && team !== 'all') params.append('team', team);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/seasons${query}`);
  if (!res.ok) throw new Error('Failed to fetch season trends');
  return res.json();
};

export const fetchInsights = async () => {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch notable insights');
  return res.json();
};

export const fetchDataQuality = async () => {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
};

export const fetchSourcesStatus = async () => {
  const res = await fetch(`${API_BASE}/sources/status`);
  if (!res.ok) throw new Error('Failed to fetch data sources status');
  return res.json();
};
