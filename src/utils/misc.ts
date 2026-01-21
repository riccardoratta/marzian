export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const TMUX_DEFAULT_COLS = 80;
export const TMUX_DEFAULT_ROWS = 40;
