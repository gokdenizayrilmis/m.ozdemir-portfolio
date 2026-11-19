import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Result } from '@/types';
import { httpClient } from './http-client';

export const mediaService = {
  async uploadImage(
    file: File,
    folder: string = 'general'
  ): Promise<Result<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<string>(
      API_ENDPOINTS.MEDIA.UPLOAD(folder),
      formData,
      { timeoutMs: 15000 }
    );
  },
};
