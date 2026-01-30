"use client";

import { useAxiosQuery } from "@caplit/axios-query";

import {
  Alert,
  Anchor,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { SessionTile } from "@/components/session-tile";
import { IconInfoCircle, IconPlus } from "@tabler/icons-react";
import {
  SavedSession,
  SavedSessionsResponse,
  SessionsResponse,
  SettingsResponse,
} from "@/utils/interfaces";
import logo from "@/utils/logo";
import { api } from "@/utils/http";
import { useDisclosure } from "@mantine/hooks";
import { ListSkeleton } from "@/components/list-skeleton";
import { useState } from "react";
import { SavedSessionTile } from "@/components/saved-session-tile";
import { AddSession } from "@/components/add-session";

export default function HomePage() {
  const [opened, { open, close }] = useDisclosure(false);

  const settingsQuery = useAxiosQuery<SettingsResponse>({
    client: api,
    reactQuery: { queryKey: ["settings"] },
    axios: { url: "settings" },
  });

  const sessionsQuery = useAxiosQuery<SessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions"] },
    axios: { url: "sessions" },
  });

  const savedSessionQuery = useAxiosQuery<SavedSessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions", "saved"] },
    axios: { url: "sessions/saved" },
  });

  const [savedSession, setSavedSession] = useState<SavedSession>();

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={savedSession ? "Start session" : "Add session"}
        size="xl"
      >
        <AddSession savedSession={savedSession} />
      </Modal>
      <Container py="xl" px={0}>
        <Stack align="left" justify="center" mb="lg" gap="xs">
          <Image src={logo} alt="Marzian logo" h={50} w={50} />
          <Title order={3} style={{ letterSpacing: 3, color: "#868e96" }}>
            MARZIAN
          </Title>
          <Text c="dimmed">{settingsQuery.data?.data.marzianDir}</Text>
          {settingsQuery.data?.data.tmuxHistoryLimit &&
            settingsQuery.data.data.tmuxHistoryLimit <= 10000 && (
              <Alert variant="light" color="yellow" icon={<IconInfoCircle />}>
                Tmux history set to {settingsQuery.data.data.tmuxHistoryLimit}{" "}
                lines.{" "}
                <a
                  href="https://tmuxai.dev/tmux-increase-scrollback/"
                  target="_blank"
                >
                  It may impact scrollback capability.
                </a>
              </Alert>
            )}
        </Stack>

        <Card p={0} withBorder shadow="md">
          <Group justify="space-between" px="md" py="xs">
            <Text fw={700}>Sessions</Text>

            <Group>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} stroke={1.5} />}
                onClick={() => {
                  setSavedSession(undefined);
                  open();
                }}
              >
                Add session
              </Button>
            </Group>
          </Group>
          <Divider />
          {sessionsQuery.isLoading && savedSessionQuery.isLoading ? (
            <ListSkeleton />
          ) : (sessionsQuery.data?.data.sessions.length ?? 0) +
              (savedSessionQuery.data?.data.sessions.length ?? 0) ===
            0 ? (
            <Flex align="center">
              <Text ml="lg" my="md" c="dimmed">
                Nothing is started yet?&nbsp;
              </Text>
              <Anchor onClick={open}>Start a new session.</Anchor>
            </Flex>
          ) : (
            [
              ...(sessionsQuery.data?.data.sessions.map((session) => (
                <SessionTile key={session.name} session={session} />
              )) ?? []),

              ...((sessionsQuery.data &&
                savedSessionQuery.data?.data.sessions
                  .filter(
                    (savedSession) =>
                      !sessionsQuery.data.data.sessions
                        .map((session) => session.name)
                        .includes(savedSession.name),
                  )
                  .map((savedSession) => (
                    <SavedSessionTile
                      key={savedSession.name}
                      savedSession={savedSession}
                      onClick={() => {
                        setSavedSession(savedSession);
                        open();
                      }}
                    />
                  ))) ??
                []),
            ]
          )}
        </Card>
      </Container>
    </>
  );
}
