/// <reference types="vite/client" />
declare module 'react-sketch-canvas';
/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      };
    };
  }

  interface File {
    path: string;
  }
}

