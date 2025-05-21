"use client";

import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import { api } from "@/utils/http";
import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import {
  IconDownload,
  IconKeyboard,
  IconKeyboardOff,
  IconRepeat,
  IconTrash,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAxiosMutation } from "@caplit/axios-query";
import styles from "./page.module.css";

export default function SessionPage() {
  const { name } = useParams<{ name: string }>();

  const terminalRef = useRef<TerminalMethods>(null);

  const [socket, setSocket] =
    useState<Socket<SocketServerToClientEvents, SocketClientToServerEvents>>();

  const [editable, toggleEditable] = useToggle([false, true]);

  useEffect(() => {
    const s = io(`/${name}`);
    setSocket(s);

    return () => {
      s.close();
    };
  }, [name]);

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

  const dataHandler = useCallback(
    (data: string) => {
      if (socket && editable) {
        socket.emit("write", data);
      }
    },
    [socket, editable]
  );

  const router = useRouter();

  const deleteSession = useAxiosMutation({
    client: api,
    axios: { method: "delete", url: `sessions/${name}` },
  });

  const restartSession = useAxiosMutation({
    client: api,
    axios: { method: "post", url: `sessions/${name}/restart` },
  });

  return (
    <Container py="xl" px={0}>
      <Card withBorder padding={0}>
        <Group justify="space-between" px="md" py="xs">
          <Text fw={700}>{name}</Text>
          <Group gap="xs">
            <Tooltip label="Interactive">
              <ActionIcon
                size="md"
                variant="light"
                onClick={() => {
                  toggleEditable();
                }}
                color={!editable ? "gray" : undefined}
                className={styles.toolbarbutton}
              >
                {editable ? (
                  <IconKeyboard
                    className={styles.toolbarbuttonicon}
                    stroke={1.5}
                  />
                ) : (
                  <IconKeyboardOff
                    className={styles.toolbarbuttonicon}
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
              className={styles.toolbarbutton}
              component="a"
              href={`/api/sessions/${name}/download`}
            >
              <IconDownload className={styles.toolbarbuttonicon} stroke={1.5} />
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
              className={styles.toolbarbutton}
            >
              <IconTrash className={styles.toolbarbuttonicon} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>

        <TerminalComponent ref={terminalRef} onData={dataHandler} />
      </Card>
    </Container>
  );
}
