declare namespace NodeJS {
  export interface ProcessEnv {
    CONF_VER: string;
    DEFAULT_SHELL: string;
    NEXT_PUBLIC_DEFAULT_POST_COMMAND?: string;
    PORT: string;
  }
}
