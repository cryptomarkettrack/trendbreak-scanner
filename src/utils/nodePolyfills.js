// Browser-compatible polyfills for Node.js modules used by ccxt

// Polyfill for 'net' module
export const net = {
  connect: () => {
    throw new Error('Net module not available in browser. Use WebSocket or fetch instead.');
  },
  Socket: class MockSocket {
    constructor() {
      throw new Error('Net.Socket not available in browser. Use WebSocket instead.');
    }
  },
  isIP: (addr) => {
    // Simple IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv4Regex.test(addr)) return 4;
    if (ipv6Regex.test(addr)) return 6;
    return 0;
  },
  isIPv6: (addr) => {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(addr);
  }
};

// Export individual functions for direct imports
export const connect = net.connect;
export const Socket = net.Socket;
export const isIP = net.isIP;
export const isIPv6 = net.isIPv6;

// Polyfill for 'tls' module
export const tls = {
  connect: () => {
    throw new Error('TLS module not available in browser. Use HTTPS or WSS instead.');
  }
};

// Polyfill for 'dns' module
export const dns = {
  lookup: () => {
    throw new Error('DNS module not available in browser.');
  }
};

// Polyfill for 'zlib' module
export const zlib = {
  inflate: () => {
    throw new Error('Zlib module not available in browser. Use browser-native compression instead.');
  },
  deflate: () => {
    throw new Error('Zlib module not available in browser. Use browser-native compression instead.');
  }
};

// Polyfill for 'protobufjs/minimal'
export const protobuf = {
  minimal: {
    // Minimal protobuf implementation for browser
    Field: class MockField {},
    Message: class MockMessage {},
    BinaryReader: class MockBinaryReader {},
    BinaryWriter: class MockBinaryWriter {}
  }
};

// Default exports for modules
export default {
  net,
  tls,
  dns,
  zlib,
  protobuf,
  connect,
  Socket,
  isIP,
  isIPv6
};

// Make these available globally for ccxt
if (typeof window !== 'undefined') {
  window.net = net;
  window.tls = tls;
  window.dns = dns;
  window.zlib = zlib;
  window.protobuf = protobuf;
  window.connect = connect;
  window.Socket = Socket;
  window.isIP = isIP;
  window.isIPv6 = isIPv6;
}
