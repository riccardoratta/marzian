"use client";

import { useRetrieve } from "tqa/hooks/crud";
import { SessionsResponse } from "./api/sessions/route";
import { useEffect } from "react";
import { AppShell, Card, Text, Flex, Title, Box } from "@mantine/core";

export default function HomePage() {
  const query = useRetrieve<"retrieve", SessionsResponse>("/api/sessions", {
    reactQuery: { queryKey: ["sessions"] },
    axios: { method: "get" },
  });

  useEffect(() => {
    console.log(query.data);
  }, [query]);

  if (query.isLoading) {
    return <span>Loading..</span>;
  }

  return (
    <AppShell>
      <AppShell.Main p="md">
        <Title order={2} mb="sm">
          Session
        </Title>
        <Card>
          {query.data?.response.sessions.map((session) => (
            <Box key={session.name} m="xs">
              <Flex onClick={() => console.log(session)}>
                <Text flex="1">{session.name}</Text>
                {session.pid ?? "Terminated"}
              </Flex>
            </Box>
          )) ?? "Nothing is started yet?"}
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}
