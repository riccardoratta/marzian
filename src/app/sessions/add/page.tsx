"use client";

import { api } from "@/utils/http";
import { SessionCreateRequest, sessionNameSchema } from "@/utils/interfaces";
import {
  AppShell,
  Button,
  Card,
  Center,
  Group,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const testCommand =
  "for ((i=50; i>=1; i--)); do echo 'Hello'; sleep 1; done; echo 'Countdown complete!'";

export default function AddSessionPage() {
  const form = useForm({
    initialValues: {
      name: "",
      command: "",
    },
    validate: {
      name: (value) =>
        sessionNameSchema.safeParse(value).success ? null : "Invalid name",
      command: (value) => (value.length !== 0 ? null : "Invalid command"),
    },
  });

  const router = useRouter();

  const addSession = async (data: z.infer<typeof SessionCreateRequest>) => {
    try {
      await api.post("/api/sessions", data);
      router.replace(`/sessions/${data.name}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <AppShell.Main p="lg">
        <Center>
          <Title order={3}>Add Session</Title>
        </Center>
        <Card mt="md" withBorder shadow="0">
          <form onSubmit={form.onSubmit((values) => void addSession(values))}>
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
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: 12,
                  paddingTop: 8,
                },
              }}
            />
            <Group justify="flex-end" mt="md">
              <Button
                color="grey"
                onClick={() => form.setFieldValue("command", testCommand)}
              >
                Test Command
              </Button>
              <Button rightSection={<IconPlayerPlay size={14} />} type="submit">
                Submit
              </Button>
            </Group>
          </form>
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}
