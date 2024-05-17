import {
  AppShell,
  AppShellMain,
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
import { type Session, getSessions } from "@/utils/data";

export default function HomePage() {
  const sessions = getSessions();

  return (
    <AppShell>
      <AppShellMain p="lg">
        <Title order={2} mb="sm">
          Sessions
        </Title>
        <Card p={0} withBorder>
          {sessions.length !== 0 ? (
            sessions.map((session) => (
              <Session key={session.name} session={session}></Session>
            ))
          ) : (
            <Text px="lg" py="md" c="dimmed">
              Nothing is started yet?
            </Text>
          )}
        </Card>
      </AppShellMain>
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
          {session.createdAt && (
            <Text c="dimmed">
              {formatDistance(new Date(session.createdAt), new Date(), {
                addSuffix: true,
              })}
            </Text>
          )}
        </Group>
        <Text mr="sm">{isActive ? `PID ${session.pid}` : "Terminated"}</Text>
        <IconCircle
          color={isActive ? theme.colors.green[6] : theme.colors.gray[4]}
        />
      </Flex>
    </UnstyledButton>
  );
}
