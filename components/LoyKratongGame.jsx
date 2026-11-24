"use client";

import { useEffect, useRef } from "react";
import { initLoyKratongScene } from "@/lib/loyKratongScene";

export default function LoyKratongGame() {
  const apiRef = useRef({});

  useEffect(() => {
    const api = initLoyKratongScene();
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = {};
    };
  }, []);

  const call = (name, ...args) => {
    const fn = apiRef.current[name];
    if (typeof fn === "function") fn(...args);
  };

  return (
    <>
      <canvas id="canvas3d" />
      <div id="nukeFlash" />
      <div id="npcTagsContainer" />
      <div id="guyNameTag" className="char-tag hidden">
        พี่พาย
      </div>
      <div id="girlNameTag" className="char-tag girl-tag hidden">
        คุณ
      </div>
      <div id="incenseTargetRing" className="hidden" />
      <div id="floatingLabel" className="hidden" />

      <div id="step1" className="step-screen step-center">
        <div className="glass-box">
          <div style={{ fontSize: 13, color: "#ffd54f", marginBottom: 6 }}>✨ ประเพณีลอยกระทงคู่ 3D ✨</div>
          <h1>
            คืนวันเพ็ญ
            <br />
            สายน้ำแห่งศรัทธา
          </h1>
          <p className="subtitle">เลือกคู่ลอยกระทงของคุณ แล้วไปลอยกระทงด้วยกันริมท่าน้ำ</p>
          <button type="button" className="btn-gold" onClick={() => call("goToStep", 2)}>
            เริ่มต้นลอยกระทง
          </button>
        </div>
      </div>

      <div id="step2" className="step-screen step-center hidden">
        <div className="glass-box">
          <h2 style={{ fontSize: 22, color: "#ffd54f", marginBottom: 8 }}>ระบุชื่อของคุณ</h2>
          <p className="subtitle" style={{ marginBottom: 16 }}>
            ชื่อจะแสดงบนตัวละครหญิงคู่กับคนที่คุณเลือก
          </p>
          <input
            type="text"
            id="userNameInput"
            className="game-input"
            placeholder="พิมพ์ชื่อเล่น หรือ ชื่อของคุณ..."
            maxLength={30}
          />
          <button type="button" className="btn-gold" onClick={() => call("confirmName")}>
            ถัดไป : เลือกคู่ลอยกระทง
          </button>
        </div>
      </div>

      <div id="stepAvatar" className="step-screen hidden">
        <div className="top-hint">
          <div style={{ fontSize: 13, color: "#ffd54f", fontWeight: 600 }}>
            👈 ปัดซ้าย / ขวา เพื่อเลือกคนที่จะลอยด้วย 👉
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1" }}>เลือกคนที่ถูกใจแล้วกดปุ่มด้านล่าง</div>
        </div>
        <div className="glass-box" style={{ padding: "16px 18px" }}>
          <div className="carousel-nav">
            <button type="button" className="nav-arrow" onClick={() => call("slideAvatar", -1)}>
              ❮
            </button>
            <div>
              <h3 id="avatarNameTitle" style={{ fontSize: 21, color: "#38bdf8" }}>
                พี่พาย
              </h3>
              <p id="avatarPoseDesc" style={{ fontSize: 12, color: "#e2e8f0" }}>
                เสื้อฟ้า • ท่ากอดอกมาดเข้ม
              </p>
            </div>
            <button type="button" className="nav-arrow" onClick={() => call("slideAvatar", 1)}>
              ❯
            </button>
          </div>
          <button type="button" className="btn-gold" onClick={() => call("confirmAvatar")}>
            เลือกคนนี้ลอยกระทงด้วย
          </button>
        </div>
      </div>

      <div id="stepKrathong" className="step-screen hidden">
        <div className="top-hint">
          <div style={{ fontSize: 13, color: "#ffd54f", fontWeight: 600 }}>👈 ปัดซ้าย-ขวา เพื่อดูแบบกระทง 👉</div>
          <div style={{ fontSize: 12, color: "#fff" }}>
            แตะจิ้มที่ <strong>ตัวกระทง 3D</strong> เพื่อเลือกใบนี้
          </div>
        </div>
        <div className="glass-box" style={{ padding: "14px 18px" }}>
          <h3 id="kTitle" style={{ fontSize: 19, color: "#ffd54f" }}>
            กระทงใบตองพับกลีบ
          </h3>
          <p id="kDesc" style={{ fontSize: 12, color: "#e2e8f0" }}>
            ใบตองพับซ้อนกันเป็นชั้น ประดับดาวเรืองกลมๆ
          </p>
          <div className="dots" id="dotsContainer">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </div>

      <div id="stepIncense" className="step-screen hidden">
        <div className="top-hint">
          <div style={{ fontSize: 14, color: "#ff9800", fontWeight: 700 }}>🔥 แตะจิ้มที่ &quot;ปลายธูป&quot; บนกระทงเพื่อจุดไฟ</div>
          <div style={{ fontSize: 12, color: "#cbd5e1" }}>จิ้มตรงวงกลมสีส้มที่ปลายธูปทั้ง 3 ดอก</div>
        </div>
      </div>

      <div id="stepWish" className="step-screen hidden">
        <div className="glass-box">
          <div style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            🔥 จุดเทียนสำเร็จ! เปลวไฟโชติช่วง
          </div>
          <input
            type="text"
            id="userWishInput"
            className="game-input"
            placeholder="พิมพ์คำอธิษฐานคู่ของคุณ..."
            maxLength={100}
          />
          <button type="button" className="btn-gold" onClick={() => call("launchKrathong")}>
            🌊 ลอยกระทงด้วยกัน
          </button>
        </div>
      </div>

      <div id="stepFloat" className="step-screen hidden">
        <div className="glass-box" style={{ padding: 16 }}>
          <div style={{ fontSize: 18, color: "#ffd54f", fontWeight: 700, marginBottom: 4 }}>🙏 กระทงคู่กำลังลอยสู่สายน้ำ</div>
          <p id="finalSummary" style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 12 }} />
          <button
            type="button"
            className="btn-gold"
            style={{ padding: 11, fontSize: 15 }}
            onClick={() => call("resetAll")}
          >
            ลอยกระทงอีกครั้ง
          </button>
        </div>
      </div>
    </>
  );
}
