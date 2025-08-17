import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ScanningControls = ({ 
  isScanning = false, 
  onToggleScanning = () => {},
  onSettingsChange = () => {},
  className = '' 
}) => {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [fractalPeriod, setFractalPeriod] = useState('5');
  const [maxPairs, setMaxPairs] = useState('50');

  const exchangeOptions = [
    { value: 'binance', label: 'Binance', description: 'Most liquid pairs' },
    { value: 'kraken', label: 'Kraken', description: 'European focus' },
    { value: 'bybit', label: 'Bybit', description: 'High leverage & derivatives' },
    { value: 'kucoin', label: 'KuCoin', description: 'Wide selection' }
  ];

  const timeframeOptions = [
    { value: '1m', label: '1 Minute', description: 'Ultra short-term' },
    { value: '5m', label: '5 Minutes', description: 'Short-term scalping' },
    { value: '15m', label: '15 Minutes', description: 'Recommended' },
    { value: '1h', label: '1 Hour', description: 'Medium-term' },
    { value: '4h', label: '4 Hours', description: 'Swing trading' },
    { value: '1d', label: '1 Day', description: 'Long-term position analysis' },
    { value: '1w', label: '1 Week', description: 'Historical trend analysis' }
  ];

  const handleToggleScanning = () => {
    onToggleScanning(!isScanning);
  };

  const handleSettingsUpdate = (key, value) => {
    const settings = {
      exchange: selectedExchange,
      timeframe: selectedTimeframe,
      fractalPeriod: parseInt(fractalPeriod),
      maxPairs: parseInt(maxPairs),
      [key]: value
    };
    onSettingsChange(settings);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Scanning Controls</h2>
          <p className="text-sm text-text-secondary mt-1">Configure breakout detection parameters</p>
        </div>
        <Icon name="Settings" size={20} className="text-text-secondary" />
      </div>
      {/* Main Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-success pulse-status' : 'bg-text-secondary'}`} />
          <div>
            <p className="font-medium text-text-primary">
              {isScanning ? 'Scanning Active' : 'Scanning Stopped'}
            </p>
            <p className="text-sm text-text-secondary">
              {isScanning ? 'Monitoring all USDT pairs' : 'Click to start monitoring'}
            </p>
          </div>
        </div>
        <Button
          variant={isScanning ? "destructive" : "default"}
          onClick={handleToggleScanning}
          iconName={isScanning ? "Square" : "Play"}
          iconPosition="left"
          className="min-w-[100px]"
        >
          {isScanning ? 'Stop' : 'Start'}
        </Button>
      </div>
      {/* Exchange Selection */}
      <div className="space-y-4">
        <Select
          label="Exchange"
          description="Select cryptocurrency exchange for data"
          options={exchangeOptions}
          value={selectedExchange}
          onChange={(value) => {
            setSelectedExchange(value);
            handleSettingsUpdate('exchange', value);
          }}
          disabled={isScanning}
        />

        {/* Timeframe Selection */}
        <Select
          label="Timeframe"
          description="Chart timeframe for analysis"
          options={timeframeOptions}
          value={selectedTimeframe}
          onChange={(value) => {
            setSelectedTimeframe(value);
            handleSettingsUpdate('timeframe', value);
          }}
          disabled={isScanning}
        />

        {/* Fractal Period */}
        <Input
          label="Fractal Period"
          type="number"
          description="Minimum periods for fractal detection (2-20)"
          value={fractalPeriod}
          onChange={(e) => {
            const value = e?.target?.value;
            setFractalPeriod(value);
            if (value >= 2 && value <= 20) {
              handleSettingsUpdate('fractalPeriod', parseInt(value));
            }
          }}
          min="2"
          max="20"
          disabled={isScanning}
          error={fractalPeriod < 2 || fractalPeriod > 20 ? 'Must be between 2-20' : ''}
        />

        {/* Max Pairs */}
        <Input
          label="Max Pairs"
          type="number"
          description="Maximum pairs to scan simultaneously"
          value={maxPairs}
          onChange={(e) => {
            const value = e?.target?.value;
            setMaxPairs(value);
            if (value >= 1 && value <= 200) {
              handleSettingsUpdate('maxPairs', parseInt(value));
            }
          }}
          min="1"
          max="200"
          disabled={isScanning}
          error={maxPairs < 1 || maxPairs > 200 ? 'Must be between 1-200' : ''}
        />
      </div>
      {/* Quick Actions */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm font-medium text-text-primary mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
            disabled={isScanning}
            className="text-xs"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            className="text-xs"
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanningControls;