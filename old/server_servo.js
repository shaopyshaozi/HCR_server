const express = require("express");
const { Gpio } = require("pigpio");

const app = express();
const port = 5001;

let lastPurchasedQuantity = 0;  // Store the latest quantity

// Setup PWM on GPIO 18 for the servo
const servo = new Gpio(18, { mode: Gpio.OUTPUT });

/**
 * Move the servo back and forth for `count` times with a delay of 1 second.
 */
function moveServoNTimes(count) {
    let i = 0;

    function moveCycle() {
        if (i < count) {
            // Move servo to 90°
            servo.servoWrite(1500);
            console.log(`🌀 Servo moved to 90° (Iteration ${i + 1})`);

            setTimeout(() => {
                // Move servo back to 0°
                servo.servoWrite(500);
                console.log(`🔄 Servo moved back to 0° (Iteration ${i + 1})`);
                i++;

                setTimeout(moveCycle, 1000); // Wait 1 second before next cycle
            }, 1000); // Wait 1 second at 90°
        } else {
            console.log("✅ Servo movement completed.");
        }
    }

    moveCycle();
}

// ✅ Save the purchased quantity and move the servo
app.get("/confirm_purchase", (req, res) => {
    const quantity = req.query.quantity;

    if (quantity) {
        lastPurchasedQuantity = parseInt(quantity, 10);
        console.log(`✅ Stored Quantity: ${lastPurchasedQuantity}`);

        // Move servo back and forth `quantity` times
        moveServoNTimes(lastPurchasedQuantity);

        res.status(200).send(`Quantity Received: ${lastPurchasedQuantity}, Servo Moved ${lastPurchasedQuantity} times.`);
    } else {
        res.status(400).send("No quantity provided.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
