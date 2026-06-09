import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { LoaderBinder } from "./shared/loading/LoaderBinder";
import { LoaderProvider } from "./shared/loading/LoaderContext";
import "./styles/global.css";

// Concept: TanStack QueryClient.
// What it means: this object owns the client-side cache for API data.
// Seen in app: visit the queue, then a detail page; the detail page reuses cached task data.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Concept: staleTime and background refetching.
      // What it means: data is considered fresh for 30 seconds, then React Query may refresh it.
      // Seen in app: queue data does not immediately refetch on every render.
      staleTime: 30_000,
      refetchOnWindowFocus: true
    }
  }
});

// Concept: React 18 root rendering.
// What it means: createRoot connects React to the real DOM node in index.html.
// Seen in app: everything inside <div id="root"> is checkled by React.
createRoot(document.getElementById("root")!).render(
  // Concept: StrictMode.
  // What it means: React runs extra development checks to reveal unsafe patterns early.
  // Seen in app: this does not show UI, but helps while coding.
  <StrictMode>
    {/* Concept: Provider composition.
        What it means: app-wide tools wrap the router so every page can use them.
        Seen in app: all routes can use loading state and cached query data. */}
    <LoaderProvider>
      <LoaderBinder />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </LoaderProvider>
  </StrictMode>
);


