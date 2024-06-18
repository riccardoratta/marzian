"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  MantineProvider,
  Container,
  type MantineColorScheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { colorSchemeManager } from "@/store/color-scheme";
import { useThemeStore } from "@/store/theme";
import { Consumer, ConsumerProvider } from "tqa";
import { api } from "@/utils/http";

export interface ProvidersProps {
  children: ReactNode;
  cookies: { colorScheme: MantineColorScheme; themeId: string };
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const consumer = new Consumer(api);

const { getTheme, setTheme } = useThemeStore.getState();

export default function Providers({ children, cookies }: ProvidersProps) {
  const { colorScheme, themeId } = cookies;
  const [loading, setLoading] = useState(true);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const themeFromServer = getTheme(themeId);

    if (themeFromServer) {
      setTheme(themeFromServer.id);
    }

    setLoading(false);
  }, [themeId]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConsumerProvider consumer={consumer}>
        {loading ? null : (
          <MantineProvider
            defaultColorScheme={colorScheme}
            colorSchemeManager={colorSchemeManager}
            theme={theme.data}
            cssVariablesResolver={theme.resolver}
          >
            <Container>{children}</Container>
            <Notifications zIndex={1000} />
          </MantineProvider>
        )}
      </ConsumerProvider>
    </QueryClientProvider>
  );
}
