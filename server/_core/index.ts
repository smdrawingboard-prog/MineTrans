import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { refreshMiningNewsHandler } from "../handlers/refreshMiningNews";
import { biAssessmentHandler } from "../handlers/biAssessment";
import { biMethodologyLeadHandler } from "../handlers/biMethodologyLead";
import { getLatestBlogPosts } from "../services/blogService";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);

  // Permanent redirects for pages that have been removed, so URLs already in
  // the index or in someone's bookmarks land on the page that replaced them
  // rather than on a 404.
  const GONE: Record<string, string> = {
    "/courses.html": "/training-showcase.html",
    "/courses": "/training-showcase.html",
  };
  app.get(Object.keys(GONE), (req, res) => {
    res.redirect(301, GONE[req.path]);
  });

  // Scheduled handlers (must be before tRPC middleware)
  app.post("/api/scheduled/refreshMiningNews", refreshMiningNewsHandler);
  app.post("/api/bi-assessment/generate", biAssessmentHandler);
  app.post("/api/leads/bi-methodology", biMethodologyLeadHandler);
  app.get("/api/blog/posts", async (_req, res) => {
    const posts = await getLatestBlogPosts(12);
    res.set("Cache-Control", "public, max-age=300");
    res.json({ posts });
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
