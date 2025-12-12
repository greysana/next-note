"use client";
import { useEffect, useState } from "react";

export function useDebounce(value: string, delay: number) {
  const [devounceValue, setDevounceValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDevounceValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return devounceValue;
}
