// Minimal online banking sample. Plain Node, no dependencies.
// Serves the SPA from ./public and a small JSON API backed by test-data/seed.json.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const SEED_PATH = process.env.SEED_PATH || path.join(__dirname, "..", "..", "test-data", "seed.json");
// Demo hook: when set, the transfer confirm button changes its test id so an
// existing suite starts failing in CI. Used to show Devin repairing locators.
const LOCATOR_DRIFT = process.env.LOCATOR_DRIFT === "1";

let db = loadSeed();

function loadSeed() {
  const raw = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  return JSON.parse(JSON.stringify(raw));
}

const sessions = new Map();

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
}

function currentUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  return sessions.get(token);
}

async function api(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/login") {
    const { username, password } = await readBody(req);
    const user = db.users.find((u) => u.username === username && u.password === password);
    if (!user) return json(res, 401, { error: "Invalid username or password" });
    if (user.locked) return json(res, 423, { error: "This account is locked. Call us to unlock it." });
    const token = `tok-${user.id}-${Date.now()}`;
    sessions.set(token, user.id);
    return json(res, 200, { token, user: { id: user.id, name: user.name } });
  }

  const userId = currentUser(req);
  if (!userId) return json(res, 401, { error: "Not signed in" });

  if (req.method === "GET" && url.pathname === "/api/accounts") {
    return json(res, 200, db.accounts.filter((a) => a.userId === userId));
  }
  const txMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/transactions$/);
  if (req.method === "GET" && txMatch) {
    const acct = db.accounts.find((a) => a.id === txMatch[1] && a.userId === userId);
    if (!acct) return json(res, 404, { error: "Account not found" });
    return json(res, 200, db.transactions.filter((t) => t.accountId === acct.id));
  }
  if (req.method === "POST" && url.pathname === "/api/transfers") {
    const { fromAccountId, toAccountId, amount, reference } = await readBody(req);
    const from = db.accounts.find((a) => a.id === fromAccountId && a.userId === userId);
    const to = db.accounts.find((a) => a.id === toAccountId);
    const value = Number(amount);
    if (!from || !to) return json(res, 400, { error: "Choose a valid account" });
    if (!(value > 0)) return json(res, 400, { error: "Enter an amount greater than zero" });
    if (value > from.balance) return json(res, 400, { error: "Insufficient funds" });
    if (value > from.dailyLimit) return json(res, 400, { error: `Daily limit is ${from.dailyLimit}` });
    from.balance -= value;
    to.balance += value;
    const id = `tx-${Date.now()}`;
    const now = new Date().toISOString().slice(0, 10);
    db.transactions.unshift({ id, accountId: from.id, date: now, description: reference || "Transfer out", amount: -value });
    db.transactions.unshift({ id: id + "-in", accountId: to.id, date: now, description: reference || "Transfer in", amount: value });
    return json(res, 201, { id, from, to });
  }
  if (req.method === "POST" && url.pathname === "/api/reset") {
    db = loadSeed();
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: "Not found" });
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/health") return json(res, 200, { ok: true, locatorDrift: LOCATOR_DRIFT });
  if (url.pathname === "/api/config") return json(res, 200, { locatorDrift: LOCATOR_DRIFT });
  if (url.pathname.startsWith("/api/")) return api(req, res, url);
  let file = url.pathname === "/" ? "/index.html" : url.pathname;
  const full = path.join(__dirname, "public", path.normalize(file));
  if (!full.startsWith(path.join(__dirname, "public")) || !fs.existsSync(full)) {
    file = "/index.html";
  }
  const target = fs.existsSync(full) ? full : path.join(__dirname, "public", "index.html");
  res.writeHead(200, { "Content-Type": MIME[path.extname(target)] || "text/plain" });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => console.log(`online-banking-web listening on http://localhost:${PORT}`));
