const http = require("http");
const fs = require("fs");
const path = require("path");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL and remove query parameters for file serving
  const urlPath = req.url.split("?")[0];
  let filePath = "." + urlPath;

  if (filePath === "./") {
    filePath = "./index.html";
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile("./404.html", (error, content) => {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(content || "404 Not Found", "utf-8");
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end(content, "utf-8");
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
