import { useState } from "react";
import { Button } from "../../../shared/ui/Button";

export function ShowMore({ text, limit = 90 }: { text: string; limit?: number }) {
  // Concept: progressive disclosure.
  // What it means: hide long content until the user asks for more.
  // Seen in app: long task summaries can expand with Show more.
  const [expanded, setExpanded] = useState(false);
  const shortText = text.length > limit ? `${text.slice(0, limit)}...` : text;

  if (text.length <= limit) {
    return <p>{text}</p>;
  }

  return (
    <div>
      <p>{expanded ? text : shortText}</p>
      <Button variant="ghost" onClick={() => setExpanded((current) => !current)}>
        {expanded ? "Show less" : "Show more"}
      </Button>
    </div>
  );
}



