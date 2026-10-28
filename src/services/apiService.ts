/**
 * API Service for Micro Cold Chain Supply Logistics
 * Connects React frontend to the Express + MongoDB backend.
 */
import type { MarketPriceItem, AiPredictionItem } from '../types';

// In development, default to port 5001 if not set in Vite env
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: {
    message: string;
    statusCode?: number;
  };
  [key: string]: any;
}

export interface DatabaseStats {
  success: boolean;
  collections: {
    farmers: number;
    produce: number;
    coldStorages: number;
    transportVehicles: number;
    bookings: number;
    iotReadings: number;
    marketPrices: number;
    aiPredictions: number;
  };
  totalRecords: number;
  timestamp: string;
}

export interface ApiHealth {
  api: 'ok' | 'degraded';
  database: string | { status: string; connected: boolean; name: string; host: string };
  status: 'healthy' | 'degraded';
  details?: {
    connected: boolean;
    name: string;
    host: string;
  };
  timestamp: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || `Request failed with status ${res.status}`,
          statusCode: res.status,
        },
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        message: err.message || 'Network error: could not connect to backend server.',
        statusCode: 0,
      },
    };
  }
}

// System Health & Stats
export const checkApiHealth = async (): Promise<ApiResponse<ApiHealth>> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    return {
      success: false,
      error: { message: err.message || 'Cannot connect to backend server.' },
    };
  }
};

export const getDatabaseStats = async (): Promise<DatabaseStats | null> => {
  const res = await request<DatabaseStats>('/stats');
  if (res.success && res.collections) {
    return res as unknown as DatabaseStats;
  }
  return null;
};

// Farmers
export const getFarmers = () => request<any[]>('/farmers');
export const getFarmerById = (id: string) => request<any>(`/farmers/${id}`);
export const createFarmer = (data: any) =>
  request<any>('/farmers', { method: 'POST', body: JSON.stringify(data) });
export const updateFarmer = (id: string, data: any) =>
  request<any>(`/farmers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Produce
export const getProduce = (params?: { farmerId?: string; cropName?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<any[]>(`/produce${query ? `?${query}` : ''}`);
};
export const getProduceById = (id: string) => request<any>(`/produce/${id}`);
export const createProduce = (data: any) =>
  request<any>('/produce', { method: 'POST', body: JSON.stringify(data) });

// Cold Storages
export const getColdStorages = (params?: { crop?: string; district?: string; availableOnly?: boolean }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<any[]>(`/storages${query ? `?${query}` : ''}`);
};
export const getColdStorageById = (id: string) => request<any>(`/storages/${id}`);

// Transport Vehicles
export const getTransportVehicles = (params?: { status?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<any[]>(`/vehicles${query ? `?${query}` : ''}`);
};

// Bookings
export const getBookings = (params?: { farmerId?: string; storageId?: string; status?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<any[]>(`/bookings${query ? `?${query}` : ''}`);
};
export const createBooking = (data: any) =>
  request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const updateBookingStatus = (id: string, status: string) =>
  request<any>(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// IoT Readings
export const getIoTReadings = (limit = 100) => request<any[]>(`/iot/readings?limit=${limit}`);
export const getIoTReadingsByStorage = (storageId: string, limit = 50) =>
  request<any[]>(`/iot/readings/${storageId}?limit=${limit}`);
export const recordIoTReading = (data: any) =>
  request<any>('/iot/readings', { method: 'POST', body: JSON.stringify(data) });

// Market Prices (Simulated)
export const getMarketPrices = (params?: { cropName?: string; district?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<MarketPriceItem[]>(`/market-prices${query ? `?${query}` : ''}`);
};

// AI Predictions (Simulated)
export const getAiPredictions = (params?: { produceId?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return request<AiPredictionItem[]>(`/ai-predictions${query ? `?${query}` : ''}`);
};
export const recordAiPrediction = (data: Partial<AiPredictionItem>) =>
  request<AiPredictionItem>('/ai-predictions', { method: 'POST', body: JSON.stringify(data) });

