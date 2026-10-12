/**
 * Safe Browser Storage Utility
 * Wraps window.sessionStorage and window.localStorage with fail-safe in-memory fallbacks.
 * Prevents SecurityError / DOMException crashes on restricted mobile browsers,
 * private/incognito tabs, or when third-party cookies & site data are blocked.
 */

// In-memory fallback dictionary maintained for the active tab session
const inMemoryStore = new Map();

/**
 * Safe Session Storage Adapter
 */
export const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== "undefined") {
        const storage = window.sessionStorage;
        if (storage) {
          const val = storage.getItem(key);
          if (val !== null) return val;
        }
      }
    } catch {
      // Access denied or not available; fallback to inMemoryStore
    }
    return inMemoryStore.get(`session_${key}`) || null;
  },

  setItem: (key, value) => {
    const stringVal = String(value);
    inMemoryStore.set(`session_${key}`, stringVal);
    try {
      if (typeof window !== "undefined") {
        const storage = window.sessionStorage;
        if (storage) {
          storage.setItem(key, stringVal);
        }
      }
    } catch {
      // Silently fall back to inMemoryStore
    }
  },

  removeItem: (key) => {
    inMemoryStore.delete(`session_${key}`);
    try {
      if (typeof window !== "undefined") {
        const storage = window.sessionStorage;
        if (storage) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Silently ignore
    }
  },

  clear: () => {
    for (const k of inMemoryStore.keys()) {
      if (k.startsWith("session_")) inMemoryStore.delete(k);
    }
    try {
      if (typeof window !== "undefined") {
        const storage = window.sessionStorage;
        if (storage) {
          storage.clear();
        }
      }
    } catch {
      // Silently ignore
    }
  },
};

/**
 * Safe Local Storage Adapter
 */
export const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== "undefined") {
        const storage = window.localStorage;
        if (storage) {
          const val = storage.getItem(key);
          if (val !== null) return val;
        }
      }
    } catch {
      // Access denied or not available; fallback to inMemoryStore
    }
    return inMemoryStore.get(`local_${key}`) || null;
  },

  setItem: (key, value) => {
    const stringVal = String(value);
    inMemoryStore.set(`local_${key}`, stringVal);
    try {
      if (typeof window !== "undefined") {
        const storage = window.localStorage;
        if (storage) {
          storage.setItem(key, stringVal);
        }
      }
    } catch {
      // Silently fall back to inMemoryStore
    }
  },

  removeItem: (key) => {
    inMemoryStore.delete(`local_${key}`);
    try {
      if (typeof window !== "undefined") {
        const storage = window.localStorage;
        if (storage) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Silently ignore
    }
  },

  clear: () => {
    for (const k of inMemoryStore.keys()) {
      if (k.startsWith("local_")) inMemoryStore.delete(k);
    }
    try {
      if (typeof window !== "undefined") {
        const storage = window.localStorage;
        if (storage) {
          storage.clear();
        }
      }
    } catch {
      // Silently ignore
    }
  },
};
