import { useEffect, useState } from "react";

import {
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  type MantineColorScheme,
} from "@mantine/core";

import { colorSchemes } from "@/store/color-scheme";

const getScheme = (value: MantineColorScheme) => {
  const colorScheme = colorSchemes.find(({ id }) => id === value);

  if (!colorScheme) {
    throw new Error("Invalid color scheme");
  }

  return colorScheme;
};

export const AppearanceController = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [scheme, setScheme] = useState(getScheme(colorScheme));

  useEffect(() => setScheme(getScheme(colorScheme)), [colorScheme]);

  return (
    <Tooltip label={scheme.label}>
      <ActionIcon
        onClick={() =>
          setColorScheme(
            colorScheme === "light"
              ? "dark"
              : colorScheme === "dark"
              ? "auto"
              : "light"
          )
        }
      >
        <scheme.icon size={14} />
      </ActionIcon>
    </Tooltip>
  );
};
