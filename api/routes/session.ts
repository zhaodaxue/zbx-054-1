import { Router, type Request, type Response } from "express";
import { sessionService } from "../services/SessionService.js";
import { logService } from "../services/LogService.js";

const router = Router();

router.post("/session", async (req: Request, res: Response) => {
  try {
    const { name, areas, initialLoads } = req.body || {};
    const model = sessionService.createSession({ name, areas, initialLoads });
    const saved = await sessionService.saveSession(model);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Create session failed",
    });
  }
});

router.get("/sessions", (_req: Request, res: Response) => {
  try {
    res.json(sessionService.listSessions());
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "List sessions failed",
    });
  }
});

router.get("/session/:id", (req: Request, res: Response) => {
  try {
    const session = sessionService.getSession(req.params.id);
    if (!session) {
      res.status(404).json({ success: false, error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Get session failed",
    });
  }
});

router.post("/log", async (req: Request, res: Response) => {
  try {
    const saved = await logService.appendLog(req.body || {});
    if (!saved) {
      res.status(400).json({ success: false, error: "Invalid log payload" });
      return;
    }
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Append log failed",
    });
  }
});

router.get("/log/session/:id", (req: Request, res: Response) => {
  try {
    const logs = logService.getLogs(req.params.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Get logs failed",
    });
  }
});

export default router;
