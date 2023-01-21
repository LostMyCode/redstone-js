import React from "react";
import BufferReader from "../../utils/BufferReader";
import RedStoneMap from "../../utils/Map";

class MapReaderDebug extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchMapData();
  }

  async fetchMapData() {
    const f = await fetch("static/[000]T01.rmd");
    const rmd = await f.arrayBuffer();
    this.rmd = Buffer.from(rmd);
    const br = new BufferReader(this.rmd);
    const map = new RedStoneMap(br);

    const f2 = await fetch("static/Brunenstig_tiles.zip");
    const tilesZip = await f2.arrayBuffer();
    const unzip = new Zlib.Unzip(Buffer.from(tilesZip));
    const fileNames = unzip.getFilenames();
    console.log(fileNames);

    const tileImages = {};
    let ctx = document.getElementById("canvas").getContext('2d');

    const drawTiles = () => {
      const scale = 1;
      for (let i = 0; i < map.headerSize.height; i++) {
        for (let j = 0; j < map.headerSize.width; j++) {
          const tileCode = map.tileData1[i * map.headerSize.width + j] % (16 << 10); // 16 << 10 = 256 * 64 no idea...
          const tileImage = tileImages[tileCode];
          ctx.drawImage(tileImage, 0, 0, 64, 32, j * (64 * scale), i * (32 * scale), (64 * scale), (32 * scale));
        }
      }
    }

    let offsetX = 0;
    let offsetY = 0;
    let loadedCount = 0;
    fileNames.forEach(fileName => {
      if (offsetX === 10) {
        offsetX = 0;
        offsetY++;
      }
      const ox = offsetX;
      const oy = offsetY;
      const data = unzip.decompress(fileName);
      const blob = new Blob([data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const img = new Image;
      img.onload = function () {
        // ctx.drawImage(this, ox * 64, oy * 32);
        // URL.revokeObjectURL(url);
        loadedCount++;
        if (loadedCount === fileNames.length) {
          drawTiles();
        }
      }
      img.src = url;
      const imageNum = parseInt(fileName.match(/tile_(\d+)/)[1]);
      tileImages[imageNum] = img;
      offsetX++;
    });
  }

  render() {

    return (
      <>

      </>
    )
  }
}

export default MapReaderDebug;