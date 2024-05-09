import type { Terminal } from "@xterm/xterm";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { Card } from "@mantine/core";

export interface TerminalMethods {
  writeln: (value: string) => void;
  clear: () => void;
}

const TerminalComponent = forwardRef<TerminalMethods>(
  function TerminalComponent(props, ref) {
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal>();

    let initMessages: string[] = [];

    useEffect(() => {
      const initTerminal = async () => {
        const { Terminal } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");

        terminalRef.current = new Terminal();

        const fitAddon = new FitAddon();

        terminalRef.current.loadAddon(fitAddon);

        if (terminalContainerRef.current) {
          terminalRef.current.open(terminalContainerRef.current);
          terminalRef.current.onRender(() => {
            fitAddon.fit();
          });
        }

        for (const message of initMessages) {
          terminalRef.current.writeln(message);
        }
        initMessages = [];
      };

      initTerminal();

      return () => {
        if (terminalRef.current) {
          terminalRef.current.dispose();
        }
      };
    }, []);

    useImperativeHandle(
      ref,
      () => {
        return {
          writeln(value: string) {
            if (value.length !== 0) {
              if (terminalRef.current) {
                terminalRef.current.writeln(value);
              } else {
                initMessages.push(value);
              }
            }
          },
          clear() {
            if (terminalRef.current) {
              terminalRef.current.clear();
            }
          },
        };
      },
      []
    );

    return (
      <Card style={{ backgroundColor: "black" }} p="md">
        <div
          ref={terminalContainerRef}
          style={{ width: "100%", height: "300px" }}
        />
      </Card>
    );
  }
);

export { TerminalComponent };
