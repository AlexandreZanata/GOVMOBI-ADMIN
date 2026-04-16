import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";

import { useRuns } from "@/hooks/runs/useRuns";
import { renderWithProviders } from "@/test/renderWithProviders";
import { RunPriority, RunStatus, RunType, type Run } from "@/models";

const RUNS_API_URL = "http://localhost:3000/api/runs";

const runFixture: Run = {
  id: "run-1",
  type: RunType.TRANSPORT,
  status: RunStatus.PENDING,
  priority: RunPriority.MEDIUM,
  title: "Transport sample",
  description: "Fixture run for query tests",
  location: {
    lat: -8.0476,
    lng: -34.877,
    address: "Recife Operations Center",
  },
  assignedAgentId: "agent-1",
  dispatcherId: "dispatcher-1",
  createdAt: "2026-04-15T08:00:00.000Z",
  updatedAt: "2026-04-15T08:00:00.000Z",
  completedAt: null,
  notes: null,
  proofs: [],
  departmentId: "dept-ops",
};

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("useRuns", () => {
  it("exposes loading state before query resolves", async () => {
    server.use(
      http.get(RUNS_API_URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json([runFixture], { status: 200 });
      })
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("returns data on successful request", async () => {
    server.use(
      http.get(RUNS_API_URL, () => {
        return HttpResponse.json([runFixture], { status: 200 });
      })
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([runFixture]);
  });

  it("returns error state on 500 response", async () => {
    server.use(
      http.get(RUNS_API_URL, () => {
        return HttpResponse.json(
          { message: "SERVER_ERROR" },
          {
            status: 500,
          }
        );
      })
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
  });

  it("returns error state on 403 forbidden", async () => {
    server.use(
      http.get(RUNS_API_URL, () => {
        return HttpResponse.json(
          { message: "FORBIDDEN" },
          {
            status: 403,
          }
        );
      })
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
  });
});
