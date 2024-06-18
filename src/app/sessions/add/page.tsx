"use client";

import { api } from "@/utils/http";
import { SessionCreateRequest, sessionNameSchema } from "@/utils/interfaces";
import {
  AppShell,
  Button,
  Card,
  Center,
  Collapse,
  Group,
  Paper,
  Textarea,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowBarDown,
  IconArrowBarUp,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";

export default function AddSessionPage() {
  const form = useForm({
    initialValues: {
      name: "",
      command: "",
      postCommand: process.env.NEXT_PUBLIC_DEFAULT_POST_COMMAND,
    },
    validate: {
      name: (value) =>
        sessionNameSchema.safeParse(value).success ? null : "Invalid name",
      command: (value) => (value.length !== 0 ? null : "Invalid command"),
    },
  });

  const router = useRouter();

  const [openedAdditionalSettings, toggleAdditionalSettings] = useToggle();

  const theme = useMantineTheme();

  const addSession = async (data: z.infer<typeof SessionCreateRequest>) => {
    try {
      try {
        await api.post("/api/sessions", data);
        router.replace(`/sessions/${data.name}`);
      } catch (err) {
        if (isAxiosError(err)) {
          if (err.response && "details" in err.response.data) {
            return notifications.show({
              title: "Error",
              message: (err.response.data as { details: string }).details,
              color: "red",
            });
          }
        }

        notifications.show({
          title: "Error",
          message: "A generic error occurred, retry layer.",
          color: "red",
        });
      }
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
          <form
            onSubmit={form.onSubmit(
              (values) =>
                void addSession({
                  name: values.name,
                  command: `${values.command}\n${values.postCommand}`,
                })
            )}
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
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: 12,
                  paddingTop: 8,
                },
              }}
            />
            <Collapse in={openedAdditionalSettings} pt="1px">
              <Paper
                withBorder
                mt="md"
                p="md"
                style={{ backgroundColor: theme.colors.gray[0] }}
              >
                <Title order={6}>Additional Settings</Title>
                <Textarea
                  mt="md"
                  label="Post command"
                  key={form.key("postCommand")}
                  autosize
                  minRows={1}
                  {...form.getInputProps("postCommand")}
                  styles={{
                    input: {
                      fontFamily: "monospace",
                      fontSize: 12,
                      paddingTop: 8,
                    },
                  }}
                />
              </Paper>
            </Collapse>
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => toggleAdditionalSettings()}
                rightSection={
                  openedAdditionalSettings ? (
                    <IconArrowBarUp size={14} />
                  ) : (
                    <IconArrowBarDown size={14} />
                  )
                }
              >
                Additional settings
              </Button>
              <Button rightSection={<IconPlayerPlay size={14} />} type="submit">
                Start
              </Button>
            </Group>
          </form>
        </Card>
      </AppShell.Main>
    </AppShell>
  );
}
