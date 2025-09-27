import { linkedinApi } from '../utils/linkedinApi';

// Content script to inject LinkedIn API access
class LinkedInContentScript {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    console.log('LinkedIn Connections Dashboard: Content script loaded');
    
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupMessageListener());
    } else {
      this.setupMessageListener();
    }
    
    this.isInitialized = true;
  }

  private setupMessageListener(): void {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request).then(sendResponse).catch(error => {
        console.error('Content script error:', error);
        sendResponse({ error: error.message });
      });
      
      return true; // Keep the message channel open for async response
    });
  }

  private async handleMessage(request: any): Promise<any> {
    switch (request.action) {
      case 'getConnections':
        return await this.getConnections(request.start, request.count);
      
      case 'getCompanyInfo':
        return await this.getCompanyInfo(request.companyId);
      
      case 'checkLinkedInAccess':
        return this.checkLinkedInAccess();
      
      case 'getQueueStatus':
        return {
          queueLength: linkedinApi.getQueueLength()
        };
      
      case 'clearCache':
        return this.clearCache();
      
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  }

  private async getConnections(start = 0, count = 50): Promise<any> {
    try {
      const result = await linkedinApi.getConnections(start, count);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to get connections:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getCompanyInfo(companyId: string): Promise<any> {
    try {
      const result = await linkedinApi.getCompanyInfo(companyId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to get company info:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private checkLinkedInAccess(): any {
    const isLinkedIn = window.location.hostname === 'www.linkedin.com';
    const isLoggedIn = document.querySelector('[data-test-id="profile-pill-user-menu"]') !== null ||
                      document.querySelector('.global-nav__me') !== null ||
                      document.cookie.includes('li_at=');
    
    return {
      success: true,
      data: {
        isLinkedIn,
        isLoggedIn,
        currentUrl: window.location.href
      }
    };
  }

  private clearCache(): any {
    try {
      linkedinApi.clearCache();
      return {
        success: true,
        message: 'Cache cleared successfully'
      };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Initialize the content script
new LinkedInContentScript();