import type { OperationLog } from "@shared/types";
import { fileRepository } from "../repositories/FileRepository.js";

export class LogService {
  async appendLog(
    input: Omit<OperationLog, "id" | "timestamp"> & { timestamp?: string }
  ): Promise<OperationLog | null> {
    const { timestamp, ...rest } = input;
    if (!input.sessionId || !input.loadId) return null;

    const logs = fileRepository.getSessionLogs(input.sessionId);
    const nextId = logs.length > 0 ? logs[logs.length - 1].id + 1 : 1;

    const log: OperationLog = {
      id: nextId,
      timestamp: timestamp || new Date().toISOString(),
      ...rest,
    };
    return fileRepository.appendLog(input.sessionId, log);
  }

  getLogs(sessionId: string): OperationLog[] {
    return fileRepository.getSessionLogs(sessionId);
  }
}

export const logService = new LogService();
