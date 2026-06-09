import type { ReactNode } from "react";
import styles from "./KeyValuePair.module.css";

interface KeyValuePairProps {
  label: string;
  value: ReactNode;
}

export function KeyValuePair({ label, value }: KeyValuePairProps) {
  return (
    <div className={styles.pair}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}


