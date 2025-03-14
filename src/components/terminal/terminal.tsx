import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { Card } from "@mantine/core";
import { Terminal } from "@xterm/xterm";

export interface TerminalMethods {
  writeln: (value: string) => void;
  write: (value: string) => void;
  clear: () => void;
}

const TerminalComponent = forwardRef<
  TerminalMethods,
  { onData: (data: string) => void }
>(function TerminalComponent(props, ref) {
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  const terminalRef = useRef(
    new Terminal({
      cols: 95,
      rows: 30,
    })
  );

  useEffect(() => {
    const currentRef = terminalRef.current;
    // Attach terminalRef to its container
    if (terminalContainerRef.current) {
      currentRef.open(terminalContainerRef.current);
    }
    // Set resize
    currentRef.resize(95, 30);
  }, [terminalRef, terminalContainerRef]);

  useEffect(() => {
    // Attach onData callback
    const disposable = terminalRef.current.onData((data) => {
      props.onData(data);
    });

    return () => {
      disposable.dispose();
    };
  }, [terminalRef, props]);

  useImperativeHandle(
    ref,
    () => {
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
    },
    []
  );

  return (
    <Card
      style={{
        backgroundColor: "black",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
      px="md"
      py="xs"
    >
      <div ref={terminalContainerRef} style={{ width: "100%" }}></div>
    </Card>
  );
});

export { TerminalComponent };
