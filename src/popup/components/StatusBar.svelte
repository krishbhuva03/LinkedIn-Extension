<script lang="ts">
  export let queueLength: number;
  export let totalConnections: number;
  export let filteredCount: number;
  export let loading: boolean;
</script>

<div class="px-3 py-2 bg-gray-100 border-b text-xs text-gray-600 flex items-center justify-between">
  <div class="flex items-center gap-4">
    <span>Total: {totalConnections}</span>
    
    {#if filteredCount !== totalConnections}
      <span>Filtered: {filteredCount}</span>
    {/if}
    
    {#if queueLength > 0}
      <span class="flex items-center gap-1">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Queue: {queueLength}
      </span>
    {/if}
  </div>
  
  <div class="flex items-center gap-2">
    {#if loading}
      <span class="text-linkedin-blue">Loading...</span>
    {:else}
      <span class="text-green-600">Ready</span>
    {/if}
  </div>
</div>