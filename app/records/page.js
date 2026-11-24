"use client";

import { useEffect, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1OViR_YUExh684T9MyYryYL1kvyM3lLwBi7tCbx695yc/edit?usp=sharing";

export default function RecordsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "auto";
    document.body.style.overflow = "auto";

    fetch("/api/float")
      .then((res) => res.json())
      .then((data) => setRows(data.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        overflow: "auto",
        background: "#040312",
        color: "#fff",
        padding: "32px 18px 48px",
        fontFamily: "Prompt, sans-serif"
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#ffd54f", textDecoration: "none", fontSize: 14 }}>
          ← กลับไปลอยกระทง
        </a>
        <h1 style={{ fontSize: 28, margin: "16px 0 8px", color: "#ffd54f" }}>ใครลอยกับใคร</h1>
        <p style={{ color: "#cbd5e1", marginBottom: 20, fontSize: 14 }}>
          รายชื่อคนที่กดลอยกระทงในแอป
          {rows.length ? ` • ${rows.length} คน` : ""}
        </p>
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#7dd3fc", fontSize: 13 }}
        >
          เปิดชีต Google: รายชื่อลอย
        </a>

        {loading ? (
          <p style={{ marginTop: 28, color: "#94a3b8" }}>กำลังโหลด...</p>
        ) : rows.length === 0 ? (
          <p style={{ marginTop: 28, color: "#94a3b8" }}>ยังไม่มีคนลอยกระทง</p>
        ) : (
          <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
            {rows.map((row, i) => (
              <div
                key={`${row.time}-${i}`}
                style={{
                  background: "rgba(12, 9, 32, 0.78)",
                  border: "1px solid rgba(255, 215, 0, 0.35)",
                  borderRadius: 16,
                  padding: "14px 16px"
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd54f" }}>
                  {row.name} ลอยคู่กับ {row.partner}
                </div>
                <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 4 }}>{row.krathong}</div>
                {row.wish && row.wish !== "-" ? (
                  <div style={{ fontSize: 13, color: "#fbcfe8", marginTop: 4 }}>&quot;{row.wish}&quot;</div>
                ) : null}
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                  {row.time ? new Date(row.time).toLocaleString("th-TH") : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
