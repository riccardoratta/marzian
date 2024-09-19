import { Cookies } from "react-cookie";

import {
  IconSun,
  IconMoon,
  IconBrightness,
  type Icon,
} from "@tabler/icons-react";

import { COLOR_SCHEME } from "@/constants/cookies";
import { stdCookieStore } from "@/utils/cookies";

import type {
  MantineColorScheme,
  MantineColorSchemeManager,
} from "@mantine/core";

type ColorSchemeDefinition = Readonly<{
  id: MantineColorScheme;
  icon: Icon;
  label: string;
}>;

export const colorSchemes: readonly ColorSchemeDefinition[] = [
  { id: "light", label: "Light", icon: IconSun },
  { id: "dark", label: "Dark", icon: IconMoon },
  { id: "auto", label: "Auto", icon: IconBrightness },
];

const CookieColorSchemeManager = (): MantineColorSchemeManager => {
  const cookieStore = new Cookies();

  const getCurrentValue = (): MantineColorScheme | undefined =>
    cookieStore.get(COLOR_SCHEME) as MantineColorScheme | undefined;

  return {
    get: (defaultValue) => getCurrentValue() || defaultValue,

    set: (value) => {
      const currentValue = getCurrentValue();

      if (currentValue === value) {
        return;
      }

      stdCookieStore(COLOR_SCHEME, value);
    },

    clear: () => cookieStore.remove(COLOR_SCHEME),
    subscribe: () => undefined,
    unsubscribe: () => undefined,
  };
};

export const colorSchemeManager = CookieColorSchemeManager();
