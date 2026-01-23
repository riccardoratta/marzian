"use client";

import { type SavedSession } from "@/utils/interfaces";
import { Flex, Group, UnstyledButton, Text } from "@mantine/core";

import styles from "./saved-session-tile.module.css";
import { MouseEventHandler } from "react";

export function SavedSessionTile({
  savedSession,
  onClick,
}: {
  savedSession: SavedSession;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <UnstyledButton p="md" className={styles.clickable} onClick={onClick}>
      <Flex>
        <Group flex="1">
          <Text>{savedSession.name}</Text>
        </Group>
      </Flex>
    </UnstyledButton>
  );
}
