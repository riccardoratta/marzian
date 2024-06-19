"use client";

import { TerminalComponent, TerminalMethods } from "@/components/terminal";
import { api } from "@/utils/http";
import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";
import {
  ActionIcon,
  AppShell,
  Button,
  Card,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { useHotkeys, useToggle } from "@mantine/hooks";
import {
  IconDownload,
  IconKeyboard,
  IconKeyboardOff,
  IconRepeat,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import classes from "@/app/page.module.css";

export default function SessionPage({ params }: { params: { name: string } }) {
  const { name } = params;

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
          console.log(`received ${data.length} bytes`);
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

  const deleteSession = async () => {
    try {
      await api.delete(`/api/sessions/${name}`);
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  const restartSession = async () => {
    try {
      await api.post(`/api/sessions/${name}/restart`);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  useHotkeys([["ctrl+K", () => toggleEditable()]]);

  return (
    <AppShell>
      <AppShell.Main m="lg">
        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="xs">
            <Text fw={700}>{name}</Text>
            <Group gap="xs">
              <Tooltip label="Interactive">
                <ActionIcon
                  size="md"
                  variant="light"
                  onClick={() => void toggleEditable()}
                  color={!editable ? "gray" : undefined}
                  className={classes.toolbarbutton}
                >
                  {editable ? (
                    <IconKeyboard
                      className={classes.toolbarbuttonicon}
                      stroke={1.5}
                    />
                  ) : (
                    <IconKeyboardOff
                      className={classes.toolbarbuttonicon}
                      stroke={1.5}
                    />
                  )}
                </ActionIcon>
              </Tooltip>
              <Button
                size="xs"
                variant="light"
                aria-label="Restart"
                onClick={() => void restartSession()}
                leftSection={<IconRepeat size={14} stroke={1.5} />}
              >
                Restart
              </Button>
              <ActionIcon
                size="md"
                variant="default"
                aria-label="Download session"
                className={classes.toolbarbutton}
                component="a"
                href={`/api/sessions/${name}/download`}
              >
                <IconDownload
                  className={classes.toolbarbuttonicon}
                  stroke={1.5}
                />
              </ActionIcon>
              <ActionIcon
                size="md"
                variant="light"
                color="red"
                aria-label="Settings"
                onClick={() => void deleteSession()}
                className={classes.toolbarbutton}
              >
                <IconTrash className={classes.toolbarbuttonicon} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Group>
          <TerminalComponent ref={terminalRef} onData={dataHandler} />
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}
