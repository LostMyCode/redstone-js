import WrappedAnim from "../engine/WrappedAnim";
import { DATA_DIR } from "../game/Config";
import Texture, { ZippedTextures } from "../game/models/Texture";
import BufferReader from "./BufferReader";
import { updateDisplayLog } from "./DisplayLogUpdater";

export const fetchBinaryFile = async (path) => {
    const fileName = path.split('/').pop();

    updateDisplayLog("loading-status", `Loading ${fileName}`);

    if (['sad', 'sd', 'dat', 'mpr', 'smi', 'rmd'].includes(fileName.split(".").pop())) {
        path += '.txt';
    }

    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error("not ok");
            }
            return response.arrayBuffer();
        })
        .then(ab => {
            return Buffer.from(ab);
        })
        .catch(e => {
            updateDisplayLog("loading-status", `Failed to fetch ${fileName}`);
            throw e;
        });
}

export const loadImageSync = async (src) => {
    return await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = src;
    });
}

export const loadZip = async (path) => {
    const buf = await fetchBinaryFile(path);
    const unzip = new Zlib.Unzip(buf);

    return unzip;
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
    const texture = new Texture(path.split("/").pop(), buf);
    console.log("[Texture] Loaded", path.replace(DATA_DIR + "/", ""));
    return texture;
}

export const loadAnimation = buffer => {
    const anim = new WrappedAnim();
    anim.load(new BufferReader(buffer), false);
    return anim;
}

export const loadZippedTextures = async (path) => {
    const buf = await fetchBinaryFile(path);
    const zippedTextures = new ZippedTextures(buf);
    console.log("[Texture] Loaded", path.replace(DATA_DIR + "/", ""));
    return zippedTextures;
}