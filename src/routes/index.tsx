import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LabApp } from "@/components/lab-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-teal">تانية بكالوريا · فيزياء</p>
        <h1 className="text-xl font-semibold">معمل الحركة التوافقية</h1>
      </main>
    );
  }
  return <LabApp />;
}
