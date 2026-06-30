const http = require("http");
const fs = require("fs");
const path = require("path");
const agentChat = require("./api/agent-chat.js");

const root = __dirname;
const port = Number(process.env.PORT || 4175);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) return "";
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    return path.join(filePath, "index.html");
  }
  return filePath;
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith("/api/agent-chat")) {
    agentChat(req, res);
    return;
  }
  sendFile(res, resolveFile(req.url || "/"));
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}/`);
});
