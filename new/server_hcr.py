from flask import Flask, request, jsonify
from flask_socketio import SocketIO
import eventlet
import RPi.GPIO as GPIO
import time
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

port = 5001
SERVO_PIN = 18  # GPIO pin for the servo

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(SERVO_PIN, GPIO.OUT)

# Create PWM instance at 50Hz (Standard for SG90 servos)
pwm = GPIO.PWM(SERVO_PIN, 50)
#pwm.start(2.5)  # Start at 0° position

@app.route("/")
def home():
    return "Simple Messaging Server is Running"

# ✅ Handle ESP32 command requests
@app.route("/send_cmd", methods=["GET"])
def send_cmd():
    cmd_id = request.args.get("cmd_id")

    if cmd_id:
        print(f"✅ Received CMD ID from ESP32: {cmd_id}")

        if cmd_id in ["7", "8"]:
            print("Sending update_biscuit to WebSocket clients...")
            socketio.emit("cart_update", {"productId": 1, "quantity": 1})

        elif cmd_id == "22":
            print("✅ CMD ID 7 received. Sending response 2 to ESP32...")
            return "2", 200  # Send back "2" immediately

        return f"CMD ID {cmd_id} received and processed.", 200

    print("⚠️ No cmd_id received in query.")
    return "No cmd_id provided.", 400

# ✅ Handle ESP32 payment requests
@app.route("/send_payment", methods=["GET"])
def send_payment():
    success = request.args.get("success")

    if success:
        print(f"✅ Received Payment Success")

        print("Sending success to WebSocket clients...")
        socketio.emit("payment", {"success": 1})

        return "Payment received and processed.", 200

    print("⚠️ No success parameter received in query.")
    return "No success parameter provided.", 400

def move_servo(times):
    pwm.start(2.5)
    for i in range(times):
        print(f"🌀 Moving Servo to 90° (Iteration {i + 1})")        
        pwm.ChangeDutyCycle(7.5)  # Move to 90°
        time.sleep(1)

        print(f"🔄 Moving Servo back to 0° (Iteration {i + 1})")
        pwm.ChangeDutyCycle(2.5)  # Move back to 0°
        time.sleep(1)

    pwm.stop()
    print("✅ Servo movement completed.")

@app.route("/confirm_purchase", methods=["GET"])
def confirm_purchase():
    quantity = request.args.get("quantity", type=int)

    if quantity and quantity > 0:
        print(f"✅ Received Purchase Quantity: {quantity}")
        move_servo(quantity)
        return f"Quantity: {quantity} received", 200
    else:
        return "No quantity received.", 400

# ✅ WebSocket Connection Handling
@socketio.on("connect")
def handle_connect():
    print(f"New WebSocket client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print(f"WebSocket client disconnected")

if __name__ == "__main__":
    try:
        print(f"Server is running on http://0.0.0.0:{port}")
        socketio.run(app, host="0.0.0.0", port=5001, debug=True, allow_unsafe_werkzeug=True, use_reloader=False)
    except KeyboardInterrupt:
        print("🛑 Stopping Server...")
    finally:
        pwm.stop()
        GPIO.cleanup()
 
    
