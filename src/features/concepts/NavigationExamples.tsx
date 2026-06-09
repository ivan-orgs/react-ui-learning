import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Surface, Text } from "../../components/wabi";
import styles from "./NavigationExamples.module.css";

export function NavigationExamples() {
  // Concept: useNavigate.
  // What it means: useNavigate gives code a navigate function so an event handler can change routes.
  // Seen in app: clicking this button moves to the task detail route without a full page reload.
  const navigate = useNavigate();

  return (
    <Surface title="Navigation: Link, NavLink, useNavigate">
      <div className={styles.stack}>
        <div>
          <Text tone="muted">
            Link is for normal route links. It renders an anchor but lets React Router handle the
            navigation.
          </Text>
          {/* Concept: Link.
              What it means: Link changes routes without reloading the whole browser page.
              Seen in app: click this to move from /concepts back to the queue route. */}
          <Link className={styles.link} to="/">
            Link to queue
          </Link>
        </div>

        <div>
          <Text tone="muted">
            NavLink is for navigation menus because it knows when its route is active.
          </Text>
          {/* Concept: NavLink.
              What it means: NavLink adds aria-current="page" when the link matches the current URL.
              Seen in app: Concepts is active while you are on /concepts. */}
          <nav className={styles.nav} aria-label="Navigation examples">
            <NavLink to="/">Queue</NavLink>
            <NavLink to="/concepts">Concepts</NavLink>
          </nav>
        </div>

        <div>
          <Text tone="muted">
            useNavigate is for route changes from code, such as after a button click or save.
          </Text>
          <Button variant="primary" onClick={() => navigate("/task/TASK-101")}>
            useNavigate to TASK-101
          </Button>
        </div>
      </div>
    </Surface>
  );
}
