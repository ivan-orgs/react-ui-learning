import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

// Concept: string literal union for variants.
// What it means: callers can only pass primary, secondary, or ghost.
// Seen in app: filter buttons and side-panel tabs change style through the variant prop.
type ButtonVariant = "primary" | "secondary" | "ghost";

// Concept: interface extending native button props.
// What it means: this component accepts normal button attributes like onClick and disabled.
// Seen in app: Button works like a real button but has design-system styling.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, className = "", variant = "secondary", ...props }: ButtonProps) {
  return (
    // Concept: props-driven styling with CSS modules.
    // What it means: styles[variant] chooses a scoped class based on props.
    // Seen in app: selected filters use the primary style.
    <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}


