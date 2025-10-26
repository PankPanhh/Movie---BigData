// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // Đặt hẹn giờ
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy hẹn giờ nếu value thay đổi
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chỉ chạy lại nếu value hoặc delay thay đổi

  return debouncedValue;
}