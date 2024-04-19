import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

import { PREFETCH } from "@/constants/app";

export type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: ReactNode;
  };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    {
      /**
       * Turn next/link prefetching off by default.
       * @see https://github.com/vercel/next.js/discussions/24009
       */
      prefetch = PREFETCH,
      ...props
    },
    ref
  ) {
    return <NextLink prefetch={prefetch} {...props} ref={ref} />;
  }
);
