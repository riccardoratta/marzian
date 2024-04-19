import "@mantine/core/styles.css";
import "@/app/globals.css";

import { cookies } from "next/headers";
import { ColorSchemeScript, type MantineColorScheme } from "@mantine/core";

import Providers from "@/app/providers";
import { NAME, DEFAULT_COLOR_SCHEME, DEFAULT_THEME_ID } from "@/constants/app";
import { COLOR_SCHEME, THEME_ID } from "@/constants/cookies";

import type { ReactNode } from "react";
import type { Metadata } from "next";

export interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: { template: `%s | ${NAME}`, default: NAME },
};

export default function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = cookies();

  // Color scheme
  let initialColorScheme: MantineColorScheme = DEFAULT_COLOR_SCHEME;

  const cachedColorScheme = cookieStore.get(COLOR_SCHEME)?.value as
    | MantineColorScheme
    | undefined;

  if (cachedColorScheme) {
    initialColorScheme = cachedColorScheme;
  }

  // Theme
  let initialThemeId: string = DEFAULT_THEME_ID;

  const cachedThemeId = cookieStore.get(THEME_ID)?.value;

  if (cachedThemeId) {
    initialThemeId = cachedThemeId;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />

        <ColorSchemeScript defaultColorScheme={initialColorScheme} />
      </head>

      <body>
        <Providers
          cookies={{ colorScheme: initialColorScheme, themeId: initialThemeId }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
