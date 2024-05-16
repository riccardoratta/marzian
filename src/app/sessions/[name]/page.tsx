"use client";

import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import { AppShell, Title } from "@mantine/core";
import { useRef } from "react";
import { useEffect } from "react";

export default function SessionPage({ params }: { params: { name: string } }) {
  const terminalRef = useRef<TerminalMethods>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/sessions/${params.name}`);
    eventSource.onmessage = (e) => {
      terminalRef.current?.write(
        Buffer.from(e.data as string, "base64").toString("utf8")
      );
    };
    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
    };
    return () => {
      eventSource.close();
    };
  }, [params.name]);

  return (
    <AppShell>
      <AppShell.Main m="lg">
        <Title mb="xs">{params.name}</Title>
        <TerminalComponent ref={terminalRef} />
      </AppShell.Main>
    </AppShell>
  );
}
