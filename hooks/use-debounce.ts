import { useEffect, useState } from "react";

/**
 * Delays updating a value until the user stops changing it for `delay` ms.
 * Useful for search inputs — prevents firing on every single keystroke.
 *
 * @param value  The value to debounce (any type)
 * @param delay  How many ms to wait after the last change
 * @returns      The debounced value (lags behind the real value)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Start a timer — when it fires, commit the latest value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before delay is up, cancel the old timer
    // This is why only the LAST keystroke triggers an update
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
