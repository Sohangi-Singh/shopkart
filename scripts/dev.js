const { spawn } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = new Map();
let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children.values()) {
    if (child.exitCode === null) child.kill("SIGINT");
  }
  setTimeout(() => process.exit(exitCode), 1500).unref();
}

function start(label, directory) {
  const child = spawn(npmCommand, ["--prefix", directory, "run", "dev"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  children.set(label, child);
  child.on("error", (error) => {
    console.error(`[${label}] could not start: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `exit code ${code}`;
    console.error(`[${label}] stopped with ${reason}; stopping the other service.`);
    stopAll(code && code !== 0 ? code : 1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

console.log("Starting ShopKart backend and frontend. Press Ctrl+C to stop both.\n");
start("backend", "backend");
start("frontend", "frontend");
