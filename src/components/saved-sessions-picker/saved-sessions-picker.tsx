"use client";

import { api } from "@/utils/http";
import { SavedSessionsResponse, SavedSession } from "@/utils/interfaces";
import { useAxiosQuery } from "@caplit/axios-query";
import {
  Center,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconChevronRight,
  IconProgressHelp,
  IconSearch,
} from "@tabler/icons-react";
import { ListSkeleton } from "@/components/list-skeleton";
import { useState } from "react";

export function SavedSessionsPicker({
  onSessionPick,
}: {
  onSessionPick: (session: SavedSession) => void;
}) {
  const { isLoading, data } = useAxiosQuery<SavedSessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions", "saved"] },
    axios: { url: "sessions/saved" },
  });

  const [search, setSearch] = useState("");

  return (
    <Stack gap={0} style={{ width: "250px", maxWidth: "250px" }}>
      <TextInput
        leftSection={<IconSearch size={16} />}
        variant="filled"
        placeholder="Search saved sessions.."
        aria-label="Search saved sessions"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <ScrollArea h={350}>
        {isLoading ? (
          <ListSkeleton />
        ) : data && data.data.sessions.length !== 0 ? (
          data.data.sessions
            .filter((session) => {
              if (search.length === 0) {
                return true;
              }

              const name = session.name.toLowerCase();

              for (const searchTerm of search.toLowerCase().split(" ")) {
                if (name.includes(searchTerm)) {
                  return true;
                }
              }

              return false;
            })
            .map((session) => (
              <NavLink
                key={session.name}
                type="button"
                label={<Text truncate="end">{session.name}</Text>}
                rightSection={
                  <IconChevronRight
                    size={12}
                    stroke={1.5}
                    className="mantine-rotate-rtl"
                  />
                }
                onClick={() => {
                  onSessionPick(session);
                }}
              />
            ))
        ) : (
          <Center m="xl">
            <Text c="dimmed" ta="center">
              <IconProgressHelp size={80} stroke={1.5} />
              <br />
              No saved sessions yet..
            </Text>
          </Center>
        )}
      </ScrollArea>
    </Stack>
  );
}
