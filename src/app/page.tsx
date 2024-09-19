"use client";

import {
  ActionIcon,
  Anchor,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Menu,
  rem,
  Skeleton,
  Text,
} from "@mantine/core";
import SessionTile from "@/components/session-tile/session-tile";
import { useRetrieve } from "@cappelletti/query-concierge/hooks/crud";
import { IconDots, IconPlus } from "@tabler/icons-react";
import { SessionsResponse } from "@/utils/interfaces";

export default function HomePage() {
  const { isLoading, data } = useRetrieve<"retrieve", SessionsResponse>(
    "/api/sessions",
    {
      reactQuery: { queryKey: ["sessions"] },
      axios: { method: "get" },
    }
  );

  return (
    <Container my="lg">
      <Card withBorder padding={0}>
        <Group justify="space-between" px="md" py="xs">
          <Text fw={700}>Sessions</Text>
          <Menu position="bottom-end" shadow="sm" withArrow={false}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item
                component="a"
                href="sessions/add"
                leftSection={
                  <IconPlus style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Add session
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Divider />
        {isLoading ? (
          <ListSkeleton />
        ) : data && data.response.sessions.length !== 0 ? (
          data.response.sessions.map((session) => (
            <SessionTile key={session.name} session={session}></SessionTile>
          ))
        ) : (
          <Flex align="center">
            <Text ml="lg" my="md" c="dimmed">
              Nothing is started yet?&nbsp;
            </Text>
            <Anchor href="sessions/add">Start a new session.</Anchor>
          </Flex>
        )}
      </Card>
    </Container>
  );
}

function ListSkeleton() {
  return (
    <>
      <Flex my={23.5} mx={15} gap={20}>
        <Group flex={1}>
          <Skeleton height={10} width={90} />
          <Skeleton height={10} width={80} />
        </Group>
        <Skeleton height={10} width={80} />
        <Skeleton height={10} circle mr={10} />
      </Flex>
      <Flex my={23.5} mx={15} gap={20}>
        <Group flex={1}>
          <Skeleton height={10} width={10} />
          <Skeleton height={10} width={80} />
        </Group>
        <Skeleton height={10} width={80} />
        <Skeleton height={10} circle mr={10} />
      </Flex>
    </>
  );
}
