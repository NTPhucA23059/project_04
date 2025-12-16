/**
 * Toast notification helper
 * Usage: toast.success('Message'), toast.error('Message'), etc.
 */
export const toast = {
  success: (message) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message } }));
  },
  error: (message) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message } }));
  },
  info: (message) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message } }));
  },
  warning: (message) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message } }));
  },
};





