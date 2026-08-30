import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // `extensions` lets /faq resolve to /faq.html instead of falling through to the SPA
  // shell. Both URLs then serve the same page, and each page's self-referencing
  // canonical tag tells search engines the .html form is the one to index.
  app.use(express.static(distPath, { extensions: ["html"] }));

  // Fall through to the React application shell for anything that isn't a real file.
  //
  // The client build writes the SPA shell to dist/public/index.html, and the
  // copy-html-files plugin then overwrites that filename with the static marketing
  // homepage — preserving the shell as 404.html first. So 404.html, not index.html, is
  // the shell, and it is what client-side routes (/certification, /admin, …) need here.
  // Falling back to index.html instead would serve the marketing homepage for every app
  // route and every unknown URL. The shell is marked noindex, so unknown URLs cannot be
  // indexed as duplicates of the homepage.
  const spaShell = path.resolve(distPath, "404.html");
  const fallback = fs.existsSync(spaShell)
    ? spaShell
    : path.resolve(distPath, "index.html");
  app.use("*", (_req, res) => {
    res.sendFile(fallback);
  });
}
