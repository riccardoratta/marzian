import { api } from "@/utils/http";
import {
  SavedSession,
  SessionCreateRequest,
  SessionCreateResponse,
  sessionNameSchema,
} from "@/utils/interfaces";
import { useAxiosMutation } from "@caplit/axios-query";
import { Button, Textarea, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./add-session.module.css";

export function AddSession({ savedSession }: { savedSession?: SavedSession }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addSession = useAxiosMutation<
    SessionCreateResponse,
    SessionCreateRequest
  >({
    client: api,
    axios: { method: "post", url: "sessions" },
  });

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

  useEffect(() => {
    if (savedSession) {
      form.setValues(savedSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSession]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        setLoading(true);

        addSession
          .mutateAsync({
            session: values,
          })
          .then((response) => {
            router.push(`/sessions/${response.data.name}`);
          })
          .catch((err: unknown) => {
            setLoading(false);

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
          });
      })}
    >
      <TextInput
        label="Name"
        placeholder="example_123"
        key={form.key("name")}
        {...form.getInputProps("name")}
      />
      <Text size="xs" c="dimmed" style={{ marginTop: "5px" }}>
        Valid charachters are letters, numbers, and dashes.
      </Text>
      <Textarea
        mt="md"
        label="Command"
        placeholder="ls -lah home"
        key={form.key("command")}
        autosize
        minRows={3}
        {...form.getInputProps("command")}
        classNames={{ input: styles.script }}
      />

      <Button
        mt="md"
        type="submit"
        loading={loading}
        fullWidth
        disabled={
          form.getValues().name.length === 0 ||
          form.getValues().command.length === 0
        }
      >
        Start
      </Button>
    </form>
  );
}
