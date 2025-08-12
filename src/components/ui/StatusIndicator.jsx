import React from 'react';
import Icon from '../AppIcon';

const StatusIndicator = ({ 
  status = 'connected', 
  label = '', 
  showPulse = false,
  size = 'default',
  className = '' 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-success',
          bgColor: 'bg-success/20',
          dotColor: 'bg-success',
          icon: 'CheckCircle',
          defaultLabel: 'Connected'
        };
      case 'disconnected':
        return {
          color: 'text-error',
          bgColor: 'bg-error/20',
          dotColor: 'bg-error',
          icon: 'XCircle',
          defaultLabel: 'Disconnected'
        };
      case 'error':
        return {
          color: 'text-error',
          bgColor: 'bg-error/20',
          dotColor: 'bg-error',
          icon: 'AlertTriangle',
          defaultLabel: 'Error'
        };
      case 'warning':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/20',
          dotColor: 'bg-warning',
          icon: 'AlertCircle',
          defaultLabel: 'Warning'
        };
      case 'loading':
        return {
          color: 'text-text-secondary',
          bgColor: 'bg-muted',
          dotColor: 'bg-text-secondary',
          icon: 'Loader',
          defaultLabel: 'Loading...'
        };
      default:
        return {
          color: 'text-text-secondary',
          bgColor: 'bg-muted',
          dotColor: 'bg-text-secondary',
          icon: 'Circle',
          defaultLabel: 'Unknown'
        };
    }
  };

  const getSizeConfig = (size) => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-xs',
          icon: 14,
          dot: 'w-2 h-2',
          spacing: 'space-x-1.5'
        };
      case 'lg':
        return {
          container: 'text-base',
          icon: 20,
          dot: 'w-3 h-3',
          spacing: 'space-x-3'
        };
      default:
        return {
          container: 'text-sm',
          icon: 16,
          dot: 'w-2.5 h-2.5',
          spacing: 'space-x-2'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  const displayLabel = label || statusConfig?.defaultLabel;

  return (
    <div className={`flex items-center ${sizeConfig?.spacing} ${sizeConfig?.container} ${className}`}>
      {/* Status Dot */}
      <div className="relative flex items-center justify-center">
        <div 
          className={`
            ${sizeConfig?.dot} rounded-full ${statusConfig?.dotColor}
            ${showPulse ? 'pulse-status' : ''}
          `}
        />
      </div>
      {/* Status Label */}
      {displayLabel && (
        <span className={`font-medium ${statusConfig?.color}`}>
          {displayLabel}
        </span>
      )}
    </div>
  );
};

// Compound component for status with icon
const StatusWithIcon = ({ 
  status = 'connected', 
  label = '', 
  showPulse = false,
  size = 'default',
  className = '' 
}) => {
  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  const displayLabel = label || statusConfig?.defaultLabel;

  return (
    <div className={`flex items-center ${sizeConfig?.spacing} ${sizeConfig?.container} ${className}`}>
      {/* Status Icon */}
      <Icon 
        name={statusConfig?.icon} 
        size={sizeConfig?.icon} 
        className={`
          ${statusConfig?.color}
          ${showPulse ? 'pulse-status' : ''}
          ${status === 'loading' ? 'animate-spin' : ''}
        `}
      />
      {/* Status Label */}
      {displayLabel && (
        <span className={`font-medium ${statusConfig?.color}`}>
          {displayLabel}
        </span>
      )}
    </div>
  );
};

// Helper function for external use
const getStatusConfig = (status) => {
  switch (status) {
    case 'connected':
      return {
        color: 'text-success',
        bgColor: 'bg-success/20',
        dotColor: 'bg-success',
        icon: 'CheckCircle',
        defaultLabel: 'Connected'
      };
    case 'disconnected':
      return {
        color: 'text-error',
        bgColor: 'bg-error/20',
        dotColor: 'bg-error',
        icon: 'XCircle',
        defaultLabel: 'Disconnected'
      };
    case 'error':
      return {
        color: 'text-error',
        bgColor: 'bg-error/20',
        dotColor: 'bg-error',
        icon: 'AlertTriangle',
        defaultLabel: 'Error'
      };
    case 'warning':
      return {
        color: 'text-warning',
        bgColor: 'bg-warning/20',
        dotColor: 'bg-warning',
        icon: 'AlertCircle',
        defaultLabel: 'Warning'
      };
    case 'loading':
      return {
        color: 'text-text-secondary',
        bgColor: 'bg-muted',
        dotColor: 'bg-text-secondary',
        icon: 'Loader',
        defaultLabel: 'Loading...'
      };
    default:
      return {
        color: 'text-text-secondary',
        bgColor: 'bg-muted',
        dotColor: 'bg-text-secondary',
        icon: 'Circle',
        defaultLabel: 'Unknown'
      };
  }
};

const getSizeConfig = (size) => {
  switch (size) {
    case 'sm':
      return {
        container: 'text-xs',
        icon: 14,
        dot: 'w-2 h-2',
        spacing: 'space-x-1.5'
      };
    case 'lg':
      return {
        container: 'text-base',
        icon: 20,
        dot: 'w-3 h-3',
        spacing: 'space-x-3'
      };
    default:
      return {
        container: 'text-sm',
        icon: 16,
        dot: 'w-2.5 h-2.5',
        spacing: 'space-x-2'
      };
  }
};

StatusIndicator.WithIcon = StatusWithIcon;

export default StatusIndicator;