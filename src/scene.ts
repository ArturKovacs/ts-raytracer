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
                pos: [ 0, -5, 20 ], // left handed coordinate system
                r: 2,
                diffCol: [ 1, 1, 1 ],
                specCol: [ 1, 1, 1 ],
            },

            // FLOOR
            {
                pos: [ 0, -515, 0 ], // left handed coordinate system
                r: 500,
                diffCol: [ 1, 1, 1 ],
                specCol: [ 1, 1, 1 ],
            },

            // CEILING
            {
                pos: [ 0, 515, 50 ], // left handed coordinate system
                r: 500,
                diffCol: [ 1, 1, 1 ],
                specCol: [ 1, 1, 1 ],
            },

            // RIGHT
            {
                pos: [ 515, 0, 50 ], // left handed coordinate system
                r: 500,
                diffCol: [ 0.2, 1, 0.3 ],
                specCol: [ 1, 1, 1 ],
            },

            // LEFT
            {
                pos: [ -515, 0, 50 ], // left handed coordinate system
                r: 500,
                diffCol: [ 0.3, 0.3, 1 ],
                specCol: [ 1, 1, 1 ],
            },

            // BACK
            {
                pos: [ 0, 0, 555 ], // left handed coordinate system
                r: 500,
                diffCol: [ 1, 0.3, 0.3 ],
                specCol: [ 1, 1, 1 ],
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
