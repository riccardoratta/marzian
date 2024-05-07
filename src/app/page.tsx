"use client";

import { useRetrieve } from "tqa/hooks/crud";
import type { SessionsResponse, Session } from "./api/sessions/route";
import {
  AppShell,
  Card,
  Text,
  Flex,
  Title,
  Group,
  useMantineTheme,
  UnstyledButton,
} from "@mantine/core";
import { formatDistance } from "date-fns";
import { IconCircle } from "@tabler/icons-react";
import classes from "./page.module.css";

export default function HomePage() {
  const { isLoading, data } = useRetrieve<"retrieve", SessionsResponse>(
    "/api/sessions",
    {
      reactQuery: { queryKey: ["sessions"] },
      axios: { method: "get" },
    }
  );

  if (isLoading) {
    return <span>Loading..</span>;
  }

  return (
    <AppShell>
      <AppShell.Main p="lg">
        <Title order={2} mb="sm">
          Sessions
        </Title>
        <Card p={0}>
          {data !== undefined && data.response.sessions.length !== 0 ? (
            data.response.sessions.map((session) => (
              <Session key={session.name} session={session}></Session>
            ))
          ) : (
            <Text c="dimmed">Nothing is started yet?</Text>
          )}
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}

function Session({ session }: { session: Session }) {
  const isActive = session.pid !== undefined;

  const theme = useMantineTheme();

  return (
    <UnstyledButton
      px="lg"
      py="md"
      className={classes.clickable}
      component="a"
      href={`sessions/${session.name}`}
    >
      <Flex>
        <Group flex="1">
          <Text>{session.name}</Text>
          <Text c="dimmed">
            {formatDistance(new Date(session.createdAt), new Date(), {
              addSuffix: true,
            })}
          </Text>
        </Group>
        <Text mr="sm">{isActive ? `PID ${session.pid}` : "Terminated"}</Text>
        <IconCircle
          color={isActive ? theme.colors.green[6] : theme.colors.gray[4]}
        />
      </Flex>
    </UnstyledButton>
  );
}
