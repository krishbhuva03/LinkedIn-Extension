// Background script for Chrome extension
class BackgroundScript {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log('LinkedIn Connections Dashboard: Background script loaded');
    
    // Handle extension icon click
    chrome.action.onClicked.addListener(async (tab) => {
      await this.handleIconClick(tab);
    });

    // Handle messages from popup and content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender).then(sendResponse).catch(error => {
        console.error('Background script error:', error);
        sendResponse({ error: error.message });
      });
      
      return true; // Keep the message channel open for async response
    });
  }

  private async handleIconClick(tab: chrome.tabs.Tab): Promise<void> {
    if (!tab.id) return;

    try {
      // Check if we're on LinkedIn
      if (!tab.url?.includes('linkedin.com')) {
        // Navigate to LinkedIn
        await chrome.tabs.update(tab.id, { url: 'https://www.linkedin.com' });
      }
    } catch (error) {
      console.error('Failed to handle icon click:', error);
    }
  }

  private async handleMessage(request: any, sender: chrome.runtime.MessageSender): Promise<any> {
    switch (request.action) {
      case 'openLinkedIn':
        return await this.openLinkedIn();
      
      case 'getCurrentTab':
        return await this.getCurrentTab();
      
      case 'forwardToContentScript':
        return await this.forwardToContentScript(request.data);
      
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  }

  private async openLinkedIn(): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab.url?.includes('linkedin.com')) {
        return { success: true, message: 'Already on LinkedIn' };
      }
      
      await chrome.tabs.update(currentTab.id!, { url: 'https://www.linkedin.com' });
      return { success: true, message: 'Navigated to LinkedIn' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getCurrentTab(): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      return {
        success: true,
        data: {
          id: currentTab.id,
          url: currentTab.url,
          title: currentTab.title,
          isLinkedIn: currentTab.url?.includes('linkedin.com') || false
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async forwardToContentScript(data: any): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab.id) {
        throw new Error('No active tab found');
      }

      const response = await chrome.tabs.sendMessage(currentTab.id, data);
      return response;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Content script not available'
      };
    }
  }
}

// Initialize the background script
new BackgroundScript();