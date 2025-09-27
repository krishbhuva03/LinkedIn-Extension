<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { LinkedInConnection } from '../../types/linkedin';
  import ConnectionCard from './ConnectionCard.svelte';
  
  export let connections: LinkedInConnection[];
  export let loading: boolean;
  export let hasMore: boolean;

  const dispatch = createEventDispatcher();

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Load more when scrolled to within 100px of bottom
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
      dispatch('loadMore');
    }
  }
</script>

<div 
  class="flex-1 overflow-auto p-2 space-y-2" 
  on:scroll={handleScroll}
>
  {#if connections.length === 0 && !loading}
    <div class="text-center text-gray-500 py-8">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p>No connections found</p>
      <p class="text-sm">Try adjusting your filters or refresh the data</p>
    </div>
  {:else}
    {#each connections as connection (connection.id)}
      <ConnectionCard {connection} />
    {/each}
    
    {#if loading}
      <div class="text-center py-4">
        <div class="inline-flex items-center gap-2 text-sm text-gray-500">
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading more connections...
        </div>
      </div>
    {:else if hasMore}
      <div class="text-center py-4">
        <button
          on:click={() => dispatch('loadMore')}
          class="text-sm text-linkedin-blue hover:text-linkedin-dark underline"
        >
          Load more connections
        </button>
      </div>
    {/if}
  {/if}
</div>