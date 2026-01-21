import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import "@xterm/xterm/css/xterm.css";
import { Card } from "@mantine/core";
import { Terminal } from "@xterm/xterm";
import { useElementSize } from "@mantine/hooks";
import { TMUX_DEFAULT_COLS, TMUX_DEFAULT_ROWS } from "@/utils/misc";

export interface TerminalMethods {
  writeln: (value: string) => void;
  write: (value: string) => void;
  clear: () => void;
}

const TerminalComponent = forwardRef<
  TerminalMethods,
  {
    onData: (data: string) => void;
    onResize: (cols: number, rows: number) => void;
  }
>(function TerminalComponent({ onData, onResize }, ref) {
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  const terminalRef = useRef(
    new Terminal({ cols: TMUX_DEFAULT_COLS, rows: TMUX_DEFAULT_ROWS }),
  );

  const { width, height, ref: terminalSizeObserver } = useElementSize();

  useEffect(() => {
    const terminal = terminalRef.current;

    // Attach terminalRef to its container
    if (terminalContainerRef.current) {
      terminal.open(terminalContainerRef.current);

      // Set resize
      terminal.resize(TMUX_DEFAULT_COLS, TMUX_DEFAULT_ROWS);
    }
  }, []);

  useEffect(() => {
    // Attach onData callback
    const disposable = terminalRef.current.onData((data) => {
      onData(data);
    });

    return () => {
      disposable.dispose();
    };
  }, [terminalRef, onData]);

  useImperativeHandle(ref, () => {
    return {
      writeln(value: string) {
        if (value.length !== 0) {
          terminalRef.current.writeln(value);
        }
      },
      write(value: string) {
        if (value.length !== 0) {
          terminalRef.current.write(value);
        }
      },
      clear() {
        terminalRef.current.clear();
      },
    };
  }, []);

  const resize = useCallback(
    (cols: number, rows: number) => {
      terminalRef.current.resize(cols, rows);
      onResize(cols, rows);
    },
    [onResize],
  );

  useEffect(() => {
    console.log(height);

    const new_cols = Math.floor(width / 9.35);
    const new_rows = Math.floor(height / 17.25);

    const terminal = terminalRef.current;

    if (terminal.cols !== new_cols && new_cols !== 0) {
      resize(new_cols, terminal.rows);
    }

    if (terminal.rows !== new_rows && new_rows !== 0) {
      resize(terminal.cols, new_rows);
    }
  }, [width, height, resize]);

  return (
    <Card
      ref={terminalSizeObserver}
      style={{
        backgroundColor: "black",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        height: "100%",
      }}
      px="md"
      py="xs"
    >
      <div
        ref={terminalContainerRef}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </Card>
  );
});

export { TerminalComponent };
