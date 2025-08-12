import React, { useState, useCallback, useEffect } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import ChartContainer from './components/ChartContainer';
import ChartControls from './components/ChartControls';
import FractalSettings from './components/FractalSettings';
import BreakoutAlerts from './components/BreakoutAlerts';

const ChartAnalysisViewer = () => {
  // Chart state
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [showFractals, setShowFractals] = useState(true);
  const [showTrendlines, setShowTrendlines] = useState(true);
  const [trendlineColor, setTrendlineColor] = useState('#00D4AA');

  // Settings state
  const [isSettingsPanelCollapsed, setIsSettingsPanelCollapsed] = useState(true);
  const [fractalPeriod, setFractalPeriod] = useState(5);
  const [maxTrendlines, setMaxTrendlines] = useState(10);
  const [breakoutSensitivity, setBreakoutSensitivity] = useState('medium');

  // Alerts state
  const [breakoutAlerts, setBreakoutAlerts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Navigation state
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pairParam = params.get("pair"); // e.g., "RED/USDT"
    const timeframeParam = params.get("timeframe"); // e.g., "15m"

    if (pairParam) {
      setSelectedPair(pairParam);
    }

    if (timeframeParam) {
      setTimeframe(timeframeParam);
    }
  }, [])

  // Handlers
  const handleBreakoutDetected = useCallback((breakout) => {
    const newAlert = {
      id: Date.now(),
      ...breakout,
      strength: Math.random() > 0.7 ? 'strong' : Math.random() > 0.4 ? 'medium' : 'weak',
      volume: Math.floor(Math.random() * 5000000) + 100000
    };
    
    setBreakoutAlerts(prev => [newAlert, ...prev]?.slice(0, 20)); // Keep last 20 alerts
    
    // Play sound if enabled
    if (soundEnabled) {
      // In a real app, you would play an actual sound
      console.log('🔔 Breakout alert sound played');
    }
  }, [soundEnabled]);

  const handleDismissAlert = useCallback((alertId) => {
    setBreakoutAlerts(prev => prev?.filter(alert => alert?.id !== alertId));
  }, []);

  const handleClearAllAlerts = useCallback(() => {
    setBreakoutAlerts([]);
  }, []);

  const handleResetChart = useCallback(() => {
    // Reset chart to default state
    setShowFractals(true);
    setShowTrendlines(true);
    setTrendlineColor('#00D4AA');
    console.log('Chart reset to default state');
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    // In a real app, you would handle routing here
    if (tabId === 'scanner') {
      window.location.href = '/dashboard-overview';
    }
  }, []);

  const handleSettingsClick = useCallback(() => {
    console.log('Settings clicked');
  }, []);

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
      <main className="pt-32 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chart Controls */}
          <div className="mb-6">
            <ChartControls
              selectedPair={selectedPair}
              onPairChange={setSelectedPair}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              showFractals={showFractals}
              onFractalsToggle={setShowFractals}
              showTrendlines={showTrendlines}
              onTrendlinesToggle={setShowTrendlines}
              trendlineColor={trendlineColor}
              onTrendlineColorChange={setTrendlineColor}
              onResetChart={handleResetChart}
            />
          </div>

          {/* Main Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Settings (Collapsible) */}
            <div className={`lg:col-span-1 transition-all duration-300 ${isSettingsPanelCollapsed ? 'lg:col-span-0 lg:w-0 lg:overflow-hidden' : ''}`}>
              <div className="space-y-6">
                <FractalSettings
                  isCollapsed={isSettingsPanelCollapsed}
                  onToggleCollapse={() => setIsSettingsPanelCollapsed(!isSettingsPanelCollapsed)}
                  fractalPeriod={fractalPeriod}
                  onFractalPeriodChange={setFractalPeriod}
                  maxTrendlines={maxTrendlines}
                  onMaxTrendlinesChange={setMaxTrendlines}
                  breakoutSensitivity={breakoutSensitivity}
                  onBreakoutSensitivityChange={setBreakoutSensitivity}
                />

                {!isSettingsPanelCollapsed && (
                  <BreakoutAlerts
                    alerts={breakoutAlerts}
                    onDismissAlert={handleDismissAlert}
                    onClearAllAlerts={handleClearAllAlerts}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  />
                )}
              </div>
            </div>

            {/* Main Chart Container */}
            <div className={`transition-all duration-300 ${isSettingsPanelCollapsed ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
              <ChartContainer
                selectedPair={selectedPair}
                timeframe={timeframe}
                showFractals={showFractals}
                showTrendlines={showTrendlines}
                trendlineColor={trendlineColor}
                onBreakoutDetected={handleBreakoutDetected}
              />
            </div>
          </div>

          {/* Mobile Alerts Panel */}
          <div className="lg:hidden mt-6">
            <BreakoutAlerts
              alerts={breakoutAlerts}
              onDismissAlert={handleDismissAlert}
              onClearAllAlerts={handleClearAllAlerts}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          </div>

          {/* Performance Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full pulse-status" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Connection Status</p>
                  <p className="font-semibold text-success">Connected</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <span className="text-primary font-data text-sm">5s</span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Scan Interval</p>
                  <p className="font-semibold text-text-primary">Real-time</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <span className="text-warning font-data text-sm">{breakoutAlerts?.length}</span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Active Alerts</p>
                  <p className="font-semibold text-text-primary">Breakouts</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-text-secondary/20 rounded-lg">
                  <span className="text-text-secondary font-data text-sm">94.2%</span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Accuracy Rate</p>
                  <p className="font-semibold text-success">High</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChartAnalysisViewer;