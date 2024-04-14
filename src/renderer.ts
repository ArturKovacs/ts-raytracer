import { Ray } from "./geometry";
import { Vec3, cross, dot, normalize, vecAdd, vecLen, vecMult, vecSub } from "./math";
import { HitResult, Scene } from "./scene";

export const WIDTH = 800;
export const HEIGHT = 500;
const ASPECT_RATIO = WIDTH / HEIGHT;
const UP: Vec3 = { x: 0, y: 1, z: 0 };

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

        for (let y = this.yStart; y < this.yEnd; y++) {
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

                const hitResult = this.scene.intersect(ray);
                let color;
                if (hitResult) {
                    const colorVec = this.shade(hitResult);
                    color = colorToArray(colorVec);
                } else {
                    color = [0, 0, 0, 255];
                }
                this.pixelSlice.set(color, ((y - this.yStart) * WIDTH + x) * 4);
            }
        }
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
