import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BreakoutAlerts = ({
  alerts = [],
  onDismissAlert = () => {},
  onClearAllAlerts = () => {},
  soundEnabled = true,
  onToggleSound = () => {},
  className = ''
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock alerts data
  const mockAlerts = [
    {
      id: 1,
      pair: 'BTC/USDT',
      type: 'upward',
      price: 45234.56,
      timestamp: new Date(Date.now() - 120000),
      trendlinePrice: 45100.00,
      strength: 'strong',
      volume: 1234567
    },
    {
      id: 2,
      pair: 'ETH/USDT',
      type: 'downward',
      price: 2789.34,
      timestamp: new Date(Date.now() - 300000),
      trendlinePrice: 2850.00,
      strength: 'medium',
      volume: 987654
    },
    {
      id: 3,
      pair: 'ADA/USDT',
      type: 'upward',
      price: 0.4567,
      timestamp: new Date(Date.now() - 600000),
      trendlinePrice: 0.4520,
      strength: 'weak',
      volume: 2345678
    }
  ];

  const activeAlerts = alerts?.length > 0 ? alerts : mockAlerts;

  useEffect(() => {
    // setVisibleAlerts(activeAlerts?.slice(0, isExpanded ? activeAlerts?.length : 3));
  }, [activeAlerts, isExpanded]);

  const getAlertIcon = (type) => {
    return type === 'upward' ? 'TrendingUp' : 'TrendingDown';
  };

  const getAlertColor = (type, strength) => {
    if (type === 'upward') {
      return strength === 'strong' ? 'text-success' : 
             strength === 'medium' ? 'text-primary' : 'text-warning';
    } else {
      return strength === 'strong' ? 'text-error' : 
             strength === 'medium' ? 'text-warning' : 'text-text-secondary';
    }
  };

  const getStrengthBadge = (strength) => {
    const colors = {
      strong: 'bg-success/20 text-success',
      medium: 'bg-warning/20 text-warning',
      weak: 'bg-text-secondary/20 text-text-secondary'
    };
    
    return colors?.[strength] || colors?.weak;
  };

  const formatPrice = (price) => {
    return price < 1 ? price?.toFixed(6) : price?.toFixed(2);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000)?.toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000)?.toFixed(1)}K`;
    }
    return volume?.toString();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Bell" size={18} className="text-primary" />
          <h3 className="font-semibold text-text-primary">Breakout Alerts</h3>
          {activeAlerts?.length > 0 && (
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
              {activeAlerts?.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-md transition-colors ${
              soundEnabled 
                ? 'bg-primary/20 text-primary hover:bg-primary/30' :'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
            title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
          >
            <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={16} />
          </button>
          
          {activeAlerts?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllAlerts}
              iconName="X"
              iconSize={14}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {visibleAlerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="Bell" size={48} className="text-text-secondary/50 mb-3" />
            <p className="text-text-secondary font-medium">No breakout alerts</p>
            <p className="text-sm text-text-secondary/80 mt-1">
              Alerts will appear here when breakouts are detected
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleAlerts?.map((alert) => (
              <div key={alert?.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg bg-muted/50 ${getAlertColor(alert?.type, alert?.strength)}`}>
                      <Icon name={getAlertIcon(alert?.type)} size={18} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-text-primary">{alert?.pair}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStrengthBadge(alert?.strength)}`}>
                          {alert?.strength}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-text-secondary">Breakout Price:</span>
                          <span className="font-data font-medium text-text-primary">
                            ${formatPrice(alert?.price)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="text-text-secondary">Trendline:</span>
                          <span className="font-data text-text-secondary">
                            ${formatPrice(alert?.trendlinePrice)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="text-text-secondary">Volume:</span>
                          <span className="font-data text-text-primary">
                            {formatVolume(alert?.volume)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-secondary">
                          {getTimeAgo(alert?.timestamp)}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Navigate to chart */}}
                            iconName="BarChart3"
                            iconSize={14}
                          >
                            View Chart
                          </Button>
                          
                          <button
                            onClick={() => onDismissAlert(alert?.id)}
                            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                            title="Dismiss alert"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      {activeAlerts?.length > 3 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={14}
            fullWidth
          >
            {isExpanded ? 'Show Less' : `Show ${activeAlerts?.length - 3} More Alerts`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BreakoutAlerts;