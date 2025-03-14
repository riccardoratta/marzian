import "@mantine/core/styles.css";

import "@mantine/notifications/styles.css";

import "@/app/globals.css";

import { cookies } from "next/headers";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  type MantineColorScheme,
} from "@mantine/core";

import Providers from "@/app/providers";
import { NAME, DEFAULT_COLOR_SCHEME, DEFAULT_THEME_ID } from "@/constants/app";
import { COLOR_SCHEME, THEME_ID } from "@/constants/cookies";

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: { template: `%s | ${NAME}`, default: NAME },
};

export const viewport: Viewport = {
  width: "device-width",
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();

  const colorScheme: MantineColorScheme =
    (cookieStore.get(COLOR_SCHEME)?.value as MantineColorScheme | undefined) ??
    DEFAULT_COLOR_SCHEME;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <ColorSchemeScript defaultColorScheme={colorScheme} />
      </head>

      <body>
        <Providers
          cookies={{
            colorScheme,
            themeId: cookieStore.get(THEME_ID)?.value ?? DEFAULT_THEME_ID,
          }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
