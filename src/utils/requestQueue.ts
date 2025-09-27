interface QueueItem {
  id: string;
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
}

export class RequestQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private readonly minDelay: number;
  private readonly maxDelay: number;
  private lastRequestTime = 0;

  constructor(minDelay = 300, maxDelay = 1000) {
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
  }

  add<T>(request: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      const item: QueueItem = {
        id,
        request,
        resolve,
        reject,
        priority
      };

      // Insert based on priority (higher priority = processed first)
      const insertIndex = this.queue.findIndex(q => q.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(insertIndex, 0, item);
      }

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        // Calculate delay to mimic human behavior
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const randomDelay = Math.random() * (this.maxDelay - this.minDelay) + this.minDelay;
        const actualDelay = Math.max(0, randomDelay - timeSinceLastRequest);

        if (actualDelay > 0) {
          await this.delay(actualDelay);
        }

        console.log(`Processing request ${item.id} with ${actualDelay}ms delay`);
        
        const result = await item.request();
        item.resolve(result);
        
        this.lastRequestTime = Date.now();
      } catch (error) {
        console.error(`Request ${item.id} failed:`, error);
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}