import Texture, { ZippedTextures } from "../game/models/Texture";

export const fetchBinaryFile = async (path) => {
    const f = await fetch(path);
    const ab = await f.arrayBuffer();
    return Buffer.from(ab);
}

export const loadImageSync = async (src) => {
    return await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = src;
    });
}

export const loadZippedImages = async (path) => {
    const buf = await fetchBinaryFile(path);
    const unzip = new Zlib.Unzip(buf);
    const fileNames = unzip.getFilenames();
    const images = {};
    let loadedCount = 0;

    return await new Promise((resolve) => {
        fileNames.forEach(fileName => {
            const data = unzip.decompress(fileName);
            const blob = new Blob([data], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            const img = new Image;
            img.onload = function () {
                loadedCount++;
                if (loadedCount === fileNames.length) {
                    resolve(images);
                }
            }
            img.src = url;
            const imageNum = parseInt(fileName.match(/_(\d+)/)[1]);
            images[imageNum] = img;
        });
    });
}

export const loadTexture = async (path) => {
    const buf = await fetchBinaryFile(path);
    console.log("[Texture] Loading texture...", path);
    const texture = new Texture(path.split("/").pop(), buf);
    console.log("[Texture] Ready!!", path);
    return texture;
}

export const loadZippedTextures = async (path) => {
    const buf = await fetchBinaryFile(path);
    console.log("[Texture] Loading zipped textures...", path);
    const zippedTextures = new ZippedTextures(buf);
    console.log("[Texture] Ready!!", path);
    return zippedTextures;
}