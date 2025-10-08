#!/usr/bin/env node

/** This server is for local dev on the sandbox */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = 3000;
const ROOT_DIR = __dirname;

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json",
};

// Build the project first
console.log("Building project...");
exec("npm run build", (error, stdout, stderr) => {
  if (error) {
    console.error("Build failed:", error);
    return;
  }
  console.log("Build completed successfully");

  // Start the server
  const server = http.createServer((req, res) => {
    let filePath = path.join(
      ROOT_DIR,
      req.url === "/" ? "sandbox.html" : req.url
    );

    // Security check
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === "ENOENT") {
          res.writeHead(404);
          res.end("File not found");
        } else {
          res.writeHead(500);
          res.end("Server error: " + error.code);
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 Chronos Timeline Sandbox running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📝 Edit sandbox.html to modify the playground`);
    console.log(`🔧 Run 'npm run build' after changing source files\n`);
  });
});
