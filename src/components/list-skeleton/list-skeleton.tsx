"use client";

import { Flex, Group, Skeleton } from "@mantine/core";

export function ListSkeleton() {
  return (
    <>
      <Flex my={23.5} mx={15} gap={20}>
        <Group flex={1}>
          <Skeleton height={10} width={90} />
          <Skeleton height={10} width={80} />
        </Group>
        <Skeleton height={10} width={80} />
        <Skeleton height={10} circle mr={10} />
      </Flex>
      <Flex my={23.5} mx={15} gap={20}>
        <Group flex={1}>
          <Skeleton height={10} width={10} />
          <Skeleton height={10} width={80} />
        </Group>
        <Skeleton height={10} width={80} />
        <Skeleton height={10} circle mr={10} />
      </Flex>
    </>
  );
}
