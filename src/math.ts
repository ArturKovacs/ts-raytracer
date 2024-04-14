
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/** Returns the dot product of two vectors */
export function dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Returns the cross product of two vectors */
export function cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    }
}

export function vecLen(v: Vec3): number {
    return Math.sqrt(dot(v, v));
}

export function vecAdd(a: Vec3, b: Vec3): Vec3 {
    return { 
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}

export function vecSub(a: Vec3, b: Vec3): Vec3 {
    return { 
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}

export function vecMult(v: Vec3, num: number): Vec3 {
    return { 
        x: v.x * num,
        y: v.y * num,
        z: v.z * num,
    };
}

/** Divides each component of the vecotr by `num` */
export function vecDiv(v: Vec3, num: number): Vec3 {
    return { x: v.x / num, y: v.y / num, z: v.z / num };
}

export function normalize(v: Vec3): Vec3 {
    return vecDiv(v, vecLen(v));
}
