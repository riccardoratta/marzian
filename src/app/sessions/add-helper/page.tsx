"use client";

import classes from "@/app/page.module.css";
import { api } from "@/utils/http";
import { SavedSessionsResponse, SessionSkeleton } from "@/utils/interfaces";
import { useAxiosQuery } from "@caplit/axios-query";
import {
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddHelperSessionpage() {
  const { isLoading, data } = useAxiosQuery<SavedSessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions", "saved"] },
    axios: { url: "sessions/saved" },
  });

  const router = useRouter();

  useEffect(() => {
    if (data) {
      if (data.data.sessions.length === 0) {
        router.replace("/sessions/add");
      }
    }
  }, [data, router]);

  return (
    <Container py="xl" px={0}>
      <Card withBorder padding={0}>
        <Group justify="space-between" px="md" py="xs">
          <Text fw={700}>Saved session</Text>
        </Group>

        <Divider />
        {isLoading ? (
          <Text>Loading..</Text>
        ) : data && data.data.sessions.length !== 0 ? (
          data.data.sessions.map((session) => (
            <SkeletonSessionTile
              key={session.name}
              session={session}
            ></SkeletonSessionTile>
          ))
        ) : (
          <Text>No saved sessins yet..</Text>
        )}
      </Card>
    </Container>
  );
}

function SkeletonSessionTile({
  session,
}: {
  session: SessionSkeleton & { active: boolean };
}) {
  return (
    <UnstyledButton p="md" className={classes.clickable} component="a">
      <Flex>
        <Group flex="1">
          <Text>{session.name}</Text>
        </Group>
      </Flex>
    </UnstyledButton>
  );
}
