declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_VERSION: string;
    PORT: string;
    WORKING_DIR: string;
    NTFY_CHANNEL: string;
  }
}

// eslint-disable-next-line no-var
var sourceDir: string;
