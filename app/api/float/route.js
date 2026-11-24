import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "floats.json");
const SHEET_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

async function readFloats() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFloats(rows) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function GET() {
  const rows = await readFloats();
  return Response.json({
    ok: true,
    sheet: "https://docs.google.com/spreadsheets/d/1OViR_YUExh684T9MyYryYL1kvyM3lLwBi7tCbx695yc/edit?usp=sharing",
    count: rows.length,
    rows: rows.slice().reverse()
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

  const rows = await readFloats();
  rows.push(row);
  await writeFloats(rows);

  if (SHEET_SCRIPT_URL.startsWith("http") && SHEET_SCRIPT_URL.includes("script.google.com")) {
    try {
      await fetch(SHEET_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row)
      });
    } catch {
      // local save already succeeded
    }
  }

  return Response.json({ ok: true, row, count: rows.length });
}
