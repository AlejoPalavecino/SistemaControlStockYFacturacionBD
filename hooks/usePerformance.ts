import { useMemo, useCallback, useRef } from 'react';

/**
 * Hook para memoizar operaciones costosas con cache personalizado
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Hook para memoizar datos que cambian frecuentemente
 */
export const useMemoizedData = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Hook para debouncing de funciones costosas
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T, [callback, delay]);
};

/**
 * Hook para operaciones que solo deben ejecutarse una vez
 */
export const useOnce = (callback: () => void) => {
  const hasRun = useRef(false);
  
  if (!hasRun.current) {
    callback();
    hasRun.current = true;
  }
};