"use client";

import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import type { SessionResponse } from "@/app/api/sessions/[name]/route";
import { useRetrieve } from "tqa/hooks/crud";
import { AppShell, Title } from "@mantine/core";
import { useRef } from "react";
import { useEffect } from "react";

export default function SessionPage({ params }: { params: { name: string } }) {
  const terminalRef = useRef<TerminalMethods>(null);

  const { isLoading, data } = useRetrieve<"retrieve", SessionResponse>(
    `/api/sessions/${params.name}`,
    {
      reactQuery: { queryKey: ["sessions", params.name] },
      axios: { method: "get" },
    }
  );

  useEffect(() => {
    console.log(data);
    if (data && terminalRef.current) {
      for (const line of data.response.lines) {
        console.log("writing line", line);
        terminalRef.current.writeln(line);
      }
    }
  }, [data]);

  if (isLoading) {
    return <span>Loading..</span>;
  }

  return (
    <AppShell>
      <AppShell.Main m="lg">
        <Title mb="xs">{params.name}</Title>
        <TerminalComponent ref={terminalRef} />
      </AppShell.Main>
    </AppShell>
  );
}
