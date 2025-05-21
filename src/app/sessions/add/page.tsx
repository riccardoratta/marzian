"use client";

import { api } from "@/utils/http";
import {
  SessionCreateRequest,
  SessionCreateResponse,
  sessionNameSchema,
} from "@/utils/interfaces";
import { useAxiosMutation } from "@caplit/axios-query";
import {
  Button,
  Card,
  Center,
  Container,
  Group,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconPlayerPlay } from "@tabler/icons-react";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function AddSessionPage() {
  const searchParams = useSearchParams();

  const form = useForm({
    initialValues: {
      name: searchParams.get("name") ?? "",
      command: searchParams.get("command") ?? "",
    },
    validate: {
      name: (value) =>
        sessionNameSchema.safeParse(value).success ? null : "Invalid name",
      command: (value) => (value.length !== 0 ? null : "Invalid command"),
    },
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const addSession = useAxiosMutation<
    SessionCreateResponse,
    SessionCreateRequest
  >({
    client: api,
    axios: { method: "post", url: "sessions" },
  });

  return (
    <Container py="xl" px={0}>
      <Center mb="md">
        <Title order={3}>Add Session</Title>
      </Center>
      <Card withBorder>
        <form
          onSubmit={form.onSubmit((values) => {
            setLoading(true);

            addSession
              .mutateAsync({
                session: values,
              })
              .then((response) => {
                router.replace(`/sessions/${response.data.name}`);
              })
              .catch((err: unknown) => {
                setLoading(false);

                if (isAxiosError(err)) {
                  if (err.response && "details" in err.response.data) {
                    setLoading(false);
                    return notifications.show({
                      title: "Error",
                      message: (err.response.data as { details: string })
                        .details,
                      color: "red",
                    });
                  }
                }

                notifications.show({
                  title: "Error",
                  message: "A generic error occurred, retry layer.",
                  color: "red",
                });
              });
          })}
        >
          <TextInput
            label="Name"
            description="Valid charachters are letters, numbers, and dashes."
            placeholder="example_123"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <Textarea
            mt="md"
            label="Command"
            placeholder="ls -lah home"
            key={form.key("command")}
            autosize
            minRows={1}
            {...form.getInputProps("command")}
            classNames={{ input: styles.script }}
          />

          <Group justify="flex-end" mt="md">
            <Button
              rightSection={<IconPlayerPlay size={14} />}
              type="submit"
              loading={loading}
            >
              Start
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}
