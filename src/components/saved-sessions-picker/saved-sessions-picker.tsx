"use client";

import { api } from "@/utils/http";
import { SavedSession, SavedSessionsResponse } from "@/utils/interfaces";
import { useAxiosQuery } from "@caplit/axios-query";
import { Center, NavLink, Text, TextInput } from "@mantine/core";
import {
  IconChevronRight,
  IconPlus,
  IconProgressHelp,
  IconSearch,
} from "@tabler/icons-react";
import { ListSkeleton } from "@/components/list-skeleton";
import { useState } from "react";
import styles from "./saved-sessions-picker.module.css";

export function SavedSessionsPicker() {
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
        classNames={{ input: styles["remove-side-border"] }}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <NavLink
        href={`/sessions/add?${String(new URLSearchParams({ name: search }))}`}
        active
        label={`Create ${search || "new"} from scratch..`}
        rightSection={
          <IconPlus size={12} stroke={1.5} className="mantine-rotate-rtl" />
        }
      />

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
            <SavedSessionTile
              key={session.name}
              session={session}
            ></SavedSessionTile>
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
