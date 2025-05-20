"use client";

import { type Session } from "@/utils/interfaces";
import {
  Flex,
  Group,
  UnstyledButton,
  useMantineTheme,
  Text,
} from "@mantine/core";

import classes from "@/app/page.module.css";
import { formatDistance } from "date-fns";
import { IconCircle } from "@tabler/icons-react";

export default function SessionTile({ session }: { session: Session }) {
  const isActive = session.pid !== undefined;

  const theme = useMantineTheme();

  return (
    <UnstyledButton
      p="md"
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
        <Text mr="sm">
          {isActive ? `PID ${String(session.pid)}` : "Terminated"}
        </Text>
        <IconCircle
          color={isActive ? theme.colors.green[6] : theme.colors.gray[4]}
        />
      </Flex>
    </UnstyledButton>
  );
}
