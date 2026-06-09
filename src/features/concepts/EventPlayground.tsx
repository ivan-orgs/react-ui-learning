import { useState, type MouseEvent } from "react";
import { Button, Surface, Text } from "../../components/wabi";
import styles from "./EventPlayground.module.css";

export function EventPlayground() {
  // Concept: useState.
  // What it means: React remembers this array between renders and rerenders when it changes.
  // Concept: array destructuring.
  // What it means: useState returns an array; events gets the first item, and setEvents gets the second item.
  // Seen in app: click "Trigger bubbling" and the event log updates.
  const [events, setEvents] = useState<string[]>([]);

  // Concept: function declaration.
  // What it means: a named reusable function can be called from multiple event handlers.
  // Seen in app: both parent and button clicks add messages to the same list.
  function addEvent(label: string) {
    // Concept: spread-like immutable update pattern.
    // What it means: create a new array instead of mutating the old state array.
    // Seen in app: newest events appear first while older ones remain below.
    setEvents((current) => [label, ...current].slice(0, 3));
  }

  function handleParentClick() {
    addEvent("Parent section received the bubbled click.");
  }

  // Concept: arrow function and React synthetic event.
  // What it means: onClick gives this handler a React MouseEvent, which is React's synthetic event wrapper around the browser click.
  // How it differs: a real browser event comes directly from the DOM; a synthetic event is React's normalized wrapper, with the original event available as event.nativeEvent.
  // Seen in app: the log prints event.type from the synthetic event after clicking the button.
  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    addEvent(`Button synthetic event type: ${event.type}`);
  };

  return (
    <Surface title="DOM events and React synthetic events">
      {/* Concept: DOM event bubbling.
          What it means: the button click runs on the button, then bubbles to the parent section.
          Seen in app: one click adds both a button message and a parent message. */}
      <section className={styles.box} onClick={handleParentClick}>
        <Button onClick={handleButtonClick}>Trigger bubbling</Button>
      </section>
      <Text tone="muted">
        Synthetic event example: the button onClick handler receives a React MouseEvent. It feels
        like a normal browser click event, but React creates this wrapper so event behavior is
        consistent across browsers and tied into React rendering. The original browser event is
        still available as event.nativeEvent.
      </Text>
      {/* Concept: conditional rendering.
          What it means: choose one UI branch when events exist and another when empty.
          Seen in app: the placeholder text disappears after your first click. */}
      {events.length ? (
        <ul aria-live="polite">
          {events.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <Text tone="muted">Click the button to see child and parent handlers run.</Text>
      )}
    </Surface>
  );
}


