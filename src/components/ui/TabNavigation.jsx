import React from 'react';
import Icon from '../AppIcon';
import { useNavigate } from 'react-router-dom';

const TabNavigation = ({ 
  activeTab = 'scanner', 
  onTabChange = () => {},
  className = '' 
}) => {
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'scanner',
      label: 'Market Scanner',
      path: '/dashboard-overview',
      icon: 'Radar',
      description: 'Real-time breakout monitoring'
    },
    {
      id: 'analysis',
      label: 'Chart Analysis',
      path: '/chart-analysis-viewer',
      icon: 'BarChart3',
      description: 'Interactive chart analysis'
    }
  ];

  const handleTabClick = (tabId, path) => {
    onTabChange(tabId, path);
    navigate(path);
  };

  const handleKeyDown = (event, tabId, path) => {
    if (event?.key === 'Enter' || event?.key === ' ') {
      event?.preventDefault();
      handleTabClick(tabId, path);
    }
    
    // Arrow key navigation
    if (event?.key === 'ArrowLeft' || event?.key === 'ArrowRight') {
      event?.preventDefault();
      const currentIndex = tabs?.findIndex(tab => tab?.id === activeTab);
      const nextIndex = event?.key === 'ArrowRight' 
        ? (currentIndex + 1) % tabs?.length
        : (currentIndex - 1 + tabs?.length) % tabs?.length;
      
      const nextTab = tabs?.[nextIndex];
      handleTabClick(nextTab?.id, nextTab?.path);
      
      // Focus the next tab
      const nextTabElement = document.querySelector(`[data-tab-id="${nextTab?.id}"]`);
      if (nextTabElement) {
        nextTabElement?.focus();
      }
    }
  };

  return (
    <nav 
      className={`sticky top-16 z-100 bg-background border-b border-border ${className}`}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center px-6">
        {tabs?.map((tab, index) => {
          const isActive = activeTab === tab?.id;
          
          return (
            <button
              key={tab?.id}
              data-tab-id={tab?.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab?.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`
                relative flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-all duration-200 ease-smooth
                min-h-[48px] border-b-2 hover-scale
                ${isActive 
                  ? 'text-primary border-primary bg-primary/5' :'text-text-secondary border-transparent hover:text-text-primary hover:border-border'
                }
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
              `}
              onClick={() => handleTabClick(tab?.id, tab?.path)}
              onKeyDown={(e) => handleKeyDown(e, tab?.id, tab?.path)}
              title={tab?.description}
            >
              <Icon 
                name={tab?.icon} 
                size={18} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-current'
                }`}
              />
              <span className="hidden sm:inline">{tab?.label}</span>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
      {/* Mobile bottom navigation - hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-1000 bg-background border-t border-border safe-area-bottom md:hidden">
        <div className="flex">
          {tabs?.map((tab) => {
            const isActive = activeTab === tab?.id;
            
            return (
              <button
                key={`mobile-${tab?.id}`}
                role="tab"
                aria-selected={isActive}
                className={`
                  flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-primary bg-primary/10' :'text-text-secondary hover:text-text-primary'
                  }
                `}
                onClick={() => handleTabClick(tab?.id, tab?.path)}
              >
                <Icon 
                  name={tab?.icon} 
                  size={20} 
                  className={`mb-1 ${isActive ? 'text-primary' : 'text-current'}`}
                />
                <span className="leading-none">{tab?.label?.split(' ')?.[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;