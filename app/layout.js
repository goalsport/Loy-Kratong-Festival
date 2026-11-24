import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "600", "700"]
});

export const metadata = {
  title: "ลอยกระทงคู่ 3D ออนไลน์ 2569",
  description: "ประเพณีลอยกระทงคู่ 3D — เลือกคู่ลอยกระทง แล้วไปลอยกระทงด้วยกันริมท่าน้ำ"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={prompt.className}>{children}</body>
    </html>
  );
}
