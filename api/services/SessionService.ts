import { v4 as uuidv4 } from "uuid";
import type {
  TrainingSession,
  TransformerArea,
  LoadBlock,
  SessionIndexItem,
  SessionFile,
} from "@shared/types";
import { fileRepository } from "../repositories/FileRepository.js";
import { DEFAULT_AREAS, DEFAULT_LOADS } from "../../shared/initialData.js";

export class SessionService {
  createSession(
    payload: Partial<{
      name: string;
      areas: TransformerArea[];
      initialLoads: LoadBlock[];
    }> = {}
  ): TrainingSession {
    const id = uuidv4();
    const name =
      payload.name?.trim() ||
      `演练会话 · ${new Date().toLocaleString("zh-CN", { hour12: false })}`;
    const areas = payload.areas && payload.areas.length > 0 ? payload.areas : DEFAULT_AREAS;
    const initialLoads =
      payload.initialLoads && payload.initialLoads.length > 0
        ? payload.initialLoads
        : DEFAULT_LOADS;

    const session: TrainingSession = {
      id,
      name,
      createdAt: new Date().toISOString(),
      areas,
      initialLoads,
    };
    return session;
  }

  async saveSession(session: TrainingSession): Promise<TrainingSession> {
    return fileRepository.createSession(session);
  }

  listSessions(): SessionIndexItem[] {
    return fileRepository.listSessions();
  }

  getSession(id: string): SessionFile | null {
    return fileRepository.getSession(id);
  }
}

export const sessionService = new SessionService();
