"use client";

import { useAxiosQuery } from "@caplit/axios-query";

import {
  Anchor,
  Button,
  Card,
  Center,
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
import { IconPlus } from "@tabler/icons-react";
import { SessionsResponse } from "@/utils/interfaces";
import logo from "@/utils/logo";
import { api } from "@/utils/http";
import { useDisclosure } from "@mantine/hooks";
import { SavedSessions } from "@/components/saved-sessions";
import { ListSkeleton } from "@/components/list-skeleton";

export default function HomePage() {
  const [opened, { open, close }] = useDisclosure(false);

  const { isLoading, data } = useAxiosQuery<SessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions"] },
    axios: { url: "sessions" },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        padding={0}
        radius="md"
      >
        <SavedSessions />
      </Modal>
      <Container py="xl" px={0}>
        <Center mb="md">
          <Stack align="center" justify="center">
            <Image src={logo} alt="Marzian logo" h={50} w={50} />
            <Title order={3} style={{ letterSpacing: 3, color: "#868e96" }}>
              MARZIAN
            </Title>
          </Stack>
        </Center>
        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="xs">
            <Text fw={700}>Sessions</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} stroke={1.5} />}
              onClick={open}
            >
              Add session
            </Button>
          </Group>
          <Divider />
          {isLoading ? (
            <ListSkeleton />
          ) : data && data.data.sessions.length !== 0 ? (
            data.data.sessions.map((session) => (
              <SessionTile key={session.name} session={session}></SessionTile>
            ))
          ) : (
            <Flex align="center">
              <Text ml="lg" my="md" c="dimmed">
                Nothing is started yet?&nbsp;
              </Text>
              <Anchor href="/sessions/add-helper">Start a new session.</Anchor>
            </Flex>
          )}
        </Card>
      </Container>
    </>
  );
}
