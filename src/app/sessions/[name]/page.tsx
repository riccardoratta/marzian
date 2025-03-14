import SessionClient from "./client";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <SessionClient name={name} />;
}
