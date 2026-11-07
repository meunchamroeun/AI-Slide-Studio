import {
  PresentationDocument,
  GeneratePresentationDto,
  RegenerateSlideDto,
  RewriteContentDto,
  Slide,
} from '@ai-slide-studio/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Response was not JSON
        }
        throw new Error(errorMessage);
      }

      // Check if response is empty
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error: any) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Admin APIs
  async getAdminOverview(): Promise<any> {
    return this.get('/admin/overview');
  }

  async updateServerConfig(payload: { apiKey?: string; modelName?: string }): Promise<any> {
    return this.post('/admin/server-config', payload);
  }

  async testConnection(payload?: { apiKey?: string }): Promise<any> {
    return this.post('/admin/test-connection', payload);
  }

  async getAdminPresentations(): Promise<any> {
    return this.get('/admin/presentations');
  }

  async deleteAdminPresentation(id: string): Promise<any> {
    return this.delete(`/admin/presentations/${id}`);
  }

  // Health
  async getHealth(): Promise<{ status: string; database: string; aiModel: string; liveGeminiConfigured: boolean }> {
    return this.request('/health');
  }

  async checkHealth(): Promise<{ status: string; database: string; aiModel: string; liveGeminiConfigured: boolean }> {
    return this.getHealth();
  }

  // Presentations CRUD
  async getPresentations(): Promise<PresentationDocument[]> {
    return this.request('/presentations');
  }

  async getPresentation(id: string): Promise<PresentationDocument> {
    return this.request(`/presentations/${id}`);
  }

  async createPresentation(document: PresentationDocument): Promise<PresentationDocument> {
    return this.request('/presentations', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updatePresentation(id: string, updateData: Partial<PresentationDocument>): Promise<PresentationDocument> {
    return this.request(`/presentations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deletePresentation(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/presentations/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicatePresentation(id: string): Promise<PresentationDocument> {
    return this.request(`/presentations/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // AI Generation
  async generatePresentation(dto: GeneratePresentationDto): Promise<PresentationDocument> {
    return this.request('/generation/presentations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async regenerateSlide(presentationId: string, slideId: string, dto: RegenerateSlideDto): Promise<Slide> {
    return this.request(`/generation/presentations/${presentationId}/slides/${slideId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async rewriteContent(dto: RewriteContentDto): Promise<{ text: string }> {
    return this.request('/generation/slides/rewrite', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // Exports
  async exportHtml(id: string): Promise<string> {
    const url = `${API_BASE_URL}/presentations/${id}/export/html`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTML export failed with status ${response.status}`);
    }
    return response.text();
  }

  async exportPdf(id: string): Promise<Blob> {
    const url = `${API_BASE_URL}/presentations/${id}/export/pdf`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PDF export failed with status ${response.status}`);
    }
    return response.blob();
  }

  getExportHtmlUrl(id: string): string {
    return `${API_BASE_URL}/presentations/${id}/export/html`;
  }

  getExportPdfUrl(id: string): string {
    return `${API_BASE_URL}/presentations/${id}/export/pdf`;
  }

  getExportJsonUrl(id: string): string {
    return `${API_BASE_URL}/presentations/${id}/export/json`;
  }

  async importJson(jsonContent: string): Promise<PresentationDocument> {
    return this.request('/presentations/import/json', {
      method: 'POST',
      body: JSON.stringify({ json: jsonContent }),
    });
  }
}

export const api = new ApiClient();
