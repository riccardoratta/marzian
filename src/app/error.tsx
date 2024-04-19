"use client";

import { Error } from "@/components/error";

export default function OhSnapPage() {
  return (
    <Error
      code="Oh snap!"
      title="Something didn't work quite well."
      message="There was an error while processing your request."
    />
  );
}
