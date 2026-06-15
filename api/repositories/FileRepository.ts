import fs from "node:fs";
import path from "node:path";
import type {
  SessionIndexItem,
  SessionFile,
  TrainingSession,
  OperationLog,
} from "@shared/types";

export class FileRepository {
  private readonly dataDir: string;
  private readonly sessionsDir: string;
  private readonly indexPath: string;
  private readonly mutex = new Map<string, { lock: Promise<void>; release: () => void }>();

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.sessionsDir = path.join(dataDir, "sessions");
    this.indexPath = path.join(dataDir, "index.json");
    this.ensureDirs();
  }

  private ensureDirs() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
    if (!fs.existsSync(this.indexPath)) {
      fs.writeFileSync(this.indexPath, JSON.stringify([]), "utf-8");
    }
  }

  private async withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
    const existing = this.mutex.get(key);
    let release: () => void = () => {};
    const lock = existing
      ? existing.lock.then(() => new Promise<void>((r) => (release = r)))
      : new Promise<void>((r) => (release = r));
    const entry = { lock, release };
    this.mutex.set(key, entry);
    try {
      if (existing) await existing.lock;
      return await fn();
    } finally {
      release();
      setImmediate(() => {
        const cur = this.mutex.get(key);
        if (cur === entry) this.mutex.delete(key);
      });
    }
  }

  private sessionPath(id: string): string {
    return path.join(this.sessionsDir, `${id}.json`);
  }

  private readJson<T>(filePath: string, fallback: T): T {
    if (!fs.existsSync(filePath)) return fallback;
    let raw = fs.readFileSync(filePath, "utf-8");
    raw = raw.replace(/^\uFEFF/, "");
    raw = raw.trim();
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  listSessions(): SessionIndexItem[] {
    const list = this.readJson<SessionIndexItem[]>(this.indexPath, []);
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createSession(session: TrainingSession): Promise<TrainingSession> {
    return this.withLock("index", async () => {
      const file: SessionFile = { ...session, logs: [] };
      const temp = this.sessionPath(session.id) + ".tmp";
      fs.writeFileSync(temp, JSON.stringify(file, null, 2), "utf-8");
      fs.renameSync(temp, this.sessionPath(session.id));

      const list = this.listSessions();
      list.push({
        id: session.id,
        name: session.name,
        createdAt: session.createdAt,
        logCount: 0,
      });
      const indexTmp = this.indexPath + ".tmp";
      fs.writeFileSync(indexTmp, JSON.stringify(list, null, 2), "utf-8");
      fs.renameSync(indexTmp, this.indexPath);
      return session;
    });
  }

  getSession(id: string): SessionFile | null {
    const p = this.sessionPath(id);
    return this.readJson<SessionFile | null>(p, null);
  }

  async appendLog(
    sessionId: string,
    log: OperationLog
  ): Promise<OperationLog | null> {
    return this.withLock(sessionId, () => {
      const session = this.getSession(sessionId);
      if (!session) return null;
      session.logs.push(log);

      const temp = this.sessionPath(sessionId) + ".tmp";
      fs.writeFileSync(temp, JSON.stringify(session, null, 2), "utf-8");
      fs.renameSync(temp, this.sessionPath(sessionId));

      const list = this.listSessions();
      const idx = list.findIndex((s) => s.id === sessionId);
      if (idx >= 0) {
        list[idx].logCount = session.logs.length;
        const idxTmp = this.indexPath + ".tmp";
        fs.writeFileSync(idxTmp, JSON.stringify(list, null, 2), "utf-8");
        fs.renameSync(idxTmp, this.indexPath);
      }
      return log;
    });
  }

  getSessionLogs(id: string): OperationLog[] {
    const session = this.getSession(id);
    if (!session) return [];
    return session.logs.slice().sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}

export const dataDir =
  process.env.DATA_DIR ?? path.resolve(process.cwd(), "api", "data");
export const fileRepository = new FileRepository(dataDir);
