
import { InstagramAccount } from '../types';

/**
 * Aggressively cleans the backend URL to ensure it's just the root origin.
 */
const normalizeBaseUrl = (url: string): string => {
  if (!url) return '';
  let normalized = url.trim();
  normalized = normalized.replace(/\/+$/, '');
  normalized = normalized.replace(/\/v1\/(register|verify|health|status|config)\/?$/i, '');
  return normalized;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
});

export const testNodeConnection = async (backendUrl: string) => {
  try {
    const baseUrl = normalizeBaseUrl(backendUrl);
    const start = Date.now();
    const response = await fetch(`${baseUrl}/v1/health`, {
      method: 'GET',
      headers: getHeaders()
    });
    const duration = Date.now() - start;
    
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    return { 
        status: 'online', 
        latency: duration, 
        version: data.version || 'unknown',
        proxy: data.proxy,
        maskedIp: data.maskedIp
    };
  } catch (err: any) {
    return { status: 'offline', error: err.message };
  }
};

export const updateNodeConfig = async (backendUrl: string, config: { proxyUrl?: string }) => {
    const baseUrl = normalizeBaseUrl(backendUrl);
    const response = await fetch(`${baseUrl}/v1/config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return await response.json();
};

export const initiateRegistration = async (email: string, pass: string, backendUrl: string) => {
  const baseUrl = normalizeBaseUrl(backendUrl);
  if (!baseUrl) throw new Error("No Backend Node Linked.");

  const response = await fetch(`${baseUrl}/v1/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password: pass })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP Error ${response.status}`);
  }

  return data;
};

export const verifyOtp = async (email: string, otp: string, backendUrl: string) => {
  const baseUrl = normalizeBaseUrl(backendUrl);
  const response = await fetch(`${baseUrl}/v1/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json();
  if (!response.ok) {
     throw new Error(data.message || `Verification failed: ${response.status}`);
  }

  return data;
};
