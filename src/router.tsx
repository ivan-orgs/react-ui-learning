import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { PageSkeleton } from "./shared/ui/Skeleton";
import { RouterError } from "./shared/routing/RouterError";
import { NotFoundPage } from "./shared/routing/NotFoundPage";

// Concept: route-level code splitting with lazy imports.
// What it means: each page can become a separate JS chunk instead of loading everything upfront.
// Seen in app: /, /task/:id, and /concepts load as separate route modules.
const QueuePage = lazy(() => import("./features/taskReviews/pages/QueuePage"));
const TaskDetailsPage = lazy(
  () => import("./features/taskReviews/pages/TaskDetailsPage")
);
const ConceptsPage = lazy(() => import("./features/concepts/ConceptsPage"));

// Concept: React Router v7 createBrowserRouter.
// What it means: this array describes all browser URLs and which component renders for each URL.
// Seen in app: /concepts shows the concept map; /task/TASK-101 shows a dynamic detail route.
export const router = createBrowserRouter([
  {
    path: "/",
    // Concept: parent layout route.
    // What it means: a layout route is a parent route that renders shared UI and places child pages inside Outlet.
    // Seen in app: App renders shared header/footer once, then child pages render inside <Outlet />.
    element: <App />,
    // Concept: route-level error boundary.
    // What it means: RouterError shows when a route loader/render fails at the routing level.
    // Seen in app: bad route-level failures are caught outside the normal page UI.
    errorElement: <RouterError />,
    children: [
      {
        index: true,
        element: (
          // Concept: Suspense fallback.
          // What it means: while a lazy route chunk loads, users see a skeleton instead of blank UI.
          // Seen in app: slow loading would show "Loading queue".
          <Suspense fallback={<PageSkeleton title="Loading queue" />}>
            <QueuePage />
          </Suspense>
        )
      },
      {
        // Concept: dynamic route params.
        // What it means: :taskId becomes a variable read with useParams().
        // Seen in app: clicking TASK-101 navigates to /task/TASK-101.
        path: "task/:taskId",
        element: (
          <Suspense fallback={<PageSkeleton title="Loading task" />}>
            <TaskDetailsPage />
          </Suspense>
        )
      },
      {
        path: "concepts",
        element: (
          <Suspense fallback={<PageSkeleton title="Loading concepts" />}>
            <ConceptsPage />
          </Suspense>
        )
      },
      // Concept: NotFound route.
      // What it means: * catches URLs that no route matched.
      // Seen in app: visit /does-not-exist.
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);



