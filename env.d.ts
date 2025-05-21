declare namespace NodeJS {
  export interface ProcessEnv {
    CONF_VER: string;
    PREV_COMMAND?: string;
    POST_COMMAND?: string;
    PORT: string;
    WORKING_DIR: string;
  }
}
