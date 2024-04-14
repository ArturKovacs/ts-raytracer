import { Vec3 } from "./math";
import { Renderer } from "./renderer";
import { mustNotReach } from "./util";

console.log("Started worker thread");

export interface RenderThreadMsgInit {
    width: number;
    heigit: number;
    yStart: number;
    yEnd: number;

    // This is a slice of a larger SharedArrayBuffer that contains the entire image.
    // In this slice, only those bytes are visible that this thread should modify
    pixelSlice: Uint8ClampedArray;

    kind: "init";
}
export interface RenderThreadMsgRender {
    time: number;

    camPos: Vec3;
    camDir: Vec3;
    kind: "render";
}
export type RenderThreadMsg = RenderThreadMsgInit | RenderThreadMsgRender;

export interface RenderThreadOutput {
    yStart: number
}

let renderer: Renderer | null = null;

self.addEventListener("message", (message: MessageEvent<RenderThreadMsg>) => {
    console.log("received message in worker thread", message.data);
    if (message.data.kind == "init") {
        renderer = new Renderer(message.data.pixelSlice, message.data.yStart, message.data.yEnd);
    } else if (message.data.kind == "render") {
        renderer!.render(message.data.time, message.data.camPos, message.data.camDir);
        const msg: RenderThreadOutput = {
            yStart: renderer!.getYStart()
        };
        self.postMessage(msg);
    } else {
        mustNotReach(message.data)
    }
});

