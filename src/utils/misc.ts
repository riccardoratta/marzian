export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const TMUX_DEFAULT_COLS = 80;
export const TMUX_DEFAULT_ROWS = 40;

export const TERMINAL_FONT_SIZE_MD = 15;
export const TERMINAL_FONT_SIZE_SM = 12;
