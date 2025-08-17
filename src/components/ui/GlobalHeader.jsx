import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const GlobalHeader = ({ 
  connectionStatus = 'connected', 
  onSettingsClick = () => {},
  className = '' 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-success',
          icon: 'Wifi',
          label: 'Connected',
          pulse: true
        };
      case 'disconnected':
        return {
          color: 'text-error',
          icon: 'WifiOff',
          label: 'Disconnected',
          pulse: false
        };
      case 'error':
        return {
          color: 'text-error',
          icon: 'AlertTriangle',
          label: 'Connection Error',
          pulse: true
        };
      default:
        return {
          color: 'text-warning',
          icon: 'Loader',
          label: 'Connecting...',
          pulse: true
        };
    }
  };

  const statusConfig = getStatusConfig(connectionStatus);

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
    onSettingsClick();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon 
              name="TrendingUp" 
              size={24} 
              color="var(--color-primary-foreground)" 
              strokeWidth={2.5}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-text-primary leading-none">
              TrendBreak Scanner
            </h1>
            <span className="text-xs text-text-secondary font-medium">
              Real-time Breakout Detection
            </span>
          </div>
        </div>

        {/* Status & Controls Section */}
        <div className="flex items-center space-x-6">

          {/* System Time */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-card rounded-lg border border-border">
            <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
            <span className="text-sm font-data text-text-secondary">
              {new Date()?.toLocaleTimeString('en-US')}
            </span>
          </div>

          {/* Settings Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettingsToggle}
              className="w-10 h-10"
            >
              <Icon name="Settings" size={20} />
            </Button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">Settings</p>
                  <p className="text-xs text-text-secondary">Manage your preferences</p>
                </div>
                
                <div className="py-1">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors">
                    <Icon name="Bell" size={16} className="mr-3" />
                    Notifications
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors">
                    <Icon name="Palette" size={16} className="mr-3" />
                    Appearance
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors">
                    <Icon name="Database" size={16} className="mr-3" />
                    Data Sources
                  </button>
                </div>

                <div className="border-t border-border pt-1">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors">
                    <Icon name="HelpCircle" size={16} className="mr-3" />
                    Help & Support
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors">
                    <Icon name="LogOut" size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;