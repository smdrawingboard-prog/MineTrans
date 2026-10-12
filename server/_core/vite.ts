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

  // `extensions` lets /faq resolve to faq.html, matching the extensionless links
  // some pages use while the canonical URLs stay on the .html form.
  app.use(express.static(distPath, { extensions: ["html"] }));

  // The build overwrites dist/public/index.html with the static marketing homepage
  // and preserves the React SPA shell as 404.html (see vitePluginCopyHtmlFiles).
  // Falling back to index.html would therefore serve the marketing page for every
  // client-side route (/certification, /admin, ...) and make the app unreachable.
  const spaShell = path.resolve(distPath, "404.html");
  const fallback = fs.existsSync(spaShell)
    ? spaShell
    : path.resolve(distPath, "index.html");

  // Only the React app's own routes get a 200 from the SPA shell. Anything else
  // is a genuine miss: answer 404 (the shell still renders its NotFound view for
  // people) so Google doesn't treat every made-up URL as a live page ("soft 404").
  const SPA_ROUTE = /^\/(certification(\/|$)|404\/?$)/;
  app.use("*", (req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    // app.use("*") strips the mount path from req.path, so test the full URL.
    const urlPath = req.originalUrl.split("?")[0];
    res
      .status(SPA_ROUTE.test(urlPath) ? 200 : 404)
      .sendFile(fallback, err => {
        if (err && !res.headersSent) {
          res.status(404).type("text/plain").send("Not found");
        }
      });
  });
}
