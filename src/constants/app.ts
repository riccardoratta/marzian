import type { MantineColorScheme, MantineBreakpoint } from "@mantine/core";
import type { ThemeState } from "@/store/theme";

/** @see https://semver.org */
export const VERSION = "1.0.0";
export const NAME = "App";
export const DEFAULT_COLOR_SCHEME: MantineColorScheme = "auto";
export const DEFAULT_THEME_ID: ThemeState["theme"]["id"] = "app-default";
export const SHELL_BREAKPOINT: MantineBreakpoint = "sm";
export const PREFETCH = false;
