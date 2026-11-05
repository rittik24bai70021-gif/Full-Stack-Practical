import http from "node:http";
import { readFile } from "node:fs/promises";
const files = {
  "/": ["index.html", "text/html"],
  "/app.js": ["app.js", "text/javascript"],
  "/styles.css": ["styles.css", "text/css"],
};
http
  .createServer(async (req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    const f =
      files[path] ||
      (/^\/assets\/book-\d+\.jpg$/.test(path)
        ? [path.slice(1), "image/jpeg"]
        : null);
    if (!f) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      res.setHeader("Content-Type", f[1]);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(await readFile(new URL(f[0], import.meta.url)));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(5173, "127.0.0.1", () =>
    console.log("Open BookVerse: http://localhost:5173"),
  );
