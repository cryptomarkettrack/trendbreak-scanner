import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import Icon from "../../../components/AppIcon";
import cryptoService from "../../../utils/cryptoService";

// Constants
const CHART_CONFIG = {
  height: 500,
  minHeight: 400,
  updateInterval: 5000, // 5 seconds,
  dataPoints: 500,
};

// Custom hook for chart data management
const useChartData = (selectedPair, timeframe, exchange) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const generateFallbackData = (symbol) => {
    const basePrice = symbol?.includes("BTC")
      ? CHART_CONFIG.basePrices.BTC
      : symbol?.includes("ETH")
      ? CHART_CONFIG.basePrices.ETH
      : symbol?.includes("ADA")
      ? CHART_CONFIG.basePrices.ADA
      : CHART_CONFIG.basePrices.default;

    const data = [];
    const now = new Date();
    const timeframeMs =
      CHART_CONFIG.timeframeMs[timeframe] || CHART_CONFIG.timeframeMs["1h"];

    for (let i = CHART_CONFIG.dataPoints; i >= 0; i--) {
      const time = Math.floor((now?.getTime() - i * timeframeMs) / 1000);
      const volatility = 0.02;
      const trend = Math.sin(i * 0.1) * 0.01;

      const open = basePrice * (1 + trend + (Math.random() - 0.5) * volatility);
      const close = open * (1 + (Math.random() - 0.5) * volatility);
      const high =
        Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low =
        Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

      data.push({
        time,
        open, // no rounding
        high, // no rounding
        low, // no rounding
        close, // no rounding
      });
    }
    return data;
  };

  const fetchRealData = async (symbol, tf) => {
    try {
      setIsLoading(true);
      setChartError(null);

      const ohlcvData = await cryptoService?.getOHLCV(
        symbol,
        tf,
        CHART_CONFIG.dataPoints,
        exchange
      );

      if (ohlcvData?.length > 0) {
        setRealTimeData(ohlcvData);
        setConnectionStatus("connected");
        return ohlcvData;
      } else {
        throw new Error("No data received from exchange");
      }
    } catch (error) {
      console.error("Error fetching real data:", error);
      setChartError(`Failed to fetch data: ${error?.message}`);
      setConnectionStatus("error");

      return generateFallbackData(symbol);
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => {
    setChartError(null);
    setConnectionStatus("connecting");
  };

  return {
    isLoading,
    chartError,
    realTimeData,
    connectionStatus,
    fetchRealData,
    resetError,
  };
};

// Custom hook for chart management
const useChart = (
  containerRef,
  selectedPair,
  timeframe,
  showFractals,
  showTrendlines,
  trendlineColor
) => {
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const volumeSeriesRef = useRef(); // <-- Add ref for volume series
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const createChartInstance = (container) => {
    return createChart(container, {
      width: container?.clientWidth,
      height: CHART_CONFIG.height,
      layout: {
        background: { color: "#0F172A" },
        textColor: "#F8FAFC",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.1)" },
        horzLines: { color: "rgba(148, 163, 184, 0.1)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#00D4AA",
          width: 1,
          style: 2,
        },
        horzLine: {
          color: "#00D4AA",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
        textColor: "#94A3B8",
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
        textColor: "#94A3B8",
        timeVisible: true,
        secondsVisible: false,
      },
    });
  };

  const createCandlestickSeries = (chart) => {
    return chart?.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderDownColor: "#EF4444",
      borderUpColor: "#10B981",
      wickDownColor: "#EF4444",
      wickUpColor: "#10B981",
      priceFormat: {
        type: "price",
        precision: 4, // Number of digits after decimal
        minMove: 0.0001, // Smallest price step
      },
    });
  };

  const createVolumeSeries = (chart) => {
    return chart?.addHistogramSeries({
      color: "#94A3B8",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
  };

  const addFractals = (candlestickSeries, ohlcvData) => {
    if (!showFractals || !candlestickSeries || !ohlcvData?.length) return;

    const fractals = cryptoService?.generateFractals(ohlcvData);
    if (fractals?.length > 0) {
      candlestickSeries?.setMarkers(fractals);
    }
  };

  const addTrendlines = (chart, ohlcvData) => {
    if (
      !showTrendlines ||
      !chart ||
      !ohlcvData?.length ||
      ohlcvData.length <= 20
    )
      return;

    // Convert OHLCV data to the format expected by detectTrendlines function
    const ohlcvFormatted = ohlcvData.map((candle) => [
      candle.time, // timestamp
      candle.open, // open
      candle.high, // high
      candle.low, // low
      candle.close, // close
      0, // volume (not used in trendline detection)
    ]);

    try {
      // Detect trendlines using the algorithm
      const { trendlines, breakout } = cryptoService.detectTrendlines(
        ohlcvFormatted,
        10
      );

      if (trendlines && trendlines.length > 0) {
        trendlines.forEach((trendline, index) => {
          try {
            // Map the detected trendline to chart coordinates
            const x1 = trendline.x1;
            const x2 = trendline.x2;

            // Get the actual time and price values from the OHLCV data
            const time1 = ohlcvData[x1]?.time;
            const time2 = ohlcvData[x2]?.time;
            const price1 = trendline.y1;
            const price2 = trendline.y2;

            if (time1 && time2 && price1 && price2) {
              const lineSeries = chart?.addLineSeries({
                color: trendline.type === "up" ? "#EF4444" : trendlineColor,
                lineWidth: 2,
                lineStyle: trendline.type === "up" ? 1 : 0, // Dashed for resistance, solid for support
                priceLineVisible: false,
                lastValueVisible: false,
              });

              lineSeries?.setData([
                { time: time1, value: price1 },
                { time: time2, value: price2 },
              ]);
            }
          } catch (error) {
            console.error(`Error adding trendline ${index}:`, error);
          }
        });

        // Log breakout detection if any
        if (breakout.upper || breakout.lower) {
          console.log("Trendline breakout detected:", breakout);
        }
      }
    } catch (error) {
      console.error("Error detecting trendlines:", error);
    }
  };

  const cleanup = () => {
    if (chartRef?.current) {
      try {
        chartRef?.current?.remove();
      } catch (error) {
        console.error("Error cleaning up chart:", error);
      }
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null; // <-- cleanup volume series
    }
  };

  // data: [{ time: <number|string|BusinessDay>, close: <number> }, ...]
  // period: integer > 0
  const calculateEMA = (data, period) => {
    if (!Array.isArray(data) || data.length < period || period <= 0) return [];

    // Ensure numbers & compute initial SMA (seed)
    let sum = 0;
    for (let i = 0; i < period; i++) {
      const v = Number(data[i]?.close);
      if (!Number.isFinite(v)) return [];
      sum += v;
    }
    let emaPrev = sum / period; // seed at index period-1
    const k = 2 / (period + 1);

    const out = [];
    // push the seed aligned to the last candle of the seed window
    out.push({ time: data[period - 1].time, value: emaPrev });

    // continue EMA from index = period
    for (let i = period; i < data.length; i++) {
      const price = Number(data[i].close);
      emaPrev = (price - emaPrev) * k + emaPrev;
      out.push({ time: data[i].time, value: emaPrev });
    }

    return out;
  };

  const initializeChart = async (ohlcvData) => {
    if (!containerRef?.current) return;

    try {
      cleanup();

      const chart = createChartInstance(containerRef.current);
      const candlestickSeries = createCandlestickSeries(chart);
      const volumeSeries = createVolumeSeries(chart); // <-- create volume series

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      volumeSeriesRef.current = volumeSeries;

      if (ohlcvData?.length > 0) {
        candlestickSeries?.setData(ohlcvData);

        // --- Volume Visualization ---
        // Map OHLCV to volume data for histogram
        const volumeData = ohlcvData.map((bar) => ({
          time: bar.time,
          value: bar.volume ?? 0, // fallback to 0 if volume missing
          color: bar.close > bar.open ? "#10B981" : "#EF4444",
        }));
        volumeSeries?.setData(volumeData);
        // --- End Volume Visualization ---

        addFractals(candlestickSeries, ohlcvData);
        addTrendlines(chart, ohlcvData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error initializing chart:", error);
      throw error;
    }
  };

  const handleResize = () => {
    try {
      if (containerRef?.current && chartRef?.current) {
        chartRef?.current?.applyOptions({
          width: containerRef?.current?.clientWidth,
        });
      }
    } catch (error) {
      console.error("Error resizing chart:", error);
    }
  };

  return {
    chartRef,
    candlestickSeriesRef,
    volumeSeriesRef,
    lastUpdate,
    initializeChart,
    cleanup,
    handleResize,
    addFractals, // <-- expose addFractals
    addTrendlines, // <-- expose addTrendlines (optional, for consistency),
    setLastUpdate,
    calculateEMA,
  };
};

// Custom hook for real-time updates
const useRealTimeUpdates = (
  candlestickSeriesRef,
  connectionStatus,
  selectedPair,
  timeframe,
  exchange,
  onBreakoutDetected
) => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (candlestickSeriesRef?.current && connectionStatus === "connected") {
          const currentPrice = await cryptoService?.getCurrentPrice(
            selectedPair,
            exchange
          );

          if (currentPrice?.price) {
            const breakout = await cryptoService?.analyzeBreakout(
              selectedPair,
              timeframe,
              exchange
            );
            if (breakout) {
              onBreakoutDetected({
                pair: breakout?.symbol,
                type: breakout?.type,
                price: breakout?.price,
                strength: breakout?.strength,
                timestamp: breakout?.timestamp,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error in real-time update:", error);
      }
    }, CHART_CONFIG.updateInterval);

    return () => clearInterval(interval);
  }, [
    selectedPair,
    timeframe,
    exchange,
    onBreakoutDetected,
    connectionStatus,
    candlestickSeriesRef,
  ]);
};

// Connection status configuration
const getConnectionStatusConfig = (status) => {
  const configs = {
    connected: { color: "text-success", bg: "bg-success/20", label: "Live" },
    connecting: {
      color: "text-warning",
      bg: "bg-warning/20",
      label: "Connecting",
    },
    warning: { color: "text-warning", bg: "bg-warning/20", label: "Delayed" },
    error: { color: "text-error", bg: "bg-error/20", label: "Offline" },
  };

  return (
    configs[status] || {
      color: "text-text-secondary",
      bg: "bg-text-secondary/20",
      label: "Unknown",
    }
  );
};

// Chart Header Component
const ChartHeader = ({
  selectedPair,
  timeframe,
  lastUpdate,
  connectionStatus,
  onExport,
  isLoading,
  chartError,
}) => {
  const statusConfig = getConnectionStatusConfig(connectionStatus);

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center space-x-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {selectedPair} - {timeframe}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Clock" size={14} />
          <span>Last update: {lastUpdate?.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onExport}
          disabled={isLoading || chartError}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="Download" size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div
          className={`flex items-center space-x-1 px-2 py-1 ${statusConfig?.bg} ${statusConfig?.color} rounded-md`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-success pulse-status"
                : connectionStatus === "connecting"
                ? "bg-warning animate-pulse"
                : connectionStatus === "warning"
                ? "bg-warning"
                : "bg-error"
            }`}
          />
          <span className="text-xs font-medium">{statusConfig?.label}</span>
        </div>
      </div>
    </div>
  );
};

// Chart Footer Component
const ChartFooter = ({
  showFractals,
  showTrendlines,
  connectionStatus,
  exchange,
}) => (
  <div className="flex items-center justify-between p-3 bg-muted/50 text-xs text-text-secondary">
    <div className="flex items-center space-x-4">
      <span>Fractals: {showFractals ? "ON" : "OFF"}</span>
      <span>Trendlines: {showTrendlines ? "ON" : "OFF"}</span>
      <span>Data Source: CCXT</span>
    </div>
    <div className="flex items-center space-x-2">
      <Icon name="Info" size={12} />
      <span>
        Drag to pan • Scroll to zoom • Live data via{" "}
        {connectionStatus === "connected" ? exchange : "Exchange API"}
      </span>
    </div>
  </div>
);

// Main ChartContainer Component
const ChartContainer = ({
  selectedPair = "BTC/USDT",
  timeframe = "1h",
  exchange = "binance",
  showFractals = true,
  showTrendlines = true,
  trendlineColor = "#00D4AA",
  onBreakoutDetected = () => {},
  className = "",
}) => {
  const chartContainerRef = useRef();

  const {
    isLoading,
    chartError,
    realTimeData,
    connectionStatus,
    fetchRealData,
    resetError,
  } = useChartData(selectedPair, timeframe, exchange);

  // Add auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);
  // Add volume display state
  const [showVolume, setShowVolume] = useState(false);
  // Add volume display state
  const [showEma, setShowEma] = useState(false);

  // Custom hook for chart management
  const {
    chartRef,
    candlestickSeriesRef,
    volumeSeriesRef,
    lastUpdate,
    initializeChart,
    cleanup,
    handleResize,
    addFractals, // <-- get addFractals from hook
    addTrendlines, // <-- get addTrendlines from hook,
    setLastUpdate,
    calculateEMA,
  } = useChart(
    chartContainerRef,
    selectedPair,
    timeframe,
    showFractals,
    showTrendlines,
    trendlineColor
  );

  // Utility to determine price precision based on pair or OHLCV data
  const getPricePrecision = (selectedPair, ohlcvData) => {
    // If OHLCV data is available, use the lowest non-zero price difference to estimate precision
    if (ohlcvData?.length > 1) {
      const prices = ohlcvData.map((d) => d.close).filter(Boolean);
      let minDiff = Number.MAX_VALUE;
      for (let i = 1; i < prices.length; i++) {
        const diff = Math.abs(prices[i] - prices[i - 1]);
        if (diff > 0 && diff < minDiff) minDiff = diff;
      }
      if (minDiff < 1) {
        // Count decimals
        const decimals = minDiff.toString().split(".")[1]?.length || 2;
        return Math.min(Math.max(decimals, 2), 8);
      }
    }
    // Fallback: use pair heuristics
    if (selectedPair?.includes("USDT")) return 4;
    if (selectedPair?.includes("BTC")) return 2;
    if (selectedPair?.includes("ETH")) return 3;
    return 4;
  };

  // Patch initializeChart to conditionally show volume and set dynamic precision
  const initializeChartWithVolumeToggle = async (ohlcvData) => {
    if (!chartContainerRef?.current) return;
    try {
      cleanup();
      // --- Dynamic precision ---
      const pricePrecision = getPricePrecision(selectedPair, ohlcvData);

      const chart = (chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef?.current?.clientWidth,
        height: CHART_CONFIG.height,
        layout: { background: { color: "#0F172A" }, textColor: "#F8FAFC" },
        grid: {
          vertLines: { color: "rgba(148, 163, 184, 0.1)" },
          horzLines: { color: "rgba(148, 163, 184, 0.1)" },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: "#00D4AA", width: 1, style: 2 },
          horzLine: { color: "#00D4AA", width: 1, style: 2 },
        },
        rightPriceScale: {
          borderColor: "rgba(148, 163, 184, 0.2)",
          textColor: "#94A3B8",
        },
        timeScale: {
          borderColor: "rgba(148, 163, 184, 0.2)",
          textColor: "#94A3B8",
          timeVisible: true,
          secondsVisible: false,
        },
      }));
      const candlestickSeries = (candlestickSeriesRef.current =
        chart.addCandlestickSeries({
          upColor: "#10B981",
          downColor: "#EF4444",
          borderDownColor: "#EF4444",
          borderUpColor: "#10B981",
          wickDownColor: "#EF4444",
          wickUpColor: "#10B981",
          priceFormat: {
            type: "price",
            precision: pricePrecision,
            minMove: Math.pow(10, -pricePrecision),
          },
        }));

      if (ohlcvData?.length > 0) {
        candlestickSeries.setData(ohlcvData);

        // --- Volume Visualization ---
        if (showVolume) {
          const volumeSeries = (volumeSeriesRef.current =
            chart.addHistogramSeries({
              color: "#94A3B8",
              priceFormat: { type: "volume" },
              priceScaleId: "volume",
              scaleMargins: { top: 0.8, bottom: 0 },
            }));
          const volumeData = ohlcvData.map((bar) => ({
            time: bar.time,
            value: bar.volume ?? 0,
            color: bar.close > bar.open ? "#10B981" : "#EF4444",
          }));
          volumeSeries.setData(volumeData);
        }
        // --- End Volume Visualization ---

        addFractals(candlestickSeries, ohlcvData);
        addTrendlines(chart, ohlcvData);

        // --- EMA Visualization ---
        if (showEma) {
          const emaConfigs = [
            { period: 50, color: "#F59E42", title: "EMA50" },
            { period: 100, color: "#3B82F6", title: "EMA100" },
            { period: 200, color: "#A855F7", title: "EMA200" },
          ];
          emaConfigs.forEach((cfg) => {
            const emaData = calculateEMA(ohlcvData, cfg.period);
            if (emaData.length > 0) {
              const emaSeries = chart.addLineSeries({
                color: cfg.color,
                lineWidth: 2,
                title: cfg.title,
                priceLineVisible: false,
                lastValueVisible: false,
              });
              emaSeries.setData(emaData);
            }
          });
        }

        // --- End EMA Visualization ---
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error initializing chart:", error);
      throw error;
    }
  };

  // Initialize chart
  useEffect(() => {
    const setupChart = async () => {
      try {
        const ohlcvData = await fetchRealData(selectedPair, timeframe);
        await initializeChartWithVolumeToggle(ohlcvData);
      } catch (error) {
        console.error("Error setting up chart:", error);
      }
    };

    //initial fetch
    setupChart();

    //scheduled fetch (only if autoRefresh is true)
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setupChart();
      }, 5000);
    }

    // Handle resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cleanup();
      if (interval) clearInterval(interval);
    };
  }, [
    selectedPair,
    timeframe,
    exchange,
    showFractals,
    showTrendlines,
    trendlineColor,
    autoRefresh,
    showVolume,
    showEma,
  ]);

  const handleExportChart = () => {
    try {
      if (chartRef?.current) {
        // Take screenshot from lightweight-charts
        const screenshot = chartRef.current.takeScreenshot(); // Returns HTMLCanvasElement

        // Convert to PNG Base64
        const dataUrl = screenshot.toDataURL("image/png");

        // Create download link
        const link = document.createElement("a");
        link.download = `${selectedPair?.replace(
          "/",
          "-"
        )}-${timeframe}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        console.warn("Chart reference is missing.");
      }
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
  };

  const handleRetry = () => {
    resetError();
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}
    >
      <ChartHeader
        selectedPair={selectedPair}
        timeframe={timeframe}
        lastUpdate={lastUpdate}
        connectionStatus={connectionStatus}
        onExport={handleExportChart}
        isLoading={isLoading}
        chartError={chartError}
      />

      {/* Add auto-refresh and volume display checkboxes */}
      <div className="flex items-center px-4 py-2 space-x-6">
        <label className="flex items-center space-x-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="form-checkbox accent-primary"
          />
          <span>Auto Refresh</span>
        </label>
        <label className="flex items-center space-x-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={showVolume}
            onChange={(e) => setShowVolume(e.target.checked)}
            className="form-checkbox accent-primary"
          />
          <span>Show Volume</span>
        </label>
        <label className="flex items-center space-x-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={showEma}
            onChange={(e) => setShowEma(e.target.checked)}
            className="form-checkbox accent-primary"
          />
          <span>Show EMA</span>
        </label>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex items-center space-x-3">
              <Icon
                name="Loader"
                size={20}
                className="animate-spin text-primary"
              />
              <span className="text-sm text-text-secondary">
                Loading real-time data...
              </span>
            </div>
          </div>
        )}

        {chartError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-4">
              <Icon
                name="AlertTriangle"
                size={48}
                className="text-error mx-auto"
              />
              <div>
                <h4 className="text-lg font-semibold text-text-primary">
                  Connection Error
                </h4>
                <p className="text-sm text-text-secondary mt-1">{chartError}</p>
                <p className="text-xs text-text-secondary mt-2">
                  Retrying with fallback data...
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        <div
          ref={chartContainerRef}
          className="w-full h-[500px] bg-background"
          style={{ minHeight: CHART_CONFIG.minHeight }}
        />
      </div>

      <ChartFooter
        showFractals={showFractals}
        showTrendlines={showTrendlines}
        connectionStatus={connectionStatus}
        exchange={exchange}
      />
    </div>
  );
};

export default ChartContainer;
