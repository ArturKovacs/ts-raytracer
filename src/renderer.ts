
const WIDTH = 500;
const HEIGHT = 500;

export class Renderer {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected image: ImageData;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        this.context = canvas.getContext("2d")!;
        this.image = this.context.createImageData(WIDTH, HEIGHT);
    }

    render(time: number) {
        this.context.clearRect(0, 0, WIDTH, HEIGHT);

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                let color;
                if (x < (WIDTH / 2 + WIDTH * 0.25 * Math.sin(time * 0.001))) {
                    color = [255, 0, 0, 255];
                } else {
                    color = [0, 100, 255, 255];
                }
                this.image.data.set(color, (y * WIDTH + x) * 4);
            }
        }
        this.context.putImageData(this.image, 0, 0);
    }
}
