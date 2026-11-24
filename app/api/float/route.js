import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const SHEET_ID = "1OViR_YUExh684T9MyYryYL1kvyM3lLwBi7tCbx695yc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
const SHEET_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "floats.json");

async function readLocalFloats() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalFloats(rows) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readSheetRows() {
  if (SHEET_SCRIPT_URL.startsWith("http") && SHEET_SCRIPT_URL.includes("script.google.com")) {
    try {
      const res = await fetch(SHEET_SCRIPT_URL, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.rows)) return data.rows;
    } catch {
      // fall through
    }
  }

  try {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return parseSheetCsv(await res.text());
  } catch {
    return [];
  }
}

function parseSheetCsv(csv) {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols[1]) continue;
    rows.push({
      time: cols[0] || "",
      name: cols[1] || "",
      partner: cols[2] || "",
      krathong: cols[3] || "",
      wish: cols[4] || "-"
    });
  }
  return rows.reverse();
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export async function GET() {
  const sheetRows = await readSheetRows();
  const rows = sheetRows.length ? sheetRows : (await readLocalFloats()).slice().reverse();
  return Response.json({
    ok: true,
    sheet: SHEET_URL,
    count: rows.length,
    rows
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const row = {
    time: new Date().toISOString(),
    name: String(body.name || "").trim(),
    partner: String(body.partner || "").trim(),
    krathong: String(body.krathong || "").trim(),
    wish: String(body.wish || "-").trim()
  };

  if (!row.name) {
    return Response.json({ ok: false, error: "missing name" }, { status: 400 });
  }

  const rows = await readLocalFloats();
  rows.push(row);
  await writeLocalFloats(rows);

  if (SHEET_SCRIPT_URL.startsWith("http") && SHEET_SCRIPT_URL.includes("script.google.com")) {
    try {
      await fetch(SHEET_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
        cache: "no-store"
      });
    } catch {
      // local/tmp save already attempted
    }
  }

  return Response.json({ ok: true, row, count: rows.length });
}
