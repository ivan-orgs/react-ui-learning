import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import QueuePage from "../pages/QueuePage";

vi.mock("../api/taskApi", () => ({
  fetchTasks: vi.fn().mockResolvedValue({
    headers: ["id", "team", "owner", "status"],
    rows: [
      {
        id: "TASK-101",
        team: "Platform",
        owner: "Asha Rao",
        priority: "HIGH",
        confidence: "MEDIUM",
        suggestedPriority: "LOW",
        status: "PENDING",
        summary: "Test platform task",
        checks: [{ name: "Smoke test checklist", complete: true }],
        updatedAt: "2026-05-20T10:30:00.000Z"
      },
      {
        id: "TASK-102",
        team: "Data Tools",
        owner: "Vikram Mehta",
        priority: "MEDIUM",
        confidence: null,
        status: "REJECTED",
        summary: "Test data task",
        checks: [{ name: "Sample file attached", complete: false }],
        updatedAt: "2026-05-18T08:15:00.000Z"
      }
    ]
  })
}));

function renderWithProviders() {
  // Concept: test provider setup.
  // What it means: components that use React Query or Router need those providers in tests too.
  // Seen in app: QueuePage works normally because main.tsx provides the real providers.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <QueuePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Concept: integration-style component test.
// What it means: render the page and assert visible DOM output, not implementation details.
// Seen in app: Platform and Data Tools are the same text users see in the queue grid.
describe("QueuePage", () => {
  it("renders task rows from API data", async () => {
    renderWithProviders();

    expect(await screen.findByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Data Tools")).toBeInTheDocument();
  });
});




