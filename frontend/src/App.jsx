import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { TeamAnalysisPage } from './pages/TeamAnalysisPage';
import { TossAnalysisPage } from './pages/TossAnalysisPage';
import { VenueAnalysisPage } from './pages/VenueAnalysisPage';
import { SeasonAnalysisPage } from './pages/SeasonAnalysisPage';
import { StatusPage } from './pages/StatusPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { fetchHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetchHealth()
      .then(res => setHealth(res))
      .catch(err => {
        console.error("Health check error:", err);
        setHealth({ status: 'offline', api_alive: false, error: err.message });
      })
      .finally(() => setHealthLoading(false));
  }, []);

  return (
    <div className="ipl-app-container">
      {/* Official IPL-Inspired Royal Blue Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Dynamic Analytics Workspace */}
      <main style={{ minHeight: '80vh', backgroundColor: 'var(--ipl-bg-light)', paddingBottom: '3rem' }}>
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'overview' && <OverviewPage />}
        {activeTab === 'points' && <TeamAnalysisPage />}
        {activeTab === 'teams' && <TeamAnalysisPage />}
        {activeTab === 'toss' && <TossAnalysisPage />}
        {activeTab === 'venues' && <VenueAnalysisPage />}
        {activeTab === 'seasons' && <SeasonAnalysisPage />}
        {activeTab === 'status' && <StatusPage />}
        {activeTab === 'quality' && <DataQualityPage />}
      </main>

      {/* Comprehensive IPL Big Data Engineering Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
