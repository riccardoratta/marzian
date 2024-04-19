import { Error } from "@/components/error";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not found" };

export default function NotFoundPage() {
  return (
    <Error
      code={404}
      title="The page was not found."
      message="Looks like the thing you're looking for does not exist. Perhaps it was moved, or there's a typo in your URL."
    />
  );
}
