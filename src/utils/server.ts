import { NextResponse } from "next/server";

export const badRequest = (details: string) => {
  return NextResponse.json(
    {
      details,
    },
    { status: 400 }
  );
};

export const notFound = (objectName = "Session") => {
  return NextResponse.json(
    {
      details: `${objectName} not found`,
    },
    { status: 404 }
  );
};

export const InternalServerError = (error?: unknown) => {
  if (error !== undefined) console.error(error);
  return NextResponse.json(
    {
      details: `Server error`,
    },
    { status: 500 }
  );
};
