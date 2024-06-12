"use client";

import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import { api } from "@/utils/http";
import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";
import { ActionIcon, AppShell, Card, Group, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function SessionPage({ params }: { params: { name: string } }) {
  const { name } = params;

  const terminalRef = useRef<TerminalMethods>(null);

  useEffect(() => {
    const socket: Socket<
      SocketServerToClientEvents,
      SocketClientToServerEvents
    > = io(`/${name}`);

    socket.on("connect", () => {
      terminalRef.current?.clear();
      socket.on("data", (data) => {
        console.log(`received ${data.length} bytes`);
        terminalRef.current?.write(
          Buffer.from(data, "base64").toString("utf8")
        );
      });
    });

    socket.on("connect_error", (err) => {
      console.error(err);
    });

    return () => {
      socket.close();
    };
  }, [name]);

  const router = useRouter();

  const deleteSession = async () => {
    try {
      await api.delete(`/api/sessions/${name}`);
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <AppShell.Main m="lg">
        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="xs">
            <Text fw={700}>{name}</Text>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="Settings"
              onClick={() => void deleteSession()}
            >
              <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Group>
          <TerminalComponent ref={terminalRef} />
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}
