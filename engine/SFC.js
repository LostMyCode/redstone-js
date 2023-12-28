export const getOvalRange = (x1, y1, x2, y2) => {
    x1 -= x2;
    y1 -= y2;
    y1 *= 2;

    if (x1 >= 0x7fff || x1 <= -0x7fff) return 0x7ffffff;
    if (y1 >= 0x7fff || y1 <= -0x7fff) return 0x7ffffff;

    return x1 * x1 + y1 * y1;
}