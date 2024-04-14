import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { HEIGHT, Renderer, WIDTH } from './renderer.ts'
import { RenderThreadMsg, RenderThreadOutput } from './render-thread.ts';
import { Vec3, normalize } from './math.ts';

const BYTES_PER_PIXEL = 4;

const canvas = document.querySelector("#render-out") as HTMLCanvasElement;
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext("2d")!;
const image = context.createImageData(WIDTH, HEIGHT);

const sharedPixelsBuffer = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
const sharedPixelsView = new Uint8ClampedArray(sharedPixelsBuffer);

const THREAD_COUNT = 16;

const finishedWithFrame = new Set<number>();
const workers: Worker[] = [];
const yStartFromThreadIndex = (threadIndex: number) => Math.floor((threadIndex / THREAD_COUNT) * HEIGHT);
for (let i = 0; i < THREAD_COUNT; i++) {
    const worker = new Worker(new URL("./render-thread.ts", import.meta.url), { type: "module" });
    const yStart = yStartFromThreadIndex(i);
    const yEnd = yStartFromThreadIndex(i + 1);

    const initMessage: RenderThreadMsg = {
      kind: "init",
      heigit: HEIGHT,
      width: WIDTH,
      pixelSlice: sharedPixelsView.subarray(
        yStart * WIDTH * BYTES_PER_PIXEL,
        yEnd * WIDTH * BYTES_PER_PIXEL
      ),
      yStart,
      yEnd
    };
    worker.postMessage(initMessage);

    worker.addEventListener("message", (event: MessageEvent<RenderThreadOutput>) => {
        finishedWithFrame.add(event.data.yStart);
        console.log("received render done for", event.data.yStart)
        if (finishedWithFrame.size == THREAD_COUNT) {
          // debugger;
          // We are done with rendering.
          // Let's copy the pixels to the canvas.
          context.clearRect(0, 0, WIDTH, HEIGHT);
          image.data.set(sharedPixelsView);
          context.putImageData(image, 0, 0);
          requestAnimationFrame(render)
        }
    })
    workers.push(worker)
}

function render(time: number) {
  const camPos: Vec3 = { x: 0, y: 0, z: 0 };
  const camDir: Vec3 = normalize({
    x: 0,
    y: Math.sin(time * 0.0005) * 0.2,
    z: 1
  });
  const msg: RenderThreadMsg = {
    camDir,
    camPos,
    time,
    kind: "render"
  }
  finishedWithFrame.clear();
  for (const worker of workers) {
    console.log("sent render request")
    worker.postMessage(msg);
  }
}

render(0);
