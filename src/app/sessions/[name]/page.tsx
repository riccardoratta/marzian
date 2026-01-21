"use client";

import { Session } from "@/components/session/session";
import { api } from "@/utils/http";
import type { SessionResponse } from "@/utils/interfaces";
import { useAxiosQuery } from "@caplit/axios-query";
import { Container } from "@mantine/core";
import { useParams } from "next/navigation";

export default function SessionPage() {
  const { name } = useParams<{ name: string }>();

  const { data } = useAxiosQuery<SessionResponse>({
    client: api,
    reactQuery: { queryKey: ["sessions", name] },
    axios: { url: `sessions/${name}` },
  });

  return (
    <Container py="xl" px={0} style={{ height: "100vh" }}>
      {data && <Session session={data.data} />}
    </Container>
  );
}
