import styles from "./Skeleton.module.css";

export function SkeletonLine() {
  return <span className={styles.line} />;
}

export function PageSkeleton({ title }: { title: string }) {
  return (
    // Concept: skeleton loader with aria-busy and aria-live.
    // What it means: users see layout-like placeholders, and assistive tech knows loading is happening.
    // Seen in app: lazy routes and data fetches show PageSkeleton while waiting.
    <section className={styles.page} aria-busy="true" aria-live="polite">
      <p>{title}</p>
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine />
    </section>
  );
}


