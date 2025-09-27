export interface LinkedInConnection {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture?: string;
  currentPosition?: {
    title: string;
    companyName: string;
    companyLogo?: string;
    companyId?: string;
  };
  profileUrl: string;
  connectedAt?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ConnectionsResponse {
  connections: LinkedInConnection[];
  total: number;
  hasMore: boolean;
}

export interface LinkedInAPIResponse {
  data?: {
    searchDashClustersByAll?: {
      elements?: any[];
    };
  };
  included?: any[];
}