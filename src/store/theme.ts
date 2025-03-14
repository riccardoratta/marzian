import { create } from "zustand";

import {
  DEFAULT_THEME,
  createTheme,
  mergeMantineTheme,
  getContrastColor,
  type MantineTheme,
  type MantineThemeOverride,
  type CSSVariablesResolver,
} from "@mantine/core";

import { THEME_ID } from "@/constants/cookies";
import { DEFAULT_THEME_ID, NAME } from "@/constants/app";
import { stdCookieStore } from "@/utils/cookies";

type ThemeDefinition = Readonly<{
  id: string;
  label: string;
  data: Readonly<MantineTheme>;
  resolver: CSSVariablesResolver;
}>;

interface ThemeSetterOptions {
  inMemory: boolean;
}

export interface ThemeState {
  theme: ThemeDefinition;
  themes: readonly ThemeDefinition[];

  getDefaultTheme: () => ThemeState["theme"];

  getTheme: (
    themeId: ThemeState["theme"]["id"]
  ) => ThemeState["theme"] | undefined;

  setTheme: (
    themeId: ThemeState["theme"]["id"],
    options?: Partial<ThemeSetterOptions>
  ) => void;
}

const BASE_THEME: ThemeState["theme"]["data"] = mergeMantineTheme(
  DEFAULT_THEME,
  createTheme({
    autoContrast: true,

    colors: {
      /** @see https://mantine.dev/changelog/7-3-0/#improved-dark-color-scheme-colors */
      dark: [
        "#c1c2c5",
        "#a6a7ab",
        "#909296",
        "#5c5f66",
        "#373a40",
        "#2c2e33",
        "#25262b",
        "#1a1b1e",
        "#141517",
        "#101113",
      ],
    },
  })
);

const makeTheme = (
  themeId: ThemeState["theme"]["id"],
  themeName: ThemeState["theme"]["label"],
  themeData: MantineThemeOverride = {},
  resolver?: (
    theme: ThemeState["theme"]["data"]
  ) => Partial<ReturnType<ThemeState["theme"]["resolver"]>>
): ThemeState["theme"] => {
  const theme = mergeMantineTheme(BASE_THEME, createTheme(themeData));
  const vars = resolver ? resolver(theme) : {};

  return {
    id: themeId,
    label: themeName,
    data: theme,

    resolver: (theme) => ({
      variables: {
        "--app-contrast-color": getContrastColor({ color: null, theme }),
        ...vars.variables,
      },

      light: { ...vars.light },
      dark: { ...vars.dark },
    }),
  };
};

const themes: ThemeState["themes"] = [makeTheme(DEFAULT_THEME_ID, NAME)];

export const getDefaultTheme = (): ThemeState["theme"] => {
  const theme = themes.find(({ id }) => id === DEFAULT_THEME_ID);
  if (!theme) throw new Error("No default theme stored");
  return theme;
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: getDefaultTheme(),
  themes,
  getDefaultTheme,
  getTheme: (themeId) => get().themes.find(({ id }) => id === themeId),

  setTheme: (themeId, options = {}) => {
    const { getTheme } = get();
    const newTheme = getTheme(themeId);

    const theme = newTheme ?? getDefaultTheme();
    if (!options.inMemory) stdCookieStore(THEME_ID, theme.id);
    set(() => ({ theme }));
  },
}));
