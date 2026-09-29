#!/usr/bin/env node
// Deterministic test-data generator. Produces test-data/seed.json from test-data/personas.json.
// Deterministic so a failing test can be reproduced; no production data is involved.
const fs = require("fs");
const path = require("path");

const personas = JSON.parse(fs.readFileSync(path.join(__dirname, "personas.json"), "utf8"));

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const merchants = ["Tesco", "TfL", "Pret", "Netflix", "Council tax", "Salary", "Rent", "EDF Energy", "Amazon", "Boots"];
const users = [];
const accounts = [];
const transactions = [];

personas.forEach((p, i) => {
  const rand = rng(1000 + i);
  users.push({ id: `u${i + 1}`, username: p.username, password: p.password, name: p.name, locked: !!p.locked });
  p.accounts.forEach((a, j) => {
    const id = `acc-${i + 1}-${j + 1}`;
    accounts.push({ id, userId: `u${i + 1}`, name: a.name, number: a.number, balance: a.balance, dailyLimit: a.dailyLimit ?? 5000 });
    for (let k = 0; k < (a.transactions ?? 8); k++) {
      const day = String(1 + Math.floor(rand() * 27)).padStart(2, "0");
      const merchant = merchants[Math.floor(rand() * merchants.length)];
      const credit = merchant === "Salary";
      const amount = credit ? 1800 + Math.round(rand() * 400) : -Math.round((5 + rand() * 120) * 100) / 100;
      transactions.push({ id: `tx-${id}-${k}`, accountId: id, date: `2026-09-${day}`, description: merchant, amount });
    }
  });
});

transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
const out = { generatedFrom: "test-data/personas.json", users, accounts, transactions };
fs.writeFileSync(path.join(__dirname, "seed.json"), JSON.stringify(out, null, 2));
console.log(`seed.json: ${users.length} users, ${accounts.length} accounts, ${transactions.length} transactions`);
