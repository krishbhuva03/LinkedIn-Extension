<script lang="ts">
  import { LinkedInConnection } from '../../types/linkedin';
  
  export let connection: LinkedInConnection;
  
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  function openProfile() {
    chrome.tabs.create({ url: connection.profileUrl });
  }
</script>

<div class="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer fade-in"
     on:click={openProfile}
     role="button"
     tabindex="0"
     on:keydown={(e) => e.key === 'Enter' && openProfile()}
>
  <div class="flex items-start gap-3">
    <!-- Profile Picture or Initials -->
    <div class="flex-shrink-0">
      {#if connection.profilePicture}
        <img 
          src={connection.profilePicture} 
          alt={connection.fullName}
          class="w-12 h-12 rounded-full object-cover"
          loading="lazy"
        />
      {:else}
        <div class="w-12 h-12 rounded-full bg-linkedin-blue text-white flex items-center justify-center text-sm font-semibold">
          {getInitials(connection.fullName)}
        </div>
      {/if}
    </div>
    
    <!-- Connection Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 truncate text-sm">
            {connection.fullName}
          </h3>
          
          {#if connection.currentPosition}
            <p class="text-xs text-gray-600 truncate mt-1">
              {connection.currentPosition.title}
            </p>
            
            {#if connection.currentPosition.companyName}
              <div class="flex items-center gap-2 mt-1">
                {#if connection.currentPosition.companyLogo}
                  <img 
                    src={connection.currentPosition.companyLogo} 
                    alt={connection.currentPosition.companyName}
                    class="w-4 h-4 rounded object-cover"
                    loading="lazy"
                  />
                {/if}
                <p class="text-xs text-gray-500 truncate">
                  {connection.currentPosition.companyName}
                </p>
              </div>
            {/if}
          {/if}
        </div>
        
        <!-- External link icon -->
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      
      {#if connection.connectedAt}
        <p class="text-xs text-gray-400 mt-2">
          Connected {new Date(connection.connectedAt).toLocaleDateString()}
        </p>
      {/if}
    </div>
  </div>
</div>