"use client";

import { api } from "@/utils/http";
import { SavedSession, SavedSessionsResponse } from "@/utils/interfaces";
import { useAxiosQuery } from "@caplit/axios-query";
import { Center, Divider, NavLink, Text, TextInput } from "@mantine/core";
import { IconChevronRight, IconPlus, IconSearch } from "@tabler/icons-react";
import { ListSkeleton } from "@/components/list-skeleton";
import { useState } from "react";
import styles from "./saved-sessions.module.css";

export function SavedSessions() {
  const { isLoading, data } = useAxiosQuery<SavedSessionsResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions", "saved"] },
    axios: { url: "sessions/saved" },
  });

  const [search, setSearch] = useState("");

  return (
    <>
      <TextInput
        leftSection={<IconSearch size={16} />}
        variant="filled"
        placeholder="Search saved sessions.."
        radius={0}
        aria-label="Search saved sessions"
        size="md"
        classNames={{ input: styles["without-outline"] }}
        onChange={(e) => {
          setSearch(e.target.value.toLowerCase());
        }}
      />

      {isLoading ? (
        <ListSkeleton />
      ) : data && data.data.sessions.length !== 0 ? (
        data.data.sessions
          .filter((session) => {
            if (search.length === 0) {
              return true;
            }

            return session.name.toLowerCase().includes(search);
          })
          .map((session) => (
            <SavedSessionTile
              key={session.name}
              session={session}
            ></SavedSessionTile>
          ))
      ) : (
        <Center>
          <Text c="dimmed">No saved sessions yet..</Text>
        </Center>
      )}
      <Divider />
      <NavLink
        href={`/sessions/add`}
        active
        label="Create new from scratch.."
        rightSection={
          <IconPlus size={12} stroke={1.5} className="mantine-rotate-rtl" />
        }
      />
    </>
  );
}

function SavedSessionTile({ session }: { session: SavedSession }) {
  return (
    <NavLink
      href={`/sessions/add?${String(
        new URLSearchParams({ name: session.name, command: session.command })
      )}`}
      label={session.name}
      rightSection={
        <IconChevronRight
          size={12}
          stroke={1.5}
          className="mantine-rotate-rtl"
        />
      }
    />
  );
}
