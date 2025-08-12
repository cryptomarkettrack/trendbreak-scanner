import ccxt from 'ccxt';

class CryptoService {
  constructor() {
    this.exchanges = {};
    this.defaultExchange = 'binance';
    this.initializeExchanges();
  }

  initializeExchanges() {
    try {
      // Initialize Binance (default)
      this.exchanges.binance = new ccxt.binance({
        enableRateLimit: true,
      });

      this.exchanges.kraken = new ccxt.kraken({
        enableRateLimit: true,
      });

      console.log('CryptoService initialized with exchanges:', Object.keys(this.exchanges));
    } catch (error) {
      console.error('Error initializing exchanges:', error);
    }
  }

  getExchange(exchangeName = this.defaultExchange) {
    return this.exchanges?.[exchangeName] || this.exchanges?.[this.defaultExchange];
  }

  async getTickers(exchangeName = this.defaultExchange, symbols = null) {
    try {
      const exchange = this.getExchange(exchangeName);
      if (!exchange) throw new Error(`Exchange ${exchangeName} not available`);

      const tickers = await exchange?.fetchTickers(symbols);
      return tickers;
    } catch (error) {
      console.error(`Error fetching tickers from ${exchangeName}:`, error);
      throw error;
    }
  }

  async getOHLCV(symbol, timeframe = '1h', limit = 200, exchangeName = this.defaultExchange) {
    try {
      const exchange = this.getExchange(exchangeName);
      if (!exchange) throw new Error(`Exchange ${exchangeName} not available`);

      const ohlcv = await exchange?.fetchOHLCV(symbol, timeframe, undefined, limit);
      
      return ohlcv?.map(([timestamp, open, high, low, close, volume]) => ({
        time: Math.floor(timestamp / 1000),
        open: parseFloat(open?.toFixed(8)),
        high: parseFloat(high?.toFixed(8)),
        low: parseFloat(low?.toFixed(8)),
        close: parseFloat(close?.toFixed(8)),
        volume: parseFloat(volume?.toFixed(2))
      }));
    } catch (error) {
      console.error(`Error fetching OHLCV data for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarkets(exchangeName = this.defaultExchange) {
    try {
      const exchange = this.getExchange(exchangeName);
      if (!exchange) throw new Error(`Exchange ${exchangeName} not available`);

      const markets = await exchange?.loadMarkets();
      return markets;
    } catch (error) {
      console.error(`Error fetching markets from ${exchangeName}:`, error);
      throw error;
    }
  }

  async getUSDTPairs(exchangeName = this.defaultExchange, limit = 50) {
    try {
      const markets = await this.getMarkets(exchangeName);
      const usdtPairs = Object.keys(markets)
        ?.filter(symbol => symbol?.endsWith('/USDT') && markets?.[symbol]?.active)
        ?.slice(0, limit)
        ?.sort();
      
      return usdtPairs;
    } catch (error) {
      console.error(`Error fetching USDT pairs from ${exchangeName}:`, error);
      return ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'MATIC/USDT']; // fallback
    }
  }

  async getCurrentPrice(symbol, exchangeName = this.defaultExchange) {
    try {
      const exchange = this.getExchange(exchangeName);
      if (!exchange) throw new Error(`Exchange ${exchangeName} not available`);

      const ticker = await exchange?.fetchTicker(symbol);
      return {
        symbol,
        price: ticker?.last,
        change: ticker?.change,
        percentage: ticker?.percentage,
        volume: ticker?.baseVolume,
        timestamp: ticker?.timestamp
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  // Analyze price action for breakout detection using trendline analysis
  async analyzeBreakout(symbol, timeframe = '15m', exchangeName = this.defaultExchange) {
    try {
      const ohlcvData = await this.getOHLCV(symbol, timeframe, 100, exchangeName);
      if (!ohlcvData || ohlcvData?.length < 30) return null;

      const latest = ohlcvData?.[ohlcvData?.length - 1];
      const previous = ohlcvData?.[ohlcvData?.length - 2];

      // Convert OHLCV data to the format expected by detectTrendlines
      const ohlcvFormatted = ohlcvData.map(candle => [
        candle.time,    // timestamp
        candle.open,    // open
        candle.high,    // high
        candle.low,     // low
        candle.close,   // close
        candle.volume   // volume
      ]);

      // Use trendline detection for breakout analysis
      const { trendlines, breakout } = this.detectTrendlines(ohlcvFormatted, 10);
      
      let breakoutType = null;
      let strength = 'weak';
      let trendlineInfo = null;

      // Check for trendline breakouts
      if (breakout.upper || breakout.lower) {
        if (breakout.upper) {
          breakoutType = 'upward';
          // Find the resistance trendline that was broken
          const resistanceLine = trendlines.find(tl => tl.type === 'up');
          if (resistanceLine) {
            trendlineInfo = {
              type: 'resistance',
              startPrice: resistanceLine.y1,
              endPrice: resistanceLine.y2,
              startTime: ohlcvData[resistanceLine.x1]?.time,
              endTime: ohlcvData[resistanceLine.x2]?.time
            };
          }
        }
        
        if (breakout.lower) {
          breakoutType = 'downward';
          // Find the support trendline that was broken
          const supportLine = trendlines.find(tl => tl.type === 'down');
          if (supportLine) {
            trendlineInfo = {
              type: 'support',
              startPrice: supportLine.y1,
              endPrice: supportLine.y2,
              startTime: ohlcvData[supportLine.x1]?.time,
              endTime: ohlcvData[supportLine.x2]?.time
            };
          }
        }

        // Calculate breakout strength based on volume and price movement
        const priceChange = ((latest?.close - previous?.close) / previous?.close) * 100;
        const volumeRatio = latest?.volume / (ohlcvData?.slice(-20)?.reduce((sum, c) => sum + c?.volume, 0) / 20);
        
        if (Math.abs(priceChange) > 3 && volumeRatio > 1.5) {
          strength = 'strong';
        } else if (Math.abs(priceChange) > 1.5 && volumeRatio > 1.2) {
          strength = 'medium';
        } else {
          strength = 'weak';
        }

        return {
          symbol,
          type: breakoutType,
          strength,
          price: latest?.close,
          change: priceChange,
          volume: latest?.volume,
          volumeRatio,
          timestamp: new Date(latest?.time * 1000),
          trendlineInfo,
          trendlinesCount: trendlines.length,
          breakoutDetails: {
            upper: breakout.upper,
            lower: breakout.lower
          }
        };
      }

      // Fallback to traditional breakout detection if no trendline breakouts
      // const recent = ohlcvData?.slice(-20);
      // const highs = recent?.map(candle => candle?.high);
      // const lows = recent?.map(candle => candle?.low);
      // const maxHigh = Math.max(...highs?.slice(0, -1));
      // const minLow = Math.min(...lows?.slice(0, -1));

      // // Upward breakout
      // if (latest?.close > maxHigh) {
      //   breakoutType = 'upward';
      //   const breakoutSize = ((latest?.close - maxHigh) / maxHigh) * 100;
      //   strength = breakoutSize > 2 ? 'strong' : breakoutSize > 1 ? 'medium' : 'weak';
      // }
      // // Downward breakout
      // else if (latest?.close < minLow) {
      //   breakoutType = 'downward';
      //   const breakoutSize = ((minLow - latest?.close) / minLow) * 100;
      //   strength = breakoutSize > 2 ? 'strong' : breakoutSize > 1 ? 'medium' : 'weak';
      // }

      // if (breakoutType) {
      //   return {
      //     symbol,
      //     type: breakoutType,
      //     strength,
      //     price: latest?.close,
      //     change: ((latest?.close - previous?.close) / previous?.close) * 100,
      //     volume: latest?.volume,
      //     timestamp: new Date(latest?.time * 1000),
      //     trendlineInfo: null,
      //     trendlinesCount: trendlines.length,
      //     breakoutDetails: {
      //       upper: false,
      //       lower: false
      //     }
      //   };
      // }

      return null;
    } catch (error) {
      console.error(`Error analyzing breakout for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Detects trendlines from OHLCV data and checks for breakout
   * 
   * @param {Array} ohlcv - Array of candles: [timestamp, open, high, low, close, volume]
   * @param {number} n - Fractal period (same as PineScript input n)
   * @returns {Object} {
   *   trendlines: [{type: 'up'|'down', x1, y1, x2, y2}],
   *   breakout: { upper: boolean, lower: boolean }
   * }
   */
  // detectTrendlines(ohlcv, n = 10) {
  //   const highs = ohlcv.map(c => c[2]);
  //   const lows = ohlcv.map(c => c[3]);
  //   const closes = ohlcv.map(c => c[4]);
  //   const len = ohlcv.length;

  //   let recentUp = [], recentDn = [];
  //   const trendlines = [];

  //   function isPivotHigh(i) {
  //     if (i < n || i >= len - n) return false;
  //     for (let j = 1; j <= n; j++) {
  //       if (highs[i] <= highs[i - j] || highs[i] <= highs[i + j]) return false;
  //     }
  //     return true;
  //   }

  //   function isPivotLow(i) {
  //     if (i < n || i >= len - n) return false;
  //     for (let j = 1; j <= n; j++) {
  //       if (lows[i] >= lows[i - j] || lows[i] >= lows[i + j]) return false;
  //     }
  //     return true;
  //   }

  //   for (let i = 0; i < len; i++) {
  //     if (isPivotHigh(i)) {
  //       recentUp.unshift({ idx: i, price: highs[i] });
  //       if (recentUp.length > 2) recentUp.pop();
  //     }
  //     if (isPivotLow(i)) {
  //       recentDn.unshift({ idx: i, price: lows[i] });
  //       if (recentDn.length > 2) recentDn.pop();
  //     }
  //   }

  //   if (recentUp.length === 2) {
  //     const [u1, u2] = recentUp;
  //     trendlines.push({ type: 'up', x1: u2.idx, y1: u2.price, x2: u1.idx, y2: u1.price });
  //   }

  //   if (recentDn.length === 2) {
  //     const [d1, d2] = recentDn;
  //     trendlines.push({ type: 'down', x1: d2.idx, y1: d2.price, x2: d1.idx, y2: d1.price });
  //   }

  //   const lastIdx = len - 1;
  //   let breakout = { upper: false, lower: false };

  //   function checkCross(line) {
  //     const m = (line.y2 - line.y1) / (line.x2 - line.x1);
  //     const yNow = m * lastIdx + (line.y1 - m * line.x1);
  //     const prev = closes[lastIdx - 1], curr = closes[lastIdx];
  //     return (prev < yNow && curr > yNow) || (prev > yNow && curr < yNow);
  //   }

  //   trendlines.forEach(line => {
  //     if (line.type === 'up' && checkCross(line)) breakout.upper = true;
  //     if (line.type === 'down' && checkCross(line)) breakout.lower = true;
  //   });

  //   return { trendlines, breakout };
  // }
/**
 * Detects trendlines from OHLCV data and checks for breakout
 * Automatically extends trendlines up to the last candle
 * 
 * @param {Array} ohlcv - Array of candles: [timestamp, open, high, low, close, volume]
 * @param {number} n - Fractal period (same as PineScript input n)
 * @returns {Object} {
 *   trendlines: [{type: 'up'|'down', x1, y1, x2, y2}],
 *   breakout: { upper: boolean, lower: boolean }
 * }
 */
detectTrendlines(ohlcv, n = 10) {
  const highs = ohlcv.map(c => c[2]);
  const lows = ohlcv.map(c => c[3]);
  const closes = ohlcv.map(c => c[4]);
  const len = ohlcv.length;

  let recentUp = [], recentDn = [];
  const trendlines = [];

  function isPivotHigh(i) {
    if (i < n || i >= len - n) return false;
    for (let j = 1; j <= n; j++) {
      if (highs[i] <= highs[i - j] || highs[i] <= highs[i + j]) return false;
    }
    return true;
  }

  function isPivotLow(i) {
    if (i < n || i >= len - n) return false;
    for (let j = 1; j <= n; j++) {
      if (lows[i] >= lows[i - j] || lows[i] >= lows[i + j]) return false;
    }
    return true;
  }

  // Collect most recent pivots
  for (let i = 0; i < len; i++) {
    if (isPivotHigh(i)) {
      recentUp.unshift({ idx: i, price: highs[i] });
      if (recentUp.length > 2) recentUp.pop();
    }
    if (isPivotLow(i)) {
      recentDn.unshift({ idx: i, price: lows[i] });
      if (recentDn.length > 2) recentDn.pop();
    }
  }

  // Create trendlines extended to last candle index
  if (recentUp.length === 2) {
    const [u1, u2] = recentUp;
    const slope = (u1.price - u2.price) / (u1.idx - u2.idx);
    const extendedX2 = len - 1; // extend to last candle
    const extendedY2 = u1.price + slope * (extendedX2 - u1.idx);
    trendlines.push({
      type: 'up',
      x1: u2.idx,
      y1: u2.price,
      x2: extendedX2,
      y2: extendedY2
    });
  }

  if (recentDn.length === 2) {
    const [d1, d2] = recentDn;
    const slope = (d1.price - d2.price) / (d1.idx - d2.idx);
    const extendedX2 = len - 1; // extend to last candle
    const extendedY2 = d1.price + slope * (extendedX2 - d1.idx);
    trendlines.push({
      type: 'down',
      x1: d2.idx,
      y1: d2.price,
      x2: extendedX2,
      y2: extendedY2
    });
  }

  // Breakout detection
  const lastIdx = len - 1;
  let breakout = { upper: false, lower: false };

  function checkCross(line) {
    // const m = (line.y2 - line.y1) / (line.x2 - line.x1);
    // const yNow = m * lastIdx + (line.y1 - m * line.x1);
    // const prev = closes[lastIdx - 1], curr = closes[lastIdx];
    // console.log('line', line);
    // console.log('m', m);
    // console.log('yNow', yNow);
    // console.log('prev', prev);
    
    // return (prev < yNow && curr > yNow) || (prev > yNow && curr < yNow);

    //philip
    const currentLow = lows[lastIdx];
    const currentHigh = highs[lastIdx];
    const lineY = line.y2;
    // console.log('currentLow', currentLow);
    // console.log('currentHigh', currentHigh);
    // console.log('lineY', lineY);

    return currentLow < lineY && currentHigh > lineY;
  }

  trendlines.forEach(line => {
    const crossed = checkCross(line);

    if (line.type === 'up' && crossed) breakout.upper = true;
    if (line.type === 'down' && crossed) breakout.lower = true;
  });

  return { trendlines, breakout };
}


  // Generate fractals from OHLCV data
  generateFractals(ohlcvData, period = 5) {
    try {
      if (!ohlcvData || ohlcvData?.length === 0) return [];
      
      const fractals = [];
      
      for (let i = period; i < ohlcvData?.length - period; i++) {
        const current = ohlcvData?.[i];
        if (!current) continue;
        
        let isHighFractal = true;
        let isLowFractal = true;
        
        // Check if current point is a fractal high
        for (let j = i - period; j <= i + period; j++) {
          if (j !== i && ohlcvData?.[j]?.high >= current?.high) {
            isHighFractal = false;
            break;
          }
        }
        
        // Check if current point is a fractal low
        for (let j = i - period; j <= i + period; j++) {
          if (j !== i && ohlcvData?.[j]?.low <= current?.low) {
            isLowFractal = false;
            break;
          }
        }
        
        if (isHighFractal) {
          fractals?.push({
            time: current?.time,
            position: 'aboveBar',
            color: '#F59E0B',
            shape: 'circle',
            text: 'HH',
            size: 1,
          });
        }
        
        if (isLowFractal) {
          fractals?.push({
            time: current?.time,
            position: 'belowBar',
            color: '#8B5CF6',
            shape: 'circle',
            text: 'LL',
            size: 1,
          });
        }
      }
      
      return fractals;
    } catch (error) {
      console.error('Error generating fractals:', error);
      return [];
    }
  }

  // Check exchange connection status
  async checkConnection(exchangeName = this.defaultExchange) {
    try {
      const exchange = this.getExchange(exchangeName);
      if (!exchange) return { status: 'error', message: 'Exchange not available' };

      const startTime = Date.now();
      await exchange?.fetchTicker('BTC/USDT');
      const latency = Date.now() - startTime;

      return {
        status: 'connected',
        latency,
        exchange: exchangeName
      };
    } catch (error) {
      return {
        status: 'error',
        message: error?.message,
        exchange: exchangeName
      };
    }
  }
}

// Create singleton instance
const cryptoService = new CryptoService();

export default cryptoService;