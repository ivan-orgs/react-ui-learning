import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Surface } from "../ui/Surface";

export function RouterError() {
  // Concept: route error boundary consumer.
  // What it means: useRouteError reads errors caught by React Router.
  // Seen in app: route-level failures show this fallback with a Back to queue link.
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown route error";

  return (
    <Surface title="Something went wrong">
      <p role="alert">{message}</p>
      <Link to="/">Back to queue</Link>
    </Surface>
  );
}


