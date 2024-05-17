import { AppShell, AppShellMain, Card, Text, Title } from "@mantine/core";
import { getSessions } from "@/utils/data";
import SessionTile from "@/components/session-tile/session-tile";

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
              <SessionTile key={session.name} session={session}></SessionTile>
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
