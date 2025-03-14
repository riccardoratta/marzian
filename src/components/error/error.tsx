"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Group, Text, type ButtonProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import {
  IconReload,
  IconHome,
  IconArrowLeft,
  type IconProps,
} from "@tabler/icons-react";

import { useThemeStore } from "@/store/theme";
import { SHELL_BREAKPOINT } from "@/constants/app";
import styles from "./error.module.css";

export interface ErrorProps {
  code: string | number;
  title: string;
  message: string;
  withBackButton?: boolean;
  withHomeButton?: boolean;
  withReloadButton?: boolean;
}

const iconProps: IconProps = { size: 16 };

export const Error = ({
  code,
  title,
  message,
  withBackButton = true,
  withHomeButton = true,
  withReloadButton = true,
}: ErrorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useThemeStore((s) => s.theme.data);
  const matchesMD = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const matchesShell = useMediaQuery(
    `(max-width: ${theme.breakpoints[SHELL_BREAKPOINT]})`
  );

  const buttonProps: ButtonProps = {
    fullWidth: matchesMD,
    ...(matchesShell && { size: "xs" }),
  };

  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <Text fw={700} variant="gradient" className={styles.code}>
          {code}
        </Text>

        <Text size="xl" fw={700}>
          {title}
        </Text>

        <Text c="dimmed" size="lg" my="lg" className={styles.message}>
          {message}
        </Text>

        {(withBackButton || withHomeButton || withReloadButton) && (
          <Group justify="center" mt="xs">
            {pathname !== "/" && (
              <Fragment>
                {withBackButton && (
                  <Button
                    {...buttonProps}
                    variant="default"
                    onClick={() => {
                      router.back();
                    }}
                    leftSection={<IconArrowLeft {...iconProps} />}
                  >
                    Go back
                  </Button>
                )}

                {withHomeButton && (
                  <Button
                    {...buttonProps}
                    variant="gradient"
                    component={Link}
                    href="/"
                    leftSection={<IconHome {...iconProps} />}
                  >
                    Return to home
                  </Button>
                )}
              </Fragment>
            )}

            {withReloadButton && (
              <Button
                {...buttonProps}
                variant="subtle"
                onClick={() => {
                  router.refresh();
                }}
                leftSection={<IconReload {...iconProps} />}
              >
                Reload page
              </Button>
            )}
          </Group>
        )}
      </div>
    </div>
  );
};
