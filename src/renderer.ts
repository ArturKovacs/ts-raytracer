import { Ray } from "./geometry";
import { Vec3, cross, dot, normalize, reflect, vecAdd, vecLen, vecMult, vecSub } from "./math";
import { HitResult, Scene } from "./scene";

export const WIDTH = 800;
export const HEIGHT = 500;
const ASPECT_RATIO = WIDTH / HEIGHT;
const UP: Vec3 = [ 0, 1, 0 ];

const MAX_RAY_DEPTH = 3;

const BG_COLOR: Vec3 = [0, 0, 0];

export class Renderer {
    protected scene: Scene;
    protected yStart: number;
    protected yEnd: number; // the row index immediately after the last row that we should render
    protected pixelSlice: Uint8ClampedArray;

    constructor(pixelSlice: Uint8ClampedArray, yStart: number, yEnd: number) {
        this.scene = new Scene();
        this.pixelSlice = pixelSlice;
        this.yStart = yStart;
        this.yEnd = yEnd;
    }

    getYStart(): number {
        return this.yStart;
    }

    render(time: number, camPos: Vec3, camDir: Vec3) {
        // this.pixelSlice.fill(150);
        // return;

        // Have to multiply by negative one because we are in a left handed coord system
        const camRight = vecMult(normalize(cross(camDir, UP)), -1);
        const camUp = cross(vecMult(camRight, -1), camDir);

        // This is used to divide the pixel number coordinates, so that we can produce
        // a similar looking image regardless of resolution (otherwise higher resolution
        // would cause a bigger field of view)
        const widthOrHeight = HEIGHT;

        const intersect = this.scene.intersect.bind(this.scene);
        const setPixel = this.pixelSlice.set.bind(this.pixelSlice);
        const scene = this.scene;
        const pixelSlice = this.pixelSlice;

        const yStart = this.yStart;

        for (let y = yStart; y < this.yEnd; y++) {
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
                const ray: Ray = {
                    dir: targetDir,
                    orig: camPos
                };
                const color = colorToArray(this.getColor(ray, 0));
                pixelSlice.set(color, ((y - yStart) * WIDTH + x) * 4);
            }
        }
    }

    getColor(ray: Ray, depth: number): Vec3 {
        if (depth > MAX_RAY_DEPTH) return BG_COLOR;

        const surfacePoint = this.scene.intersect(ray);
        if (!surfacePoint) return BG_COLOR;

        if (surfacePoint.reflect) {
            const toReflected = reflect(ray.dir, surfacePoint.normal);
            const reflectRay = {
                orig: vecAdd(surfacePoint.pos, vecMult(toReflected, 0.01)),
                dir: toReflected
            };
            return vecMult(this.getColor(reflectRay, depth + 1), 0.8);
        }

        const lightPos: Vec3 = [
            10, 
            5,
            0
        ];

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
        color[0] * 255,
        color[1] * 255,
        color[2] * 255,
        255
    ]
}
