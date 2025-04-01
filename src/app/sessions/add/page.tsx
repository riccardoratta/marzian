"use client";

import { api } from "@/utils/http";
import { SessionCreateRequest, sessionNameSchema } from "@/utils/interfaces";
import {
  Button,
  Card,
  Center,
  Collapse,
  Container,
  Group,
  Paper,
  Textarea,
  TextInput,
  Title,
  useComputedColorScheme,
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
import { useState } from "react";
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

  const colorScheme = useComputedColorScheme();

  const [loading, setLoading] = useState(false);

  const addSession = async (data: z.infer<typeof SessionCreateRequest>) => {
    setLoading(true);
    try {
      try {
        await api.post("/api/sessions", data);
        router.replace(`/sessions/${data.name}`);
      } catch (err) {
        if (isAxiosError(err)) {
          if (err.response && "details" in err.response.data) {
            setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container py="xl" px={0}>
      <Center mb="md">
        <Title order={3}>Add Session</Title>
      </Center>
      <Card withBorder>
        <form
          onSubmit={form.onSubmit(
            (values) =>
              void addSession({
                name: values.name,
                // Append post command if present (and replace $name)
                command: `${values.command}${
                  values.postCommand
                    ? `\n${values.postCommand.replaceAll("$name", values.name)}`
                    : ""
                }`,
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
              shadow="sm"
              style={{
                backgroundColor:
                  colorScheme === "light"
                    ? theme.colors.gray[0]
                    : theme.colors.dark[5],
              }}
            >
              <Title order={6}>Additional Settings</Title>
              <Textarea
                mt="md"
                label="Post command"
                description="Use $name to insert session name in script."
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
              onClick={() => {
                toggleAdditionalSettings();
              }}
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
