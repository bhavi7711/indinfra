from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import shutil
import subprocess

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.abspath("uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ✅ Function to find latest snip in multiple locations
def find_latest_snip():
    possible_folders = [
        os.path.join(os.path.expanduser("~"), "Pictures", "Screenshots"),
        os.path.join(os.path.expanduser("~"), "OneDrive", "Pictures", "Screenshots"),
        os.path.join(os.path.expanduser("~"), "Pictures")
    ]

    latest_screenshot = None
    latest_time = 0

    for folder in possible_folders:
        if os.path.exists(folder):
            files = [f for f in os.listdir(folder) if f.endswith((".png", ".jpg"))]
            for file in files:
                file_path = os.path.join(folder, file)
                file_time = os.path.getctime(file_path)
                if file_time > latest_time:
                    latest_screenshot = file_path
                    latest_time = file_time

    return latest_screenshot

# ✅ Upload PDFs
@app.route("/upload-pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    folder = request.form.get("folder", "").strip()

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder) if folder else app.config["UPLOAD_FOLDER"]
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file.filename)
    file.save(file_path)

    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename,
        "file_url": f"http://127.0.0.1:5000/uploads/{folder}/{file.filename}" if folder else f"http://127.0.0.1:5000/uploads/{file.filename}"
    }), 200

# ✅ Fetch PDFs
@app.route("/get-pdfs", methods=["GET"])
def get_pdfs():
    folder = request.args.get("folder", "").strip()
    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder) if folder else app.config["UPLOAD_FOLDER"]

    if not os.path.exists(folder_path):
        return jsonify([]), 200  

    files = os.listdir(folder_path)
    pdf_files = [
        {"filename": f, "url": f"http://127.0.0.1:5000/uploads/{folder}/{f}" if folder else f"http://127.0.0.1:5000/uploads/{f}"}
        for f in files if f.endswith(".pdf")
    ]
    return jsonify(pdf_files), 200

# ✅ Serve PDFs Properly
@app.route("/uploads/<path:folder>/<path:filename>", methods=["GET"])
def serve_pdf(folder, filename):
    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder)
    
    if not os.path.exists(os.path.join(folder_path, filename)):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(folder_path, filename)

# ✅ Start Snipping Tool & Detect Snip
@app.route("/start-snip", methods=["POST"])
def start_snip():
    selected_folder = request.form.get("folder", "").strip()
    
    if not selected_folder:
        return jsonify({"error": "No folder selected"}), 400

    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], selected_folder)
    os.makedirs(folder_path, exist_ok=True)

    print(f"📂 Selected folder: {folder_path}")

    # ✅ Open Snipping Tool
    subprocess.run("explorer ms-screenclip:", shell=True)

    # ✅ Wait for user to take a snip (max wait: 20 sec)
    timeout = 20  
    start_time = time.time()
    
    latest_screenshot = None

    while time.time() - start_time < timeout:
        time.sleep(3)  # Increased wait time per iteration
        latest_screenshot = find_latest_snip()

        if latest_screenshot and time.time() - os.path.getctime(latest_screenshot) < 20:
            print(f"📸 New snip detected: {latest_screenshot}")
            break

    if not latest_screenshot:
        return jsonify({"error": "No new snip detected. Please try again."}), 500

    # ✅ Move snip to selected folder
    new_path = os.path.join(folder_path, f"snip_{int(time.time())}.png")

    try:
        shutil.move(latest_screenshot, new_path)
        print(f"✅ Snip saved at: {new_path}")
        return jsonify({"message": "Snip saved successfully", "file_path": f"http://127.0.0.1:5000/uploads/{selected_folder}/snip_{int(time.time())}.png"}), 200
    except Exception as e:
        print(f"❌ Error moving snip: {e}")
        return jsonify({"error": f"Failed to move snip: {str(e)}"}), 500

# ✅ Save Edited PDF Properly
@app.route("/save-edited-pdf", methods=["POST"])
def save_edited_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    folder = request.form.get("folder", "").strip()
    filename = request.form.get("filename", "edited.pdf").strip()

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder) if folder else app.config["UPLOAD_FOLDER"]
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, filename)
    file.save(file_path)

    return jsonify({"message": "Edited PDF saved successfully", "file_url": f"http://127.0.0.1:5000/uploads/{folder}/{filename}" if folder else f"http://127.0.0.1:5000/uploads/{filename}"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
