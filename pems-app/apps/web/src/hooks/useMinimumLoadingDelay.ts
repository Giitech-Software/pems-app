import { useEffect, useState } from "react";

const DEFAULT_MINIMUM_LOADING_MS = 4000;

export function useMinimumLoadingDelay(
  delayMs = DEFAULT_MINIMUM_LOADING_MS
) {
  const [isDelayActive, setIsDelayActive] = useState(true);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsDelayActive(false);
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [delayMs]);

  return isDelayActive;
}
