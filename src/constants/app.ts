import type { MantineColorScheme, MantineBreakpoint } from "@mantine/core";
import type { ThemeState } from "@/store/theme";

/** @see https://semver.org */
export const NAME = "Marzian";
export const DEFAULT_COLOR_SCHEME: MantineColorScheme = "auto";
export const DEFAULT_THEME_ID: ThemeState["theme"]["id"] = "app-default";
export const SHELL_BREAKPOINT: MantineBreakpoint = "sm";
