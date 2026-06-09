import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  // Concept: DOM side effect.
  // What it means: React updates something outside its rendered JSX, the browser document title.
  // Seen in app: detail routes change the browser tab title to the task id.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}


