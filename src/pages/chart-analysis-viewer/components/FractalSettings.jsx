import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FractalSettings = ({
  isCollapsed = true,
  onToggleCollapse = () => {},
  fractalPeriod = 5,
  onFractalPeriodChange = () => {},
  maxTrendlines = 10,
  onMaxTrendlinesChange = () => {},
  breakoutSensitivity = 'medium',
  onBreakoutSensitivityChange = () => {},
  className = ''
}) => {
  const [localSettings, setLocalSettings] = useState({
    fractalPeriod,
    maxTrendlines,
    breakoutSensitivity
  });

  const sensitivityOptions = [
    { value: 'low', label: 'Low Sensitivity', description: 'Fewer but stronger signals' },
    { value: 'medium', label: 'Medium Sensitivity', description: 'Balanced signal detection' },
    { value: 'high', label: 'High Sensitivity', description: 'More signals, higher noise' }
  ];

  const handleApplySettings = () => {
    onFractalPeriodChange(localSettings?.fractalPeriod);
    onMaxTrendlinesChange(localSettings?.maxTrendlines);
    onBreakoutSensitivityChange(localSettings?.breakoutSensitivity);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      fractalPeriod: 5,
      maxTrendlines: 10,
      breakoutSensitivity: 'medium'
    };
    setLocalSettings(defaultSettings);
    onFractalPeriodChange(defaultSettings?.fractalPeriod);
    onMaxTrendlinesChange(defaultSettings?.maxTrendlines);
    onBreakoutSensitivityChange(defaultSettings?.breakoutSensitivity);
  };

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-3">
          <Icon name="Settings2" size={18} className="text-primary" />
          <h3 className="font-semibold text-text-primary">Fractal Configuration</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-secondary px-2 py-1 bg-primary/20 text-primary rounded">
            Period: {fractalPeriod}
          </span>
          <Icon 
            name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
            size={18} 
            className="text-text-secondary transition-transform duration-200"
          />
        </div>
      </div>
      {/* Settings Panel */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border space-y-6">
          {/* Fractal Period Setting */}
          <div>
            <Input
              label="Fractal Period"
              type="number"
              description="Number of bars to look back for fractal detection (minimum: 2)"
              value={localSettings?.fractalPeriod}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                fractalPeriod: Math.max(2, parseInt(e?.target?.value) || 2)
              }))}
              min={2}
              max={20}
              className="max-w-xs"
            />
            <div className="mt-2 text-xs text-text-secondary">
              Higher values = fewer but more significant fractals
            </div>
          </div>

          {/* Max Trendlines Setting */}
          <div>
            <Input
              label="Maximum Trendlines"
              type="number"
              description="Maximum number of trendlines to display simultaneously"
              value={localSettings?.maxTrendlines}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                maxTrendlines: Math.max(1, parseInt(e?.target?.value) || 1)
              }))}
              min={1}
              max={50}
              className="max-w-xs"
            />
            <div className="mt-2 text-xs text-text-secondary">
              Older trendlines are automatically removed when limit is reached
            </div>
          </div>

          {/* Breakout Sensitivity */}
          <div>
            <Select
              label="Breakout Sensitivity"
              description="Adjust how sensitive the breakout detection algorithm is"
              options={sensitivityOptions}
              value={localSettings?.breakoutSensitivity}
              onChange={(value) => setLocalSettings(prev => ({
                ...prev,
                breakoutSensitivity: value
              }))}
              className="max-w-xs"
            />
          </div>

          {/* Trendline Management */}
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Trendline Management</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-text-primary">Recent Lines</span>
                </div>
                <span className="font-medium text-text-primary">7</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-text-secondary rounded-full"></div>
                  <span className="text-text-primary">Historical Lines</span>
                </div>
                <span className="font-medium text-text-primary">3</span>
              </div>
            </div>
          </div>

          {/* Algorithm Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Algorithm Status</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Last Scan:</span>
                <span className="font-data text-text-primary">
                  {new Date()?.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Fractals Detected:</span>
                <span className="font-medium text-success">24</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Active Trendlines:</span>
                <span className="font-medium text-primary">8</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Processing Time:</span>
                <span className="font-data text-text-primary">0.23s</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-border">
            <Button
              variant="default"
              size="sm"
              onClick={handleApplySettings}
              iconName="Check"
              iconPosition="left"
              iconSize={14}
            >
              Apply Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={14}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractalSettings;