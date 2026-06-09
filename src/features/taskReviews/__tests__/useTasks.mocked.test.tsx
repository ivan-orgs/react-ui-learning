import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { TaskId, ReviewStatus, PriorityLevel } from "../types";

// Concept: mocking hooks.
// What it means: replace a real hook with predictable test data.
// Seen in app: the real app fetches data; this test forces "Mocked unit" without HTTP.
vi.mock("../hooks/useTasks", () => ({
  useTasks: () => ({
    data: [
      {
        queueRow: {
          id: "TASK-999" as TaskId,
          team: "Mocked unit",
          owner: "Mock Owner",
          priority: "LOW" as PriorityLevel,
          confidence: "LOW",
          status: "APPROVED" as ReviewStatus
        }
      }
    ],
    isLoading: false,
    isError: false,
    error: null
  }),
  useColumnarTasks: () => ({ data: undefined })
}));

// Concept: mocking heavy child components.
// What it means: replace AG Grid with a tiny test double so this test focuses on QueuePage logic.
// Seen in app: real AG Grid still renders in the browser; only this test uses the fake grid.
vi.mock("../components/AgTaskGrid", () => ({
  AgTaskGrid: ({ rows }: { rows: Array<{ team: string }> }) => (
    <div>{rows.map((row) => row.team).join(", ")}</div>
  )
}));

import QueuePage from "../pages/QueuePage";

describe("QueuePage with mocked hooks", () => {
  it("can render using a mocked hook result", () => {
    render(
      <MemoryRouter>
        <QueuePage />
      </MemoryRouter>
    );

    // Concept: DOM assertion with jest-dom.
    // What it means: assert what a user could see on screen.
    expect(screen.getByText("Mocked unit")).toBeInTheDocument();
  });
});



