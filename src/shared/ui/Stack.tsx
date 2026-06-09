import type { CSSProperties, ReactNode } from "react";

interface StackProps {
  children: ReactNode;
  gap?: number;
}

export function Stack({ children, gap = 12 }: StackProps) {
  const style = { "--gap": `${gap}px` } as CSSProperties;

  return (
    <div style={style} className="stack">
      {children}
    </div>
  );
}


