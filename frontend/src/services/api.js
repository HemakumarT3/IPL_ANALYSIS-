/**
 * frontend/src/services/api.js
 * Centralized API Client for IPL Big Data Analytics Dashboard.
 * Configured with environment-aware baseURL, request timeouts, and robust error handling.
 */

// Production requests use VITE_API_BASE_URL when deployed; fallback to relative /api for dev proxy
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

/**
 * Universal fetch wrapper with timeout and standardized error handling.
 */
async function apiRequest(endpoint, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      let parsedMessage = `Request failed with status ${res.status}`;
      try {
        const jsonErr = JSON.parse(errorText);
        if (jsonErr && (jsonErr.error || jsonErr.message)) {
          parsedMessage = jsonErr.error || jsonErr.message;
        }
      } catch {
        if (errorText) parsedMessage = errorText.slice(0, 150);
      }
      throw new Error(parsedMessage);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Analytics request timed out. Please check backend connectivity and retry.');
    }
    throw err;
  }
}

export const fetchHealth = async () => {
  return apiRequest('/health');
};

export const fetchOverview = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  return apiRequest(`/overview${query}`);
};

export const fetchTeams = async () => {
  return apiRequest('/teams');
};

export const fetchTeamPerformance = async (season, team) => {
  const params = new URLSearchParams();
  if (season && season !== 'all') params.append('season', season);
  if (team && team !== 'all') params.append('team', team);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/teams/performance${query}`);
};

export const fetchHeadToHead = async (team1, team2) => {
  const params = new URLSearchParams({ team1, team2 });
  return apiRequest(`/teams/head-to-head?${params.toString()}`);
};

export const fetchToss = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  return apiRequest(`/toss${query}`);
};

export const fetchVenues = async (season) => {
  const query = season && season !== 'all' ? `?season=${encodeURIComponent(season)}` : '';
  return apiRequest(`/venues${query}`);
};

export const fetchVenuesPerformance = async (venue, season) => {
  const params = new URLSearchParams();
  if (venue && venue !== 'all') params.append('venue', venue);
  if (season && season !== 'all') params.append('season', season);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/venues/performance${query}`);
};

export const fetchSeasons = async (season, team) => {
  const params = new URLSearchParams();
  if (season && season !== 'all') params.append('season', season);
  if (team && team !== 'all') params.append('team', team);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/seasons${query}`);
};

export const fetchInsights = async () => {
  return apiRequest('/insights');
};

export const fetchDataQuality = async () => {
  return apiRequest('/data-quality');
};

export const fetchSourcesStatus = async () => {
  return apiRequest('/sources/status');
};
