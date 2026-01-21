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
import { SessionsResponse, SettingsResponse } from "@/utils/interfaces";
import logo from "@/utils/logo";
import { api } from "@/utils/http";
import { useDisclosure } from "@mantine/hooks";
import { SavedSessionsPicker } from "@/components/saved-sessions-picker";
import { ListSkeleton } from "@/components/list-skeleton";

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

  console.log(sessionsQuery.data);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        padding={0}
        radius="md"
      >
        <SavedSessionsPicker />
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

        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="xs">
            <Text fw={700}>Sessions</Text>

            <Group>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} stroke={1.5} />}
                onClick={open}
              >
                Add session
              </Button>
            </Group>
          </Group>
          <Divider />
          {sessionsQuery.isLoading ? (
            <ListSkeleton />
          ) : sessionsQuery.data &&
            sessionsQuery.data.data.sessions.length !== 0 ? (
            sessionsQuery.data.data.sessions.map((session) => (
              <SessionTile key={session.name} session={session}></SessionTile>
            ))
          ) : (
            <Flex align="center">
              <Text ml="lg" my="md" c="dimmed">
                Nothing is started yet?&nbsp;
              </Text>
              <Anchor onClick={open}>Start a new session.</Anchor>
            </Flex>
          )}
        </Card>
      </Container>
    </>
  );
}
