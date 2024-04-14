
export interface RenderThreadMsgInit {
    width: number;
    heigit: number;
    yStart: number;
    yEnd: number;

    // This is a slice of a larger SharedArrayBuffer that contains the entire image.
    // In this slice, only those bytes are visible that this thread should modify
    pixelSlice: SharedArrayBuffer; 
}

self.addEventListener("message", (message) => {
    self.postMessage(`I'm the worker this is what I got: ${message.data.x}`);
});

