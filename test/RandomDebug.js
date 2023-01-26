

const a = Buffer.from([0, 0]);


const target = 4134;


a.writeUInt16LE(target, 0);
console.log("uint", new Uint8Array(a));
console.log("hex", Array.from(new Uint8Array(a)).map(n => "0x" + n.toString(16)));