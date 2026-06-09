import { Link } from "react-router-dom";
import { Surface } from "../ui/Surface";

export function NotFoundPage() {
  return (
    // Concept: NotFound page.
    // What it means: unmatched routes should still give users a useful next action.
    // Seen in app: visit /unknown and this page links back to the queue.
    <Surface title="Page not found">
      <p>The route does not match this learning app.</p>
      <Link to="/">Back to queue</Link>
    </Surface>
  );
}


