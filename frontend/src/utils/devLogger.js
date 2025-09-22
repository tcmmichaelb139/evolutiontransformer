// Development-only logging utility
// These logs will only appear in development builds, not production

export const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const devError = (...args) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

export const devWarn = (...args) => {
  if (import.meta.env.DEV) {
    console.warn(...args);
  }
};
