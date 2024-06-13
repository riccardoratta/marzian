import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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

  const terminalRef = useRef<Terminal>(
    new Terminal({
      cols: 95,
      rows: 30,
    })
  );

  const [initBuffer, setInitBuffer] = useState<string>("");

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
            if (terminalRef.current) {
              terminalRef.current.writeln(value);
            }
          }
        },
        write(value: string) {
          if (value.length !== 0) {
            if (terminalRef.current) {
              terminalRef.current.write(value);
            } else {
              setInitBuffer(initBuffer + value);
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
    [initBuffer]
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
