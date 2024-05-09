function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const encoder = new TextEncoder();

async function* exampleIterator() {
  console.log("tick");
  yield encoder.encode("event: message\ndata: hello\n\n");
  await sleep(1000);
  console.log("tock");
  yield encoder.encode("event: message\ndata: hello\n\n");
  await sleep(1000);
  console.log("tick");
  yield encoder.encode("event: message\ndata: hello\n\n");
}

// export async function GET() {
//   const iterator = exampleIterator();
//   const stream = iteratorToStream(iterator);
//   const res = new Response(stream, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       Connection: "keep-alive",
//       "Cache-Control": "no-cache",
//     },
//   });

//   return res;
// }

// const something = () => {
//   console.log("calling event source");
//   const es = new EventSource("/api/sessions");
//   es.onmessage = (e) => {
//     console.log(e.data);
//   };
//   es.onerror = (err) => {
//     console.error("EventSource failed:", err);
//   };
//   return () => {
//     es.close();
//   };
// };

// something();
