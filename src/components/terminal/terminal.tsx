import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Terminal } from "@xterm/xterm";
import { useElementSize } from "@mantine/hooks";
import {
  TERMINAL_FONT_SIZE_MD,
  TERMINAL_FONT_SIZE_SM,
  TMUX_DEFAULT_COLS,
  TMUX_DEFAULT_ROWS,
} from "@/utils/misc";
import "@xterm/xterm/css/xterm.css";
import { Fira_Code } from "next/font/google";
import FontFaceObserver from "fontfaceobserver";

const firaCode = Fira_Code();

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
  const { width, height, ref: terminalContainerDivRef } = useElementSize();
  const terminalDivRef = useRef<HTMLDivElement>(null);

  const terminalRef = useRef(
    new Terminal({
      cols: TMUX_DEFAULT_COLS,
      rows: TMUX_DEFAULT_ROWS,
      fontFamily: "Fira Code, Fira Code Fallback",
      fontSize: TERMINAL_FONT_SIZE_MD,
      scrollback: 0,
    }),
  );

  useEffect(() => {
    if (width > 0 && height > 0) {
      if (width < 700) {
        terminalRef.current.options.fontSize = TERMINAL_FONT_SIZE_SM;
      } else {
        terminalRef.current.options.fontSize = TERMINAL_FONT_SIZE_MD;
      }
      handleResize(height, width);
    }
  }, [height, width]);

  useEffect(() => {
    const terminal = terminalRef.current;

    const fontObserver = new FontFaceObserver("Fira Code");

    void fontObserver
      .load()
      .then(() => {
        console.log("Custom font available, load the terminal");

        // Attach terminalRef to its container
        if (terminalDivRef.current) {
          terminal.open(terminalDivRef.current);

          // Set initial size
          terminal.resize(TMUX_DEFAULT_COLS, TMUX_DEFAULT_ROWS);
        }
      })
      .catch(console.error);
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

  const handleResize = useCallback(
    (height: number, width: number) => {
      // @ts-ignore
      const charService = terminalRef.current._core._charSizeService;

      if (charService) {
        if (charService.height && charService.width) {
          const new_rows = Math.floor((height - 20) / charService.height);
          const new_cols = Math.floor((width - 20) / charService.width);
          terminalRef.current.resize(new_cols, new_rows);
          onResize(new_cols, new_rows);
        }
      }
    },
    [terminalRef, height, width],
  );

  return (
    <div
      ref={terminalContainerDivRef}
      style={{
        overflow: "hidden",
        width: "100%",
        backgroundColor: "black",
        padding: "10px",
      }}
    >
      <div ref={terminalDivRef} className={firaCode.className}></div>
    </div>
  );
});

export { TerminalComponent };
