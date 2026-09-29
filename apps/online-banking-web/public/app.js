// Small hand-written SPA. data-testid attributes are the locator contract the e2e suite relies on.
const app = document.getElementById("app");
const logoutBtn = document.getElementById("logout");
let token = sessionStorage.getItem("token");
let config = { locatorDrift: false };

const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
};

const money = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

function renderLogin(error) {
  logoutBtn.hidden = true;
  app.innerHTML = `
    <section class="card" data-testid="login-page">
      <h1>Log on</h1>
      <form id="login-form">
        <label for="username">Personal ID</label>
        <input id="username" name="username" data-testid="username" autocomplete="username" />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" data-testid="password" autocomplete="current-password" />
        <button class="primary" type="submit" data-testid="login-submit">Log on</button>
        ${error ? `<p class="error" role="alert" data-testid="login-error">${error}</p>` : ""}
      </form>
    </section>`;
  document.getElementById("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      const out = await api("/api/login", { method: "POST", body: JSON.stringify({ username: f.get("username"), password: f.get("password") }) });
      token = out.token;
      sessionStorage.setItem("token", token);
      renderAccounts();
    } catch (err) {
      renderLogin(err.message);
    }
  };
}

function tabs(active) {
  return `<nav class="tabs">
    <button data-testid="tab-accounts" ${active === "accounts" ? 'aria-current="page"' : ""}>Accounts</button>
    <button data-testid="tab-transfer" ${active === "transfer" ? 'aria-current="page"' : ""}>Transfer</button>
  </nav>`;
}

function wireTabs() {
  app.querySelector('[data-testid="tab-accounts"]').onclick = renderAccounts;
  app.querySelector('[data-testid="tab-transfer"]').onclick = renderTransfer;
}

async function renderAccounts() {
  logoutBtn.hidden = false;
  const accounts = await api("/api/accounts");
  app.innerHTML = `${tabs("accounts")}
    <h1>Your accounts</h1>
    <section class="accounts" data-testid="accounts-list">
      ${accounts.map((a) => `
        <article class="card account" data-testid="account-card" data-account-id="${a.id}">
          <div class="name">${a.name} · ${a.number}</div>
          <div class="balance" data-testid="account-balance">${money(a.balance)}</div>
        </article>`).join("")}
    </section>`;
  wireTabs();
  app.querySelectorAll(".account").forEach((el) => (el.onclick = () => renderStatement(el.dataset.accountId, accounts)));
}

async function renderStatement(accountId, accounts) {
  const acct = accounts.find((a) => a.id === accountId);
  const txs = await api(`/api/accounts/${accountId}/transactions`);
  app.innerHTML = `${tabs("accounts")}
    <h1>${acct.name}</h1>
    <section class="card" data-testid="statement">
      <p class="name">Balance <strong data-testid="statement-balance">${money(acct.balance)}</strong></p>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th class="amount">Amount</th></tr></thead>
        <tbody>
          ${txs.map((t) => `<tr data-testid="transaction-row"><td>${t.date}</td><td>${t.description}</td><td class="amount ${t.amount < 0 ? "neg" : ""}">${money(t.amount)}</td></tr>`).join("")}
        </tbody>
      </table>
      <button class="link" data-testid="back-to-accounts">Back to accounts</button>
    </section>`;
  wireTabs();
  app.querySelector('[data-testid="back-to-accounts"]').onclick = renderAccounts;
}

async function renderTransfer(message) {
  const accounts = await api("/api/accounts");
  const confirmId = config.locatorDrift ? "confirm-payment" : "transfer-submit";
  const options = accounts.map((a) => `<option value="${a.id}">${a.name} (${money(a.balance)})</option>`).join("");
  app.innerHTML = `${tabs("transfer")}
    <h1>Move money</h1>
    <section class="card" data-testid="transfer-page">
      <form id="transfer-form">
        <label for="from">From</label>
        <select id="from" name="fromAccountId" data-testid="transfer-from">${options}</select>
        <label for="to">To</label>
        <select id="to" name="toAccountId" data-testid="transfer-to">${options}</select>
        <label for="amount">Amount (GBP)</label>
        <input id="amount" name="amount" inputmode="decimal" data-testid="transfer-amount" />
        <label for="reference">Reference</label>
        <input id="reference" name="reference" data-testid="transfer-reference" />
        <button class="primary" type="submit" data-testid="${confirmId}">Confirm transfer</button>
        ${message && message.error ? `<p class="error" role="alert" data-testid="transfer-error">${message.error}</p>` : ""}
        ${message && message.ok ? `<p class="success" role="status" data-testid="transfer-success">${message.ok}</p>` : ""}
      </form>
    </section>`;
  wireTabs();
  document.getElementById("transfer-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const payload = Object.fromEntries(f.entries());
    try {
      const out = await api("/api/transfers", { method: "POST", body: JSON.stringify(payload) });
      renderTransfer({ ok: `Transfer of ${money(Number(payload.amount))} sent. New balance ${money(out.from.balance)}.` });
    } catch (err) {
      renderTransfer({ error: err.message });
    }
  };
}

logoutBtn.onclick = () => {
  token = null;
  sessionStorage.removeItem("token");
  renderLogin();
};

(async () => {
  config = await fetch("/api/config").then((r) => r.json()).catch(() => config);
  if (token) {
    try { await renderAccounts(); return; } catch { token = null; }
  }
  renderLogin();
})();
