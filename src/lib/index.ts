// place files you want to import through the `$lib` alias in this folder.

import { writable } from 'svelte/store';

export interface NotificationData {
  show: boolean;
  content: {
    title?: string;
    message: string;
    icon?: string;
  };
  type: "success" | "error" | "info";
}

export const notificationStore = writable<NotificationData>({ show: false, content: { message: '' }, type: 'info' });

export function showNotification(content: { title?: string; message: string; icon?: string }, type: "success" | "error" | "info" = "info") {
  notificationStore.set({ show: true, content, type });
  setTimeout(() => {
    notificationStore.update(n => ({ ...n, show: false }));
  }, 3000);
}
