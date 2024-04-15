import { Vec3, dot, vecSub } from "./math";

export interface Ray {
    orig: Vec3;
    dir: Vec3;
}

export interface Sphere {
    pos: Vec3;
    r: number;
    diffCol: Vec3;
    specCol: Vec3; //(1, 1, 1) means perfect mirror (note that if you want a mirror the diffCol should be (0, 0, 0))
    reflect: boolean;
};

/**
 * Returns `Infinity` if the ray does not intersect the sphere.
 * 
 * Otherwise, returns the distance along the ray of the intersetion point closer to the origin of the ray 
 */
export function intersectSphere(ray: Ray, sphere: Sphere): number {
    // 0 = a*(t^2) + b*t + c where t is the distance from the Ray origin on the Ray

    //if the Ray is facing "away" from the Sphere
    //if(dot(theRay.dir, normalize(sphere.pos-theRay.orig)) < 0) return -1.f;

    const rayOrigMinusSpherePos = vecSub(ray.orig, sphere.pos);

    // rather surprisingly, saving a property to a variable
    // and referencing the variable is significantly faster
    // than accessing the property every time
    const rayDir = ray.dir;
    const r = sphere.r;

    const a = dot(rayDir, rayDir);
    const b = 2 * dot(rayOrigMinusSpherePos, rayDir);
    const c = -(r * r) + dot(rayOrigMinusSpherePos, rayOrigMinusSpherePos);

    //discriminant
    const D = b * b - 4 * a * c;

    //if no intersection
    if (D < 0) {
        return Infinity;
    }

    const sqrtD = Math.sqrt(D);
    const twoA = 2 * a;
    const t1 = (-b + sqrtD) / twoA;
    const t2 = (-b - sqrtD) / twoA;
    if (t1 > 0 && t2 > 0) {
        return Math.min(t1, t2);
    }
    return Math.max(t1, t2);
}
