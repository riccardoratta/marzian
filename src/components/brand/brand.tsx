import { useRouter } from "next/navigation";
import { UnstyledButton, Text, rem } from "@mantine/core";

import { NAME } from "@/constants/app";

import type { DetailedHTMLProps, HTMLAttributes } from "react";

export type BrandProps = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
>;

export const Brand = (props: BrandProps) => {
  const router = useRouter();

  return (
    <div {...props}>
      <UnstyledButton onClick={() => router.push("/")}>
        <Text size={rem(24)} variant="gradient">
          {NAME}
        </Text>
      </UnstyledButton>
    </div>
  );
};
