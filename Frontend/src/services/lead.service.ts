import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  CreateLeadPayload,
  Lead,
  Result,
  TrackClickPayload,
} from '@/types';
import { httpClient } from './http-client';

export const leadService = {
  async createLead(payload: CreateLeadPayload): Promise<Result<Lead>> {
    return httpClient.post<Lead>(API_ENDPOINTS.LEADS.BASE, payload, {
      timeoutMs: 5000,
    });
  },

  async trackClick(payload: TrackClickPayload): Promise<Result<Lead>> {
    const endpointUrl = httpClient.getFullUrl(API_ENDPOINTS.LEADS.TRACK_CLICK);

    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      try {
        const jsonBlob = new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        });
        navigator.sendBeacon(endpointUrl, jsonBlob);
        return {
          isSuccess: true,
          message: 'Mikro-dönüşüm kaydedildi.',
          errors: [],
        };
      } catch {
        // Fallback to fetch if sendBeacon fails
      }
    }

    return httpClient.post<Lead>(API_ENDPOINTS.LEADS.TRACK_CLICK, payload, {
      keepalive: true,
      timeoutMs: 2500,
    });
  },

  async getAllLeads(isRead?: boolean): Promise<Lead[]> {
    const res = await httpClient.get<Lead[]>(
      API_ENDPOINTS.LEADS.LIST(isRead),
      { cache: 'no-store', timeoutMs: 5000 }
    );
    return res.isSuccess && res.data ? res.data : [];
  },

  async markAsRead(id: string): Promise<Result> {
    return httpClient.patch(API_ENDPOINTS.LEADS.MARK_AS_READ(id), undefined, {
      timeoutMs: 5000,
    });
  },
};

