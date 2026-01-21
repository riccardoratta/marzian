"use client";

import { type Session } from "@/utils/interfaces";
import {
  Flex,
  Group,
  UnstyledButton,
  useMantineTheme,
  Text,
} from "@mantine/core";

import { formatDistance } from "date-fns";
import { IconCircle, IconCircleX } from "@tabler/icons-react";
import styles from "./session-tile.module.css";

export function SessionTile({ session }: { session: Session }) {
  const isActive = session.pid !== undefined;

  const theme = useMantineTheme();

  const now = new Date();

  return (
    <UnstyledButton
      p="md"
      className={styles.clickable}
      component="a"
      href={`/sessions/${session.name}`}
    >
      <Flex>
        <Group flex="1">
          <Text>{session.name}</Text>
          {session.createdAt && (
            <Text c="dimmed">
              {formatDistance(session.createdAt, now, {
                addSuffix: true,
              })}
            </Text>
          )}
        </Group>
        {session.errorAt ? (
          <Text mr="sm" c={theme.colors.red[9]}>
            Error {formatDistance(session.errorAt, now, { addSuffix: true })}
          </Text>
        ) : (
          <Text mr="sm">
            {isActive ? `PID ${String(session.pid)}` : "Terminated"}
          </Text>
        )}
        {session.errorAt ? (
          <IconCircleX color={theme.colors.red[8]} />
        ) : (
          <IconCircle
            color={isActive ? theme.colors.green[6] : theme.colors.gray[4]}
          />
        )}
      </Flex>
    </UnstyledButton>
  );
}
