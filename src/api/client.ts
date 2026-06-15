import type {
  TrainingSession,
  OperationLog,
  SessionIndexItem,
  SessionFile,
  TransformerArea,
  LoadBlock,
} from "@shared/types";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const apiClient = {
  listSessions(): Promise<SessionIndexItem[]> {
    return request<SessionIndexItem[]>("/api/sessions");
  },

  createSession(payload: {
    name: string;
    areas: TransformerArea[];
    initialLoads: LoadBlock[];
  }): Promise<TrainingSession> {
    return request<TrainingSession>("/api/session", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getSession(id: string): Promise<SessionFile> {
    return request<SessionFile>(`/api/session/${id}`);
  },

  submitLog(log: Omit<OperationLog, "id" | "timestamp"> & {
    timestamp?: string;
  }): Promise<OperationLog> {
    return request<OperationLog>("/api/log", {
      method: "POST",
      body: JSON.stringify(log),
    });
  },

  getSessionLogs(id: string): Promise<OperationLog[]> {
    return request<OperationLog[]>(`/api/log/session/${id}`);
  },
};
