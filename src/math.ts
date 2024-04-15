
export type Vec3 = [number, number, number];

/** Returns the dot product of two vectors */
export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Returns the cross product of two vectors */
export function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ]
}

export function vecLen(v: Vec3): number {
    return Math.sqrt(dot(v, v));
}

export function vecAdd(a: Vec3, b: Vec3): Vec3 {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
    ];
}

export function vecSub(a: Vec3, b: Vec3): Vec3 {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ];
}

export function vecMult(v: Vec3, num: number): Vec3 {
    return [
        v[0] * num,
        v[1] * num,
        v[2] * num,
    ];
}

/** Divides each component of the vecotr by `num` */
export function vecDiv(v: Vec3, num: number): Vec3 {
    return [
        v[0] / num,
        v[1] / num,
        v[2] / num
    ];
}

export function normalize(v: Vec3): Vec3 {
    return vecDiv(v, vecLen(v));
}
