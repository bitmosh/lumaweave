import { useRef } from "react";
import { initializeLocale } from "./locale";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    initializeLocale("en");
  }
  return <>{children}</>;
}
