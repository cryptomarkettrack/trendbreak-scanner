import React, { useState, useEffect } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import ScanningControls from './components/ScanningControls';
import ActivityFeed from './components/ActivityFeed';
import SystemMetrics from './components/SystemMetrics';

const DashboardOverview = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanningSettings, setScanningSettings] = useState({
    exchange: 'binance',
    timeframe: '15m',
    fractalPeriod: 5,
    maxPairs: 50
  });

  // Simulate connection status changes
  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (isScanning) {
        // Occasionally simulate connection issues
        const statuses = ['connected', 'connected', 'connected', 'warning', 'connected'];
        const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
        setConnectionStatus(randomStatus);
      } else {
        setConnectionStatus('disconnected');
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [isScanning]);

  const handleToggleScanning = (scanning) => {
    setIsScanning(scanning);
    if (scanning) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };

  const handleSettingsChange = (settings) => {
    setScanningSettings(settings);
    console.log('Settings updated:', settings);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader 
        connectionStatus={connectionStatus}
        onSettingsClick={handleSettingsClick}
      />
      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      {/* Main Content */}
      <main className="pt-32 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Dashboard Overview
            </h1>
            <p className="text-text-secondary">
              Monitor real-time cryptocurrency breakout detection across all USDT trading pairs
            </p>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Scanning Controls */}
            <div className="lg:col-span-3">
              <ScanningControls
                isScanning={isScanning}
                onToggleScanning={handleToggleScanning}
                onSettingsChange={handleSettingsChange}
                className="sticky top-36"
              />
            </div>

            {/* Center Area - Activity Feed */}
            <div className="lg:col-span-6">
              <ActivityFeed
                isScanning={isScanning}
                className="h-fit"
                timeframe={scanningSettings?.timeframe}
              />
            </div>

            {/* Right Panel - System Metrics */}
            <div className="lg:col-span-3">
              <SystemMetrics
                isScanning={isScanning}
                className="sticky top-36"
              />
            </div>
          </div>

          {/* Mobile Responsive Adjustments */}
          <div className="block md:hidden mt-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-success pulse-status' : 'bg-text-secondary'}`} />
                  <span>{isScanning ? 'Scanning Active' : 'Scanning Stopped'}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span>{scanningSettings?.exchange} • {scanningSettings?.timeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Status Bar for Mobile */}
      <div className="fixed bottom-16 left-0 right-0 z-50 md:hidden">
        <div className="mx-4 mb-2">
          <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-elevation-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success' : 'bg-error'}`} />
                <span className="text-text-primary font-medium">
                  {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-text-secondary">
                {isScanning ? `${scanningSettings?.maxPairs} pairs` : 'Idle'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;