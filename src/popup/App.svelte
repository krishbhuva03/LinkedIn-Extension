<script lang="ts">
  import { onMount } from 'svelte';
  import ConnectionList from './components/ConnectionList.svelte';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorMessage from './components/ErrorMessage.svelte';
  import StatusBar from './components/StatusBar.svelte';
  import { LinkedInConnection } from '../types/linkedin';

  let connections: LinkedInConnection[] = [];
  let filteredConnections: LinkedInConnection[] = [];
  let loading = false;
  let error = '';
  let isLinkedInPage = false;
  let isLoggedIn = false;
  let searchQuery = '';
  let selectedCompany = '';
  let queueLength = 0;
  let totalConnections = 0;
  let hasMore = false;
  let currentPage = 0;
  const pageSize = 50;

  // Get unique companies for filter dropdown
  $: companies = [...new Set(connections
    .map(c => c.currentPosition?.companyName)
    .filter(Boolean)
  )].sort();

  // Filter connections based on search and company filter
  $: {
    filteredConnections = connections.filter(conn => {
      const matchesSearch = !searchQuery || 
        conn.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.currentPosition?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCompany = !selectedCompany || 
        conn.currentPosition?.companyName === selectedCompany;
      
      return matchesSearch && matchesCompany;
    });
  }

  onMount(async () => {
    await checkLinkedInAccess();
    if (isLinkedInPage && isLoggedIn) {
      await loadConnections();
    }
    
    // Update queue status periodically
    setInterval(updateQueueStatus, 1000);
  });

  async function checkLinkedInAccess() {
    try {
      const response = await sendMessage({ action: 'getCurrentTab' });
      if (response.success) {
        isLinkedInPage = response.data.isLinkedIn;
      }

      if (isLinkedInPage) {
        const accessResponse = await sendMessage({ 
          action: 'forwardToContentScript', 
          data: { action: 'checkLinkedInAccess' }
        });
        
        if (accessResponse.success && accessResponse.data) {
          isLoggedIn = accessResponse.data.isLoggedIn;
        }
      }
    } catch (err) {
      console.error('Failed to check LinkedIn access:', err);
    }
  }

  async function navigateToLinkedIn() {
    try {
      await sendMessage({ action: 'openLinkedIn' });
      setTimeout(() => window.close(), 1000);
    } catch (err) {
      error = 'Failed to navigate to LinkedIn';
    }
  }

  async function loadConnections(page = 0) {
    if (loading) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await sendMessage({
        action: 'forwardToContentScript',
        data: {
          action: 'getConnections',
          start: page * pageSize,
          count: pageSize
        }
      });

      if (response.success && response.data) {
        if (page === 0) {
          connections = response.data.connections;
        } else {
          connections = [...connections, ...response.data.connections];
        }
        
        totalConnections = response.data.total;
        hasMore = response.data.hasMore;
        currentPage = page;
      } else {
        throw new Error(response.error || 'Failed to load connections');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load connections';
    } finally {
      loading = false;
    }
  }

  async function loadMoreConnections() {
    if (hasMore && !loading) {
      await loadConnections(currentPage + 1);
    }
  }

  async function refreshConnections() {
    // Clear cache and reload
    try {
      await sendMessage({
        action: 'forwardToContentScript',
        data: { action: 'clearCache' }
      });
    } catch {}
    
    connections = [];
    currentPage = 0;
    await loadConnections(0);
  }

  async function updateQueueStatus() {
    try {
      const response = await sendMessage({
        action: 'forwardToContentScript',
        data: { action: 'getQueueStatus' }
      });
      
      if (response.success && response.data) {
        queueLength = response.data.queueLength;
      }
    } catch {}
  }

  function sendMessage(message: any): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  function clearFilters() {
    searchQuery = '';
    selectedCompany = '';
  }
</script>

<div class="w-96 h-[600px] bg-white flex flex-col">
  <!-- Header -->
  <div class="bg-linkedin-blue text-white p-4">
    <h1 class="text-lg font-bold flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      Connections Dashboard
    </h1>
  </div>

  <!-- Status and Navigation -->
  {#if !isLinkedInPage}
    <div class="p-4 text-center">
      <p class="text-gray-600 mb-4">Please navigate to LinkedIn to use this extension.</p>
      <button 
        on:click={navigateToLinkedIn}
        class="bg-linkedin-blue text-white px-4 py-2 rounded hover:bg-linkedin-dark transition-colors"
      >
        Go to LinkedIn
      </button>
    </div>
  {:else if !isLoggedIn}
    <div class="p-4 text-center">
      <p class="text-gray-600 mb-4">Please log in to LinkedIn to access your connections.</p>
      <button 
        on:click={() => window.close()}
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
      >
        Close
      </button>
    </div>
  {:else}
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Controls -->
      <div class="p-3 border-b bg-gray-50 space-y-2">
        <!-- Search -->
        <input
          type="text"
          placeholder="Search connections..."
          bind:value={searchQuery}
          class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
        >
        
        <!-- Company Filter -->
        <div class="flex gap-2">
          <select 
            bind:value={selectedCompany}
            class="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
          >
            <option value="">All Companies</option>
            {#each companies as company}
              <option value={company}>{company}</option>
            {/each}
          </select>
          
          <button
            on:click={clearFilters}
            class="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            title="Clear filters"
          >
            Clear
          </button>
        </div>
        
        <!-- Refresh Button -->
        <button
          on:click={refreshConnections}
          disabled={loading}
          class="w-full px-3 py-2 text-sm bg-linkedin-blue text-white rounded-md hover:bg-linkedin-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <!-- Status Bar -->
      <StatusBar 
        {queueLength} 
        {totalConnections} 
        filteredCount={filteredConnections.length}
        {loading}
      />

      <!-- Error Message -->
      {#if error}
        <ErrorMessage {error} />
      {/if}

      <!-- Loading Spinner -->
      {#if loading && connections.length === 0}
        <div class="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      {:else}
        <!-- Connections List -->
        <div class="flex-1 overflow-auto">
          <ConnectionList 
            connections={filteredConnections}
            {loading}
            {hasMore}
            on:loadMore={loadMoreConnections}
          />
        </div>
      {/if}
    </div>
  {/if}
</div>