
// RGB(r,g,b)          ((COLORREF)(((BYTE)(r)|((WORD)((BYTE)(g))<<8))|(((DWORD)(BYTE)(b))<<16)))
export function RGB(r, g, b) {
    return (r | (g << 8) | (b << 16)) >>> 0;
}