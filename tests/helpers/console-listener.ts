/**
 * Console listener for Playwright tests
 * Captures browser console output for diagnostic purposes
 */

export type ConsoleMessage = {
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  text: string;
  timestamp: number;
};

export class ConsoleListener {
  private messages: ConsoleMessage[] = [];

  constructor(private page: any) {
    this.attach();
  }

  private attach(): void {
    this.page.on('console', (msg: any) => {
      this.messages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      });
    });
  }

  getMessages(filter?: ConsoleMessage['type']): ConsoleMessage[] {
    if (filter) {
      return this.messages.filter(m => m.type === filter);
    }
    return this.messages;
  }

  clear(): void {
    this.messages = [];
  }

  find(pattern: string): ConsoleMessage[] {
    return this.messages.filter(m => m.text.includes(pattern));
  }

  dump(): void {
    console.log('=== Console Listener Dump ===');
    this.messages.forEach(m => {
      console.log(`[${m.type}] ${new Date(m.timestamp).toISOString()}: ${m.text}`);
    });
    console.log('=== End Dump ===');
  }
}

/**
 * Helper to attach console listener to a Playwright page
 */
export function attachConsoleListener(page: any): ConsoleListener {
  return new ConsoleListener(page);
}
