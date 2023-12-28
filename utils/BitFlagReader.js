export default class BitFlagReader {
    constructor(flags, size) {
        this.flags = flags;
        this.size = size;
        this.index = 0;
    }

    readBool() {
        // Read a boolean value from the current bit position
        const result = !!(this.flags & (1 << this.index));
        this.index += 1; // Move to the next bit
        return result;
    }

    readBits(bitCount) {
        // Read the specified number of bits from the current bit position
        const result = (this.flags >> this.index) & ((1 << bitCount) - 1);
        this.index += bitCount; // Move to the next bit
        return result;
    }
}