import type { ReactNode } from "react";
import styles from "./Text.module.css";

type TextTone = "default" | "muted" | "danger";

export function Text({ children, tone = "default" }: { children: ReactNode; tone?: TextTone }) {
  return <p className={`${styles.text} ${styles[tone]}`}>{children}</p>;
}


