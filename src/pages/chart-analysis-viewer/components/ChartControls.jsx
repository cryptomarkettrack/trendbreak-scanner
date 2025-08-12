import React, { useEffect, useMemo, useState } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import cryptoService from 'utils/cryptoService';

const ChartControls = ({
  onPairChange = () => {},
  selectedPair='BTC/USDT',
  timeframe = '1h',
  onTimeframeChange = () => {},
  showFractals = true,
  onFractalsToggle = () => {},
  showTrendlines = true,
  onTrendlinesToggle = () => {},
  trendlineColor = '#00D4AA',
  onTrendlineColorChange = () => {},
  onResetChart = () => {},
  className = ''
}) => {
  const [tradingPairs, setTradingPairs] = useState([]);
  useEffect(async () => {
    setTradingPairs(await getTradingPairs());
  }, []);
  // const tradingPairs = [
  //   { value: 'BTC/USDT', label: 'BTC/USDT', description: 'Bitcoin vs Tether' },
  //   { value: 'ETH/USDT', label: 'ETH/USDT', description: 'Ethereum vs Tether' },
  //   { value: 'ADA/USDT', label: 'ADA/USDT', description: 'Cardano vs Tether' },
  //   { value: 'DOT/USDT', label: 'DOT/USDT', description: 'Polkadot vs Tether' },
  //   { value: 'LINK/USDT', label: 'LINK/USDT', description: 'Chainlink vs Tether' },
  //   { value: 'UNI/USDT', label: 'UNI/USDT', description: 'Uniswap vs Tether' },
  //   { value: 'MATIC/USDT', label: 'MATIC/USDT', description: 'Polygon vs Tether' },
  //   { value: 'AVAX/USDT', label: 'AVAX/USDT', description: 'Avalanche vs Tether' },
  //   { value: 'SOL/USDT', label: 'SOL/USDT', description: 'Solana vs Tether' },
  //   { value: 'ATOM/USDT', label: 'ATOM/USDT', description: 'Cosmos vs Tether' }
  // ];

  const getTradingPairs = async () => {
    var usdtPairs = await cryptoService.getUSDTPairs('binance', 1000);
    return usdtPairs?.map(pair => {
      return {value: pair, label: pair}
    }) ?? [];
  };

  const timeframes = [
    { value: '1m', label: '1 Minute', description: 'Ultra short-term analysis' },
    { value: '5m', label: '5 Minutes', description: 'Short-term scalping' },
    { value: '15m', label: '15 Minutes', description: 'Quick trend analysis' },
    { value: '1h', label: '1 Hour', description: 'Medium-term trends' },
    { value: '4h', label: '4 Hours', description: 'Swing trading analysis' },
    { value: '1d', label: '1 Day', description: 'Long-term position analysis' }
  ];

  const colorOptions = [
    { value: '#00D4AA', label: 'Teal', color: '#00D4AA' },
    { value: '#10B981', label: 'Green', color: '#10B981' },
    { value: '#F59E0B', label: 'Amber', color: '#F59E0B' },
    { value: '#EF4444', label: 'Red', color: '#EF4444' },
    { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' },
    { value: '#06B6D4', label: 'Cyan', color: '#06B6D4' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Primary Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="min-w-[200px]">
            <Select
              label="Trading Pair"
              options={tradingPairs}
              value={selectedPair}
              onChange={onPairChange}
              searchable
              className="text-sm"
            />
          </div>
          
          <div className="min-w-[150px]">
            <Select
              label="Timeframe"
              options={timeframes}
              value={timeframe}
              onChange={onTimeframeChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Chart Style Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Toggle Controls */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFractals}
                onChange={(e) => onFractalsToggle(e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-text-primary">Fractals</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrendlines}
                onChange={(e) => onTrendlinesToggle(e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-text-primary">Trendlines</span>
            </label>
          </div>

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Color:</span>
            <div className="flex items-center space-x-1">
              {colorOptions?.map((color) => (
                <button
                  key={color?.value}
                  onClick={() => onTrendlineColorChange(color?.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    trendlineColor === color?.value 
                      ? 'border-text-primary shadow-lg' 
                      : 'border-border hover:border-text-secondary'
                  }`}
                  style={{ backgroundColor: color?.color }}
                  title={color?.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetChart}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={14}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-text-secondary">Active Pairs:</span>
            <span className="font-medium text-text-primary">247</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={16} className="text-warning" />
            <span className="text-text-secondary">Breakouts:</span>
            <span className="font-medium text-text-primary">12</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <span className="text-text-secondary">Scan Rate:</span>
            <span className="font-medium text-text-primary">5s</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={16} className="text-text-secondary" />
            <span className="text-text-secondary">Accuracy:</span>
            <span className="font-medium text-success">94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;