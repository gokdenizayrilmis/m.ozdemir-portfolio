import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  Lead,
  LeadRangeFilter,
  LeadsSummary,
  PagedLeadsResponse,
  Result,
  TrackClickPayload,
} from '@/types';
import { httpClient } from './http-client';

export const leadService = {
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

  async getSummary(range: LeadRangeFilter = '30d'): Promise<LeadsSummary> {
    const res = await httpClient.get<LeadsSummary>(
      API_ENDPOINTS.LEADS.SUMMARY(range),
      { cache: 'no-store', timeoutMs: 5000 }
    );
    return (
      res.data || {
        totalClicks: 0,
        whatsAppClicks: 0,
        phoneClicks: 0,
        byCampaign: [],
        byPage: [],
        dailyTrend: [],
        previousPeriod: null,
      }
    );
  },

  async getPagedLeads(params: {
    range?: LeadRangeFilter;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedLeadsResponse> {
    const res = await httpClient.get<PagedLeadsResponse>(
      API_ENDPOINTS.LEADS.LIST(params),
      { cache: 'no-store', timeoutMs: 5000 }
    );
    return (
      res.data || {
        items: [],
        totalCount: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 25,
      }
    );
  },

  async downloadCsv(range: LeadRangeFilter = 'all', type?: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const endpoint = API_ENDPOINTS.LEADS.EXPORT(range, type);
    const url = httpClient.getFullUrl(endpoint);
    let token = httpClient.getAccessToken();

    let res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      token = await httpClient.tryRefreshAccessToken();
      if (!token) return false;
      res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (!res.ok) return false;

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `donusum-raporu-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    return true;
  },
};
