const i2c = require("i2c-bus");

// Open I2C bus 1
const i2cBus = i2c.openSync(1);

console.log("Scanning for I2C devices...");
for (let addr = 0x03; addr <= 0x77; addr++) {
    try {
        i2cBus.receiveByteSync(addr); // Probe address
        console.log(`✅ Device found at 0x${addr.toString(16)}`);
    } catch (error) {
        // Ignore errors, means no device at this address
    }
}

i2cBus.closeSync();
