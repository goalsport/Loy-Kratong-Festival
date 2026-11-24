"use client";

import dynamic from "next/dynamic";

const LoyKratongGame = dynamic(() => import("@/components/LoyKratongGame"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "#040312" }} />
});

export default function Home() {
  return <LoyKratongGame />;
}
