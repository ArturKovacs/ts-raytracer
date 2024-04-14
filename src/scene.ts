import { Ray, Sphere, intersectSphere } from "./geometry";
import { Vec3, normalize, vecAdd, vecMult, vecSub } from "./math";

export interface HitResult {
    dist: number;
    pos: Vec3;
    normal: Vec3;
    diffCol: Vec3;
    specCol: Vec3;
}

export class Scene {
    protected spheres: Sphere[];

    constructor() {
        this.spheres = [
            {
                pos: { x: 0, y: -5, z: 20 }, // left handed coordinate system
                r: 2,
                diffCol: { x: 1, y: 1, z: 1 },
                specCol: { x: 1, y: 1, z: 1 },
            },

            // FLOOR
            {
                pos: { x: 0, y: -515, z: 0 }, // left handed coordinate system
                r: 500,
                diffCol: { x: 1, y: 1, z: 1 },
                specCol: { x: 1, y: 1, z: 1 },
            },

            // CEILING
            {
                pos: { x: 0, y: 515, z: 50 }, // left handed coordinate system
                r: 500,
                diffCol: { x: 1, y: 1, z: 1 },
                specCol: { x: 1, y: 1, z: 1 },
            },

            // RIGHT
            {
                pos: { x: 515, y: 0, z: 50 }, // left handed coordinate system
                r: 500,
                diffCol: { x: 0.2, y: 1, z: 0.3 },
                specCol: { x: 1, y: 1, z: 1 },
            },

            // LEFT
            {
                pos: { x: -515, y: 0, z: 50 }, // left handed coordinate system
                r: 500,
                diffCol: { x: 0.3, y: 0.3, z: 1 },
                specCol: { x: 1, y: 1, z: 1 },
            },

            // BACK
            {
                pos: { x: 0, y: 0, z: 555 }, // left handed coordinate system
                r: 500,
                diffCol: { x: 1, y: 0.3, z: 0.3 },
                specCol: { x: 1, y: 1, z: 1 },
            },
        ]
    }

    /** Returns null if nothing was hit, otherwise returns information about the hit surface */
    public intersect(ray: Ray): HitResult | null {
        let closestDist = Infinity;
        let result: HitResult | null = null;
        for (const sphere of this.spheres) {
            const currDist = intersectSphere(ray, sphere);
            // currDist must be greater than 0 so that we only consider
            // intersections that happen *in front* of the camera
            if (currDist > 0 && currDist < closestDist) {
                closestDist = currDist;
                const hitPos = vecAdd(ray.orig, vecMult(ray.dir, currDist));
                result = {
                    dist: closestDist,
                    diffCol: sphere.diffCol,
                    specCol: sphere.specCol,
                    normal: normalize(vecSub(hitPos, sphere.pos)),
                    pos: hitPos
                };
            }
        }
        // if ((result?.diffCol.y < 1) && result?.pos.y > 0) {
        //     debugger;
        // }
        return result
    }
}
