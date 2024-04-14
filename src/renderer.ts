import { Ray } from "./geometry";
import { Vec3, cross, dot, normalize, vecAdd, vecLen, vecMult, vecSub } from "./math";
import { HitResult, Scene } from "./scene";

const WIDTH = 800;
const HEIGHT = 500;
const ASPECT_RATIO = WIDTH / HEIGHT;
const UP: Vec3 = { x: 0, y: 1, z: 0 };

const THREAD_COUNT = 16;

export class Renderer {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected image: ImageData;
    protected scene: Scene;

    protected workers: Worker[];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        this.context = canvas.getContext("2d")!;
        this.image = this.context.createImageData(WIDTH, HEIGHT);
        this.scene = new Scene();
        this.workers = [];
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker(new URL("./render-thread.ts", import.meta.url));
            worker.addEventListener("message", (message) => {
                console.log("MAIN: " + message.data);
            })
            // worker.postMessage({ x: 13, msg: "lel" });
            this.workers.push()
        }
    }

    render(time: number) {
        this.context.clearRect(0, 0, WIDTH, HEIGHT);

        const camPos: Vec3 = { x: 0, y: 0, z: 0 };
        const camDir: Vec3 = normalize({
            x: 0,
            y: Math.sin(time * 0.001) * 0.5,
            z: 1
        });
        // Have to multiply by negative one because we are in a left handed coord system
        const camRight = vecMult(normalize(cross(camDir, UP)), -1);
        const camUp = cross(vecMult(camRight, -1), camDir);

        // This is used to divide the pixel number coordinates, so that we can produce
        // a similar looking image regardless of resolution (otherwise higher resolution
        // would cause a bigger field of view)
        const widthOrHeight = HEIGHT;

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const targetDir = normalize(
                    vecAdd(
                        vecAdd(
                            vecMult(camRight, (x / widthOrHeight) - (ASPECT_RATIO / 2)),
                            vecMult(camUp, -((y / widthOrHeight) - 0.5)),
                        ),
                        camDir
                    )
                );
                // const targetPixelWorld: Vec3 = {
                //     x: (x / wh) - (ASPECT_RATIO / 2),
                //     y: -((y / wh) - 0.5),
                //     z: 1
                // };
                const ray: Ray = {
                    dir: targetDir,
                    orig: camPos
                };

                const hitResult = this.scene.intersect(ray);
                // if (hitResult) {
                    // console.log(hitResult)
                    // debugger;
                // }
                let color;
                if (hitResult) {
                    const colorVec = this.shade(hitResult);
                    color = colorToArray(colorVec);
                } else {
                    color = [0, 0, 0, 255];
                }
                // if (x < (WIDTH / 2 + WIDTH * 0.25 * Math.sin(time * 0.001))) {
                //     color = [255, 0, 0, 255];
                // } else {
                //     color = [0, 100, 255, 255];
                // }
                this.image.data.set(color, (y * WIDTH + x) * 4);

                this.image.data.subarray()
            }
        }
        this.context.putImageData(this.image, 0, 0);
    }

    shade(surfacePoint: HitResult): Vec3 {
        const lightPos: Vec3 = {
            x: 10, 
            y: 5,
            z: 0
        };

        const toLight = vecSub(lightPos, surfacePoint.pos);
        const toLightNormalized = normalize(toLight);
        let intensity = Math.max(0, dot(toLightNormalized, surfacePoint.normal));

        const shadowRay: Ray = {
            orig: vecAdd(surfacePoint.pos, vecMult(toLightNormalized, 0.01)),
            dir: toLightNormalized
        };
        const shadowHit = this.scene.intersect(shadowRay);
        if (shadowHit && shadowHit.dist < vecLen(toLight)) {
            intensity *= 0.2;
        }
        return vecMult(surfacePoint.diffCol, intensity);
    }
}

function colorToArray(color: Vec3): [number, number, number, number] {
    return [
        color.x * 255,
        color.y * 255,
        color.z * 255,
        255
    ]
}
