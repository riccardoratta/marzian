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
  const terminalRef = useRef<Terminal>();

  const [initBuffer, setInitBuffer] = useState<string>("");

  useEffect(() => {
    const initTerminal = () => {
      terminalRef.current = new Terminal({
        cols: 95,
        rows: 30,
      });

      if (terminalContainerRef.current) {
        terminalRef.current.open(terminalContainerRef.current);
      }

      if (initBuffer.length !== 0) {
        terminalRef.current.write(initBuffer);
      }

      terminalRef.current.resize(95, 30);

      terminalRef.current.onData((data) => {
        props.onData(data);
      });
    };

    void initTerminal();

    return () => {
      if (terminalRef.current) {
        terminalRef.current.dispose();
      }
    };
  }, [props]);

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
