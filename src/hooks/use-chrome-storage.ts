
"use client";

import { useState, useEffect, useCallback } from 'react';

// A simple hook to sync state with chrome.storage.local
export function useChromeStorage<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure chrome API is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error(`Error getting chrome storage for key ${key}:`, chrome.runtime.lastError);
          setLoading(false);
          return;
        }
        const value = result[key];
        if (value !== undefined) {
          setStoredValue(value);
        }
        setLoading(false);
      });
    } else {
      // Not in an extension context, loading is done.
      setLoading(false);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    // Ensure chrome API is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error setting chrome storage for key ${key}:`, chrome.runtime.lastError);
          return;
        }
        setStoredValue(value);
      });
    } else {
        // Not in an extension context, just update state
        setStoredValue(value);
    }
  }, [key]);

  return [storedValue, setValue, loading];
}
