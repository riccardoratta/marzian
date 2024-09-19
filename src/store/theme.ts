import {
  DEFAULT_THEME,
  ActionIcon,
  Button,
  Checkbox,
  Card,
  Menu,
  Modal,
  HoverCard,
  MultiSelect,
  Popover,
  Select,
  Tooltip,
  createTheme,
  mergeMantineTheme,
  rem,
  getContrastColor,
  type MantineTheme,
  type MantineThemeOverride,
  type CSSVariablesResolver,
  type MantineShadow,
} from "@mantine/core";

import { createStore } from "@/utils/misc";
import { THEME_ID } from "@/constants/cookies";
import { DEFAULT_THEME_ID } from "@/constants/app";
import { stdCookieStore } from "@/utils/cookies";

type ThemeDefinition = Readonly<{
  id: string;
  label: string;
  data: Readonly<MantineTheme>;
  resolver: CSSVariablesResolver;
}>;

export interface ThemeState {
  theme: ThemeDefinition;
  themes: readonly ThemeDefinition[];
  setTheme: (themeId: ThemeDefinition["id"]) => void;
  getTheme: (themeId: ThemeDefinition["id"]) => ThemeDefinition | undefined;
}

const dominantShadow: MantineShadow = "sm";

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

    components: {
      ActionIcon: ActionIcon.extend({
        styles: ({ shadows }, { variant, disabled }) => {
          const neutralVariants: readonly (typeof variant)[] = [
            "transparent",
            "subtle",
            "light",
          ];

          if (disabled || !neutralVariants.includes(variant)) {
            return {
              root: {
                boxShadow: shadows[dominantShadow],
                ...(variant === "gradient" &&
                  !disabled && { color: "var(--app-contrast-color)" }),
              },
            };
          }

          return {};
        },
      }),

      Button: Button.extend({
        styles: ({ shadows }, { variant, disabled }) => {
          const neutralVariants: readonly (typeof variant)[] = [
            "transparent",
            "subtle",
            "light",
          ];

          if (disabled || !neutralVariants.includes(variant)) {
            return {
              root: {
                boxShadow: shadows[dominantShadow],
                ...(variant === "gradient" &&
                  !disabled && { color: "var(--app-contrast-color)" }),
              },
            };
          }

          return {};
        },
      }),

      Card: Card.extend({ defaultProps: { shadow: dominantShadow } }),
      Checkbox: Checkbox.extend({ styles: { input: { cursor: "pointer" } } }),
      HoverCard: HoverCard.extend({ defaultProps: { shadow: dominantShadow } }),

      Menu: Menu.extend({
        defaultProps: {
          trigger: "hover",
          shadow: dominantShadow,
          zIndex: 9_999,
          withArrow: true,
        },

        styles: ({ spacing }) => ({
          dropdown: { minWidth: rem(180) },
          label: { userSelect: "none" },
          item: { userSelect: "none", padding: `${rem(6)} ${spacing.xs}` },
        }),
      }),

      Modal: Modal.extend({ defaultProps: { shadow: "xl", centered: true } }),

      MultiSelect: MultiSelect.extend({
        defaultProps: { checkIconPosition: "right" },
        styles: ({ shadows }) => ({
          dropdown: { boxShadow: shadows[dominantShadow] },
        }),
      }),

      Popover: Popover.extend({ defaultProps: { shadow: dominantShadow } }),

      Select: Select.extend({
        defaultProps: { checkIconPosition: "right" },
        styles: ({ shadows }) => ({
          dropdown: { boxShadow: shadows[dominantShadow] },
        }),
      }),

      Tooltip: Tooltip.extend({
        defaultProps: { zIndex: 100_000, withArrow: true },
      }),
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
        "--app-contrast-color": getContrastColor({
          color: theme.primaryColor,
          theme,
          autoContrast: theme.autoContrast,
        }),
        ...vars.variables,
      },

      light: { ...vars.light },
      dark: { ...vars.dark },
    }),
  };
};

const themes: ThemeState["themes"] = [makeTheme(DEFAULT_THEME_ID, "marzian")];

const getDefaultTheme = (): ThemeState["theme"] =>
  themes.find(({ id }) => id === DEFAULT_THEME_ID) as ThemeState["theme"];

export const useThemeStore = createStore<ThemeState>((set, get) => ({
  theme: getDefaultTheme(),
  themes,

  setTheme: (themeId) => {
    const { theme, getTheme } = get();
    const newTheme = getTheme(themeId);

    if (!newTheme) {
      return set(() => ({ theme: getDefaultTheme() }));
    }

    if (newTheme.id === theme.id) {
      return;
    }

    stdCookieStore(THEME_ID, newTheme.id);

    set(() => ({ theme: newTheme }));
  },

  getTheme: (themeId) => get().themes.find(({ id }) => id === themeId),
}));
