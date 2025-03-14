import {
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  type MantineColorScheme,
} from "@mantine/core";

import { colorSchemes } from "@/store/color-scheme";

const getScheme = (value: MantineColorScheme) => {
  const colorScheme = colorSchemes.find(({ id }) => id === value);
  if (!colorScheme) throw new Error("Invalid color scheme");
  return colorScheme;
};

export const AppearanceController = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const scheme = getScheme(colorScheme);

  return (
    <Tooltip label={scheme.label}>
      <ActionIcon
        onClick={() => {
          const currentIndex = colorSchemes.findIndex(
            (s) => s.id === scheme.id
          );

          if (currentIndex > -1) {
            setColorScheme(
              colorSchemes[
                currentIndex === colorSchemes.length - 1 ? 0 : currentIndex + 1
              ].id
            );
          }
        }}
      >
        <scheme.icon size={14} />
      </ActionIcon>
    </Tooltip>
  );
};
