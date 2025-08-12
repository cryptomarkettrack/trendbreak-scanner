import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import DashboardOverview from './pages/dashboard-overview';
import ChartAnalysisViewer from './pages/chart-analysis-viewer';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<ChartAnalysisViewer />} />
        <Route path="/dashboard-overview" element={<DashboardOverview />} />
        <Route path="/chart-analysis-viewer" element={<ChartAnalysisViewer />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
