import { NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

export const badRequest = (details: string) => {
  return NextResponse.json(
    {
      details,
    },
    { status: HttpStatusCode.BadRequest }
  );
};

export const notFound = (objectName = "Session") => {
  return NextResponse.json(
    {
      details: `${objectName} not found`,
    },
    { status: HttpStatusCode.NotFound }
  );
};

export const internalServerError = (error?: unknown) => {
  if (error !== undefined) console.error(error);
  return NextResponse.json(
    {
      details: `Server error`,
    },
    { status: HttpStatusCode.InternalServerError }
  );
};
