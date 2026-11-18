import { useEffect, useState } from "react";

/** Current time, ticking every `ms`. Drives the countdowns on the dashboard. */
export const useNow = (ms = 1000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
};
