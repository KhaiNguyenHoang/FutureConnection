import * as signalR from '@microsoft/signalr';

const HUB_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/hubs/chat`
  : 'http://localhost:5000/hubs/chat';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: Map<string, Array<(...args: any[]) => void>> = new Map();

  async start(token: string) {
    if (this.connection) return;

    if (!token) {
      console.warn('SignalR: No token provided, postponement connection.');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onclose((error) => {
      console.error('SignalR: Connection closed.', error);
    });

    try {
      await this.connection.start();
      console.log('SignalR: Connected.');
      
      // Re-register all callbacks
      this.callbacks.forEach((fns, event) => {
        fns.forEach(fn => this.connection?.on(event, fn));
      });

    } catch (err) {
      console.error('SignalR: Error starting connection.', err);
      setTimeout(() => this.start(token), 5000);
    }
  }

  stop() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
    this.connection?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    const fns = this.callbacks.get(event);
    if (fns) {
      const index = fns.indexOf(callback);
      if (index !== -1) {
        fns.splice(index, 1);
      }
    }
    this.connection?.off(event, callback);
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection.invoke(methodName, ...args);
    }
    console.error(`SignalR: Cannot invoke ${methodName}, connection is not active.`);
  }
}

export const signalRService = new SignalRService();
