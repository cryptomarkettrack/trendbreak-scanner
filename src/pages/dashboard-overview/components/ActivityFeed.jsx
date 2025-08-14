import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import cryptoService from '../../../utils/cryptoService';

const ActivityFeed = ({ 
  isScanning = false,
  className = '',
  timeframe = '1h'
}) => {
  const [breakouts, setBreakouts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  console.log('timeframe', timeframe);

  // Popular USDT pairs to monitor
  // const monitoredPairs = [
  //   'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT',
  //   'MATIC/USDT', 'DOT/USDT', 'AVAX/USDT', 'LINK/USDT', 'UNI/USDT'
  // ];


  const [monitoredPairs, setMonitoredPairs] = useState([]);
  useEffect(async () => {
    setMonitoredPairs(await getTradingPairs());
  }, []);

  const getTradingPairs = async () => {
    var usdtPairs = await cryptoService.getUSDTPairs('binance', 1000);
    return usdtPairs;
  };

  // Scan for real breakouts
  const scanForBreakouts = useCallback(async () => {
    if (!isScanning) return;

    try {
      setIsLoading(true);
      setConnectionStatus('scanning');
      
      const breakoutPromises = monitoredPairs?.map(async (pair) => {
        try {
          const breakout = await cryptoService?.analyzeBreakout(pair, timeframe);
          if (breakout) {
            return {
              id: Date.now() + Math.random(),
              pair: breakout?.symbol,
              direction: breakout?.type === 'upward' ? 'bullish' : 'bearish',
              price: breakout?.price?.toFixed(breakout?.price < 1 ? 6 : 2),
              change: `${breakout?.change > 0 ? '+' : ''}${breakout?.change?.toFixed(2)}%`,
              timestamp: breakout?.timestamp,
              chartUrl: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=120&fit=crop&q=80&auto=format&overlay=${breakout?.symbol?.replace('/', '-')}`,
              telegramSent: false,
              strength: breakout?.strength,
              volume: breakout?.volume
            };
          }
          return null;
        } catch (error) {
          console.error(`Error analyzing ${pair}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(breakoutPromises);
      const newBreakouts = results
        ?.filter(result => result?.status === 'fulfilled' && result?.value)
        ?.sort((a, b) => {
          // If you want to sort by change percentage, you can do it like this:
          // const aChange = parseFloat(a.value.change.replace('%', ''));
          // const bChange = parseFloat(b.value.change.replace('%', ''));

          // Sort by volume
          const aChange = a.value.volume;
          const bChange = b.value.volume;

          // Positive first (largest to smallest), then zeros, then negatives
          if (aChange > 0 && bChange > 0) return bChange - aChange; // sort positives desc
          if (aChange > 0) return -1; // a positive before anything else
          if (bChange > 0) return 1;  // b positive before anything else

          if (aChange === 0 && bChange === 0) return 0; // both zero
          if (aChange === 0) return -1; // zero before negatives
          if (bChange === 0) return 1;  // zero before negatives

          return bChange - aChange; // negatives sorted desc (less negative first)
        })
        ?.map(result => result?.value);

      if (newBreakouts?.length > 0) {
        setBreakouts(prev => {
          const combined = [...newBreakouts, ...prev];
          // Remove duplicates based on pair and direction
          const unique = combined?.filter((breakout, index, self) => 
            index === self?.findIndex(b => 
              b?.pair === breakout?.pair && 
              b?.direction === breakout?.direction &&
              Math.abs(new Date(b?.timestamp) - new Date(breakout?.timestamp)) < 300000 // 5 minutes
            )
          );
          return unique?.slice(0, 50); // Keep last 50 breakouts
        });
      }

      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Error scanning for breakouts:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [isScanning, monitoredPairs]);

  // Initialize and set up scanning interval
  useEffect(() => {
    let interval = null;

    if (isScanning) {
      // Initial scan
      scanForBreakouts();
      
      // Set up periodic scanning
      interval = setInterval(scanForBreakouts, 30000); // Scan every 30 seconds
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, scanForBreakouts]);

  // Filter breakouts
  const filteredBreakouts = breakouts?.filter(breakout => {
    if (filter === 'all') return true;
    if (filter === 'bullish') return breakout?.direction === 'bullish';
    if (filter === 'bearish') return breakout?.direction === 'bearish';
    if (filter === 'strong') return breakout?.strength === 'strong';
    return true;
  });

  const getDirectionConfig = (direction) => {
    return direction === 'bullish' 
      ? { color: 'text-success', bg: 'bg-success/20', icon: 'TrendingUp' }
      : { color: 'text-error', bg: 'bg-error/20', icon: 'TrendingDown' };
  };

  const getStrengthConfig = (strength) => {
    switch (strength) {
      case 'strong':
        return { color: 'text-success', label: 'Strong' };
      case 'medium':
        return { color: 'text-warning', label: 'Medium' };
      case 'weak':
        return { color: 'text-text-secondary', label: 'Weak' };
      default:
        return { color: 'text-text-secondary', label: 'Unknown' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  const getConnectionStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return { color: 'text-success', label: 'Live', pulse: true };
      case 'scanning':
        return { color: 'text-warning', label: 'Scanning', pulse: false };
      case 'disconnected':
        return { color: 'text-text-secondary', label: 'Stopped', pulse: false };
      case 'error':
        return { color: 'text-error', label: 'Error', pulse: false };
      default:
        return { color: 'text-text-secondary', label: 'Unknown', pulse: false };
    }
  };

  const statusConfig = getConnectionStatusConfig(connectionStatus);

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Live Activity Feed</h2>
            <p className="text-sm text-text-secondary mt-1">
              Real-time breakout detections • {filteredBreakouts?.length} alerts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isScanning && (
              <div className={`flex items-center space-x-2 ${statusConfig?.color}`}>
                <div className={`w-2 h-2 rounded-full ${statusConfig?.pulse ? 'pulse-status' : ''} ${
                  connectionStatus === 'connected' ? 'bg-success' : 
                  connectionStatus === 'scanning' ? 'bg-warning animate-pulse' :
                  connectionStatus === 'error' ? 'bg-error' : 'bg-text-secondary'
                }`} />
                <span className="text-sm font-medium">{statusConfig?.label}</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center space-x-1">
                <Icon name="Loader" size={14} className="animate-spin text-primary" />
                <span className="text-xs text-text-secondary">Scanning</span>
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Icon name="MoreVertical" size={16} />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: breakouts?.length },
            { key: 'bullish', label: 'Bullish', count: breakouts?.filter(b => b?.direction === 'bullish')?.length },
            { key: 'bearish', label: 'Bearish', count: breakouts?.filter(b => b?.direction === 'bearish')?.length },
            { key: 'strong', label: 'Strong', count: breakouts?.filter(b => b?.strength === 'strong')?.length }
          ]?.map((tab) => (
            <button
              key={tab?.key}
              onClick={() => setFilter(tab?.key)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${filter === tab?.key 
                  ? 'bg-background text-text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <span>{tab?.label}</span>
              <span className="text-xs bg-border px-1.5 py-0.5 rounded-full">
                {tab?.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {!isScanning && filteredBreakouts?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Activity" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">Scanner is not running</p>
            <p className="text-sm text-text-secondary mt-1">
              Start scanning to detect real-time breakouts from exchanges
            </p>
          </div>
        ) : isScanning && filteredBreakouts?.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Icon name="Search" size={48} className="text-primary animate-pulse" />
            </div>
            <p className="text-text-primary">Monitoring {monitoredPairs?.length} pairs...</p>
            <p className="text-sm text-text-secondary mt-1">
              Breakouts will appear here when detected
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBreakouts?.map((breakout) => {
              const directionConfig = getDirectionConfig(breakout?.direction);
              const strengthConfig = getStrengthConfig(breakout?.strength);

              return (
                <div key={breakout?.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Chart Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-10 bg-muted rounded overflow-hidden">
                      <Image
                        src={breakout?.chartUrl}
                        alt={`${breakout?.pair} chart`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-text-primary">{breakout?.pair}</h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${directionConfig?.bg}`}>
                            <Icon name={directionConfig?.icon} size={12} className={directionConfig?.color} />
                            <span className={`text-xs font-medium ${directionConfig?.color}`}>
                              {breakout?.direction}
                            </span>
                          </div>
                          <span className={`text-xs font-medium ${strengthConfig?.color}`}>
                            {strengthConfig?.label}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary">
                          {formatTimestamp(breakout?.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-sm font-data text-text-primary">
                              ${breakout?.price}
                            </span>
                            <span className={`ml-2 text-sm font-medium ${
                              breakout?.change?.startsWith('+') ? 'text-success' : 'text-error'
                            }`}>
                              {breakout?.change}
                            </span>
                          </div>
                          {breakout?.volume && (
                            <div className="text-xs text-text-secondary">
                              Vol: {parseFloat(breakout?.volume)?.toLocaleString()}
                            </div>
                          )}
                          {breakout?.telegramSent && (
                            <div className="flex items-center space-x-1 text-success">
                              <Icon name="Send" size={12} />
                              <span className="text-xs">Sent</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            iconName="ExternalLink"
                            onClick={() => window.open(`/chart-analysis-viewer?pair=${breakout?.pair}&timeframe=${timeframe}`, '_blank')}
                          >
                            View Chart
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="MoreHorizontal" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;