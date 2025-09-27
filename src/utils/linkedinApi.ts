import { LinkedInConnection, ConnectionsResponse, CompanyInfo } from '../types/linkedin';
import { CacheManager } from './cache';
import { RequestQueue } from './requestQueue';

class LinkedInAPI {
  private requestQueue = new RequestQueue(300, 1000);
  private csrfToken: string | null = null;
  private jsessionid: string | null = null;

  constructor() {
    this.initializeTokens();
  }

  private initializeTokens(): void {
    // Extract CSRF token from meta tag or cookies
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      this.csrfToken = csrfMeta.getAttribute('content');
    }

    // Extract session ID from cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'JSESSIONID') {
        this.jsessionid = value;
        break;
      }
    }
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'accept': 'application/vnd.linkedin.normalized+json+2.1',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-restli-protocol-version': '2.0.0',
      ...options.headers
    };

    if (this.csrfToken) {
      (headers as any)['csrf-token'] = this.csrfToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getConnections(start = 0, count = 50): Promise<ConnectionsResponse> {
    const cacheKey = `connections_${start}_${count}`;
    const cached = CacheManager.get<ConnectionsResponse>(cacheKey);
    
    if (cached) {
      console.log('Returning cached connections');
      return cached;
    }

    try {
      return await this.requestQueue.add(async () => {
        console.log(`Fetching connections: start=${start}, count=${count}`);
        
        // LinkedIn's connections endpoint (this might need adjustment based on current API)
        const url = `/voyager/api/relationships/dash/connections?decorationId=com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16&count=${count}&q=search&sortType=RECENTLY_ADDED&start=${start}`;
        
        const response = await this.makeRequest(url);
        
        const connections = this.parseConnectionsResponse(response);
        const result: ConnectionsResponse = {
          connections,
          total: response.paging?.total || connections.length,
          hasMore: connections.length === count
        };

        // Cache the result
        CacheManager.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes TTL
        
        return result;
      }, 1); // High priority
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      throw error;
    }
  }

  async getCompanyInfo(companyId: string): Promise<CompanyInfo | null> {
    const cacheKey = `company_${companyId}`;
    const cached = CacheManager.get<CompanyInfo>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      return await this.requestQueue.add(async () => {
        const url = `/voyager/api/organization/companies/${companyId}`;
        const response = await this.makeRequest(url);
        
        const company: CompanyInfo = {
          id: companyId,
          name: response.name || 'Unknown Company',
          logo: response.logo?.cropped?.com?.linkedin?.common?.VectorImage?.rootUrl + response.logo?.cropped?.com?.linkedin?.common?.VectorImage?.artifacts?.[0]?.fileIdentifyingUrlPathSegment,
          industry: response.industry
        };

        // Cache for longer since company info changes less frequently
        CacheManager.set(cacheKey, company, 60 * 60 * 1000); // 1 hour TTL
        
        return company;
      }, 0); // Lower priority
    } catch (error) {
      console.error(`Failed to fetch company info for ${companyId}:`, error);
      return null;
    }
  }

  private parseConnectionsResponse(response: any): LinkedInConnection[] {
    if (!response || !response.elements) {
      return [];
    }

    return response.elements.map((element: any) => {
      const profile = element.connectedMember || element;
      const miniProfile = profile.miniProfile || profile;
      
      return {
        id: miniProfile.entityUrn?.split(':').pop() || Math.random().toString(),
        firstName: miniProfile.firstName || '',
        lastName: miniProfile.lastName || '',
        fullName: `${miniProfile.firstName || ''} ${miniProfile.lastName || ''}`.trim(),
        profilePicture: this.extractProfilePicture(miniProfile.picture),
        currentPosition: this.extractCurrentPosition(profile),
        profileUrl: `https://www.linkedin.com/in/${miniProfile.publicIdentifier || miniProfile.entityUrn?.split(':').pop()}/`,
        connectedAt: element.createdAt ? new Date(element.createdAt).toISOString() : undefined
      };
    }).filter((conn: LinkedInConnection) => conn.fullName.trim() !== '');
  }

  private extractProfilePicture(picture: any): string | undefined {
    if (!picture) return undefined;
    
    const vectorImage = picture.com?.linkedin?.common?.VectorImage;
    if (vectorImage?.rootUrl && vectorImage?.artifacts?.[0]) {
      return vectorImage.rootUrl + vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
    }
    
    return undefined;
  }

  private extractCurrentPosition(profile: any): LinkedInConnection['currentPosition'] | undefined {
    // Try to extract current position from various possible locations in the response
    const occupation = profile.occupation || profile.miniProfile?.occupation;
    if (occupation) {
      return {
        title: occupation,
        companyName: 'Unknown Company' // We'll need to fetch this separately if needed
      };
    }
    
    return undefined;
  }

  getQueueLength(): number {
    return this.requestQueue.getQueueLength();
  }

  clearCache(): void {
    CacheManager.clear();
  }
}

export const linkedinApi = new LinkedInAPI();