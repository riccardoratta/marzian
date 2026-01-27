"use client";

import { api } from "@/utils/http";
import type {
  Session,
  SessionResponse,
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { useAxiosMutation } from "@caplit/axios-query";
import { useToggle } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import styles from "./session.module.css";
import {
  IconDownload,
  IconKeyboard,
  IconKeyboardOff,
  IconRepeat,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function Session({ session }: { session: SessionResponse }) {
  const [socket, setSocket] =
    useState<Socket<SocketServerToClientEvents, SocketClientToServerEvents>>();

  useEffect(() => {
    const s = io(`/${session.name}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s);

    return () => {
      s.close();
    };
  }, [session]);

  const terminalRef = useRef<TerminalMethods>(null);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to socket");
        terminalRef.current?.clear();
        socket.on("data", (data) => {
          console.log(`received ${String(data.length)} bytes`);
          terminalRef.current?.write(data);
        });
      });

      socket.on("connect_error", (err) => {
        console.error(err);
      });
    }
  }, [socket]);

  const [editable, toggleEditable] = useToggle([false, true]);

  const dataHandler = useCallback(
    (data: string) => {
      if (socket && editable) {
        socket.emit("write", data);
      }
    },
    [socket, editable],
  );

  const resizeHandler = useCallback(
    (cols: number, rows: number) => {
      if (socket) {
        socket.emit("resize", { rows, cols });
      }
    },
    [socket],
  );

  const deleteSession = useAxiosMutation({
    client: api,
    axios: { method: "delete", url: `sessions/${session.name}` },
  });

  const restartSession = useAxiosMutation({
    client: api,
    axios: { method: "post", url: `sessions/${session.name}/restart` },
  });

  const router = useRouter();

  return (
    <Container fluid px={0} h="100%">
      <Paper h="100%" style={{ overflow: "hidden" }}>
        <Group justify="space-between" px="md" py="xs">
          <Text fw={700}>{session.name}</Text>
          <Group gap="xs">
            <Tooltip label="Interactive">
              <ActionIcon
                size="md"
                variant="light"
                onClick={() => {
                  toggleEditable();
                }}
                color={!editable ? "gray" : undefined}
                className={styles["toolbar-button"]}
              >
                {editable ? (
                  <IconKeyboard
                    className={styles["toolbar-button-icon"]}
                    stroke={1.5}
                  />
                ) : (
                  <IconKeyboardOff
                    className={styles["toolbar-button-icon"]}
                    stroke={1.5}
                  />
                )}
              </ActionIcon>
            </Tooltip>
            <Button
              size="xs"
              variant="light"
              aria-label="Restart"
              onClick={() =>
                void restartSession.mutateAsync(null).then(() => {
                  window.location.reload();
                })
              }
              leftSection={<IconRepeat size={14} stroke={1.5} />}
            >
              Restart
            </Button>
            <ActionIcon
              size="md"
              variant="default"
              aria-label="Download session"
              className={styles["toolbar-button"]}
              component="a"
              href={`/api/sessions/${session.name}/download`}
            >
              <IconDownload
                className={styles["toolbar-button-icon"]}
                stroke={1.5}
              />
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="light"
              color="red"
              aria-label="Settings"
              onClick={() =>
                void deleteSession.mutateAsync(null).then(() => {
                  router.replace("/");
                })
              }
              className={styles["toolbar-button"]}
            >
              <IconTrash
                className={styles["toolbar-button-icon"]}
                stroke={1.5}
              />
            </ActionIcon>
          </Group>
        </Group>
        <TerminalComponent
          ref={terminalRef}
          onData={dataHandler}
          onResize={resizeHandler}
        />
      </Paper>
    </Container>
  );
}
