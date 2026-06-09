import { describe, expect, it, vi } from "vitest";
import { fetchTasks, saveTaskReview } from "../api/taskApi";

vi.mock("../../../shared/api/httpClient", () => ({
  http: {
    get: vi.fn().mockResolvedValue({
      data: {
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
            summary: "Test task",
            checks: [{ name: "Smoke test checklist", complete: true }],
            updatedAt: "2026-05-20T10:30:00.000Z"
          }
        ]
      }
    }),
    post: vi.fn().mockResolvedValue({ data: { saved: true } })
  }
}));

describe("taskApi", () => {
  it("uses the shared HTTP client for reads and writes", async () => {
    const data = await fetchTasks();
    const saved = await saveTaskReview({
      id: data.rows[0].id,
      review: "APPROVED",
      note: "test note"
    });

    expect(data.rows).toHaveLength(1);
    expect(saved.saved).toBe(true);
  });
});



