const fs = require("fs");
const Writer = require("./Writer");

function createFakeFontFile(lang, outputPath) {
    const writer = new Writer();

    writer.writeUint32(1000); // size

    if (lang === "ENG") {
        writer.writeString("Sonaki's Pressed ENG font");
        for (let i = 0; i < 14; i++) {
            writer.writeUint8(0);
        }
    } else {
        writer.writeString("Sonaki's Pressed KS font");
        for (let i = 0; i < 15; i++) {
            writer.writeUint8(0);
        }
    }

    let count = 3000;

    writer.writeUint32(count);

    // font offsets
    for (let i = 0; i < count + 1; i++) {
        writer.writeUint32(i * 8);
    }

    // font
    for (let i = 0; i < count; i++) {
        writer.writeUint32(10);
        writer.writeUint32(10);
    }

    // layer offsets
    for (let i = 0; i < count + 1; i++) {
        writer.writeUint32(i * 8);
    }

    // layer 
    for (let i = 0; i < count; i++) {
        writer.writeUint32(10);
        writer.writeUint32(10);
    }

    fs.writeFileSync(outputPath, Buffer.from(writer.arrayBuffer));
}

createFakeFontFile("ENG", "./data/small.pef");
createFakeFontFile("KR", "./data/small.phf");
