import type { ReactNode } from "react";
import styles from "./Surface.module.css";

interface SurfaceProps {
  children: ReactNode;
  title?: string;
}

export function Surface({ children, title }: SurfaceProps) {
  return (
    // Concept: reusable composition primitive.
    // What it means: Surface gives many feature sections the same border/padding/title pattern.
    // Seen in app: concept cards, widgets, errors, and side panel all share this component.
    <section className={styles.surface}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}


