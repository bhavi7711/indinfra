from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import time
import shutil
import subprocess
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.abspath("uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# File to store folder metadata persistently
METADATA_FILE = "folders_metadata.json"

def load_folders_metadata():
    """Load folder metadata from JSON file"""
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    return {}

def save_folders_metadata(metadata):
    """Save folder metadata to JSON file"""
    with open(METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)

# Load existing metadata on startup
folders_metadata = load_folders_metadata()

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

# ✅ Get all folders
@app.route("/get-folders", methods=["GET"])
def get_folders():
    folders = []
    for folder_id, metadata in folders_metadata.items():
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], metadata["name"])
        file_count = 0
        if os.path.exists(folder_path):
            # Count all files recursively in the folder
            for root, dirs, files in os.walk(folder_path):
                file_count += len(files)
        
        folders.append({
            "id": folder_id,
            "name": metadata["name"],
            "path": folder_path,
            "fileCount": file_count,
            "uploadDate": metadata["uploadDate"]
        })
    
    return jsonify(folders), 200

# ✅ Upload folder
@app.route("/upload-folder", methods=["POST"])
def upload_folder():
    if "files" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files")
    folder_name = request.form.get("folderName", "").strip()
    
    if not folder_name:
        return jsonify({"error": "No folder name provided"}), 400

    if not files or files[0].filename == "":
        return jsonify({"error": "No files selected"}), 400

    try:
        # Create folder path
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder_name)
        os.makedirs(folder_path, exist_ok=True)

        # Save all files
        for file in files:
            if file.filename:
                # Preserve folder structure within the uploaded folder
                relative_path = file.filename
                file_path = os.path.join(folder_path, relative_path)
                
                # Create subdirectories if needed
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                file.save(file_path)

        # Store folder metadata
        folder_id = str(uuid.uuid4())
        folders_metadata[folder_id] = {
            "name": folder_name,
            "uploadDate": datetime.now().isoformat(),
            "path": folder_path
        }
        
        # Save metadata to file
        save_folders_metadata(folders_metadata)

        return jsonify({
            "message": "Folder uploaded successfully",
            "folderId": folder_id,
            "folderName": folder_name,
            "fileCount": len(files)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to upload folder: {str(e)}"}), 500

# ✅ Delete folder
@app.route("/delete-folder/<folder_id>", methods=["DELETE"])
def delete_folder(folder_id):
    if folder_id not in folders_metadata:
        return jsonify({"error": "Folder not found"}), 404

    try:
        folder_metadata = folders_metadata[folder_id]
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder_metadata["name"])
        
        # Remove folder from filesystem
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
        
        # Remove from metadata
        del folders_metadata[folder_id]
        
        # Save updated metadata to file
        save_folders_metadata(folders_metadata)
        
        return jsonify({"message": "Folder deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to delete folder: {str(e)}"}), 500

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

    def find_pdf_files(directory):
        """Recursively find all PDF files in directory and subdirectories"""
        pdf_files = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.lower().endswith('.pdf'):
                    # Get relative path from the folder root
                    relative_path = os.path.relpath(os.path.join(root, file), folder_path)
                    pdf_files.append({
                        "filename": relative_path,
                        "url": f"http://127.0.0.1:5000/uploads/{folder}/{relative_path}" if folder else f"http://127.0.0.1:5000/uploads/{relative_path}"
                    })
        return pdf_files

    pdf_files = find_pdf_files(folder_path)
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

# ✅ Save Edited PDF Properly (Make sure opened PDF gets saved)
@app.route("/save-current-pdf", methods=["POST"])
def save_current_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["pdf"]
    folder = request.form.get("folder", "").strip()
    filename = file.filename

    if filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Ensure the folder exists or create it
    folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder) if folder else app.config["UPLOAD_FOLDER"]
    os.makedirs(folder_path, exist_ok=True)

    # Check if folder creation worked
    if not os.path.exists(folder_path):
        return jsonify({"error": f"Folder creation failed: {folder_path}"}), 500

    # Save the PDF file to the folder
    file_path = os.path.join(folder_path, filename)

    # Debugging: Print the file path where the PDF will be saved
    print(f"📂 Saving PDF to: {file_path}")

    try:
        file.save(file_path)  # Save the file to the folder
        print(f"✅ PDF saved at: {file_path}")
        return jsonify({
            "message": "PDF saved successfully", 
            "file_url": f"http://127.0.0.1:5000/uploads/{folder}/{filename}" if folder else f"http://127.0.0.1:5000/uploads/{filename}"
        }), 200
    except Exception as e:
        print(f"❌ Error saving PDF: {str(e)}")
        return jsonify({"error": f"Failed to save PDF: {str(e)}"}), 500

# ✅ Save Snip with Metadata
@app.route("/save-snip", methods=["POST"])
def save_snip():
    if "snip" not in request.files:
        return jsonify({"error": "No snip file provided"}), 400

    snip_file = request.files["snip"]
    folder = request.form.get("folder", "").strip()
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    timestamp = request.form.get("timestamp", "").strip()

    if not title:
        return jsonify({"error": "No title provided"}), 400

    if not timestamp:
        return jsonify({"error": "No timestamp provided"}), 400

    try:
        # Create folder path
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder) if folder else app.config["UPLOAD_FOLDER"]
        os.makedirs(folder_path, exist_ok=True)

        # Generate filename with timestamp
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_title}_{int(time.time())}.png"
        file_path = os.path.join(folder_path, filename)

        # Save the snip file
        snip_file.save(file_path)

        # Create metadata for the snip
        snip_metadata = {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": description,
            "timestamp": timestamp,
            "filename": filename,
            "folder": folder,
            "file_path": file_path,
            "created_at": datetime.now().isoformat(),
            "url": f"http://127.0.0.1:5000/uploads/{folder}/{filename}" if folder else f"http://127.0.0.1:5000/uploads/{filename}"
        }

        # Save metadata to a JSON file (we'll replace this with Supabase later)
        snips_metadata_file = "snips_metadata.json"
        snips_metadata = {}
        
        if os.path.exists(snips_metadata_file):
            try:
                with open(snips_metadata_file, 'r') as f:
                    snips_metadata = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                snips_metadata = {}

        snips_metadata[snip_metadata["id"]] = snip_metadata

        with open(snips_metadata_file, 'w') as f:
            json.dump(snips_metadata, f, indent=2)

        print(f"✅ Snip saved: {file_path}")
        print(f"📝 Metadata: {snip_metadata}")

        return jsonify({
            "message": "Snip saved successfully",
            "snip": snip_metadata
        }), 200

    except Exception as e:
        print(f"❌ Error saving snip: {str(e)}")
        return jsonify({"error": f"Failed to save snip: {str(e)}"}), 500

# ✅ Get all snips
@app.route("/get-snips", methods=["GET"])
def get_snips():
    folder = request.args.get("folder", "").strip()
    snips_metadata_file = "snips_metadata.json"
    
    if not os.path.exists(snips_metadata_file):
        return jsonify([]), 200

    try:
        with open(snips_metadata_file, 'r') as f:
            snips_metadata = json.load(f)

        # Filter by folder if specified
        if folder:
            filtered_snips = [
                snip for snip in snips_metadata.values() 
                if snip.get("folder") == folder
            ]
        else:
            filtered_snips = list(snips_metadata.values())

        return jsonify(filtered_snips), 200

    except Exception as e:
        print(f"❌ Error loading snips: {str(e)}")
        return jsonify({"error": f"Failed to load snips: {str(e)}"}), 500

# ✅ Delete snip
@app.route("/delete-snip/<snip_id>", methods=["DELETE"])
def delete_snip(snip_id):
    snips_metadata_file = "snips_metadata.json"
    
    if not os.path.exists(snips_metadata_file):
        return jsonify({"error": "Snip not found"}), 404

    try:
        with open(snips_metadata_file, 'r') as f:
            snips_metadata = json.load(f)

        if snip_id not in snips_metadata:
            return jsonify({"error": "Snip not found"}), 404

        snip_data = snips_metadata[snip_id]
        file_path = snip_data.get("file_path")

        # Delete the file
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        # Remove from metadata
        del snips_metadata[snip_id]

        # Save updated metadata
        with open(snips_metadata_file, 'w') as f:
            json.dump(snips_metadata, f, indent=2)

        return jsonify({"message": "Snip deleted successfully"}), 200

    except Exception as e:
        print(f"❌ Error deleting snip: {str(e)}")
        return jsonify({"error": f"Failed to delete snip: {str(e)}"}), 500

# ✅ Save Highlighted PDF with Embedded Highlights
@app.route("/save-highlighted-pdf", methods=["POST"])
def save_highlighted_pdf():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        folder = data.get("folder", "").strip()
        highlights = data.get("highlights", [])
        filename = data.get("filename", "").strip()
        original_pdf = data.get("originalPdf", "").strip()
        highlighted_content = data.get("highlightedContent", "")

        if not folder:
            return jsonify({"error": "No folder specified"}), 400

        if not highlights:
            return jsonify({"error": "No highlights provided"}), 400

        # Create folder path
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder)
        os.makedirs(folder_path, exist_ok=True)

        # Generate unique ID for this highlighted PDF
        highlighted_pdf_id = str(uuid.uuid4())
        
        # Create highlighted PDF filename
        highlighted_filename = f"highlighted_{highlighted_pdf_id}_{filename}"
        highlighted_pdf_path = os.path.join(folder_path, highlighted_filename)

        # Save the highlighted content as HTML (for now)
        # In a real implementation, you'd convert this to PDF
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Highlighted PDF</title>
            <style>
                .pdf-highlight {{
                    background-color: rgba(255, 255, 0, 0.4) !important;
                    border-radius: 2px !important;
                    padding: 1px 2px !important;
                    margin: 0 1px !important;
                    display: inline !important;
                    position: relative !important;
                    z-index: 10 !important;
                }}
                body {{
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                }}
            </style>
        </head>
        <body>
            <h1>Highlighted PDF Content</h1>
            <p><strong>Original PDF:</strong> {original_pdf}</p>
            <p><strong>Highlights:</strong> {len(highlights)} items</p>
            <hr>
            {highlighted_content}
        </body>
        </html>
        """
        
        # Save HTML file
        html_path = highlighted_pdf_path.replace('.pdf', '.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Save highlight metadata
        highlight_metadata = {
            "id": highlighted_pdf_id,
            "filename": filename,
            "folder": folder,
            "highlights": highlights,
            "created_at": datetime.now().isoformat(),
            "file_path": html_path,
            "original_pdf": original_pdf,
            "highlighted_content": highlighted_content
        }

        # Save to highlighted PDFs metadata file
        highlighted_pdfs_file = "highlighted_pdfs_metadata.json"
        highlighted_pdfs = {}
        
        if os.path.exists(highlighted_pdfs_file):
            try:
                with open(highlighted_pdfs_file, 'r') as f:
                    highlighted_pdfs = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                highlighted_pdfs = {}

        highlighted_pdfs[highlighted_pdf_id] = highlight_metadata

        with open(highlighted_pdfs_file, 'w') as f:
            json.dump(highlighted_pdfs, f, indent=2)

        print(f"✅ Highlighted PDF saved: {highlighted_pdf_id}")
        
        return jsonify({
            "message": "Highlighted PDF saved successfully",
            "id": highlighted_pdf_id,
            "filename": highlighted_filename,
            "highlighted_pdf": highlight_metadata
        }), 200

    except Exception as e:
        print(f"❌ Error saving highlighted PDF: {str(e)}")
        return jsonify({"error": f"Failed to save highlighted PDF: {str(e)}"}), 500

# ✅ Download Highlighted PDF
@app.route("/download-highlighted-pdf/<highlighted_pdf_id>", methods=["GET"])
def download_highlighted_pdf(highlighted_pdf_id):
    try:
        highlighted_pdfs_file = "highlighted_pdfs_metadata.json"
        
        if not os.path.exists(highlighted_pdfs_file):
            return jsonify({"error": "No highlighted PDFs found"}), 404

        with open(highlighted_pdfs_file, 'r') as f:
            highlighted_pdfs = json.load(f)

        if highlighted_pdf_id not in highlighted_pdfs:
            return jsonify({"error": "Highlighted PDF not found"}), 404

        highlighted_pdf_data = highlighted_pdfs[highlighted_pdf_id]
        file_path = highlighted_pdf_data.get("file_path")

        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "Highlighted PDF file not found"}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=highlighted_pdf_data.get("filename", "highlighted_pdf.html"),
            mimetype="text/html"
        )

    except Exception as e:
        print(f"❌ Error downloading highlighted PDF: {str(e)}")
        return jsonify({"error": f"Failed to download highlighted PDF: {str(e)}"}), 500

# ✅ Get Highlighted PDFs
@app.route("/get-highlighted-pdfs", methods=["GET"])
def get_highlighted_pdfs():
    folder = request.args.get("folder", "").strip()
    highlighted_pdfs_file = "highlighted_pdfs_metadata.json"
    
    if not os.path.exists(highlighted_pdfs_file):
        return jsonify([]), 200

    try:
        with open(highlighted_pdfs_file, 'r') as f:
            highlighted_pdfs = json.load(f)

        # Filter by folder if specified
        if folder:
            filtered_pdfs = [
                pdf for pdf in highlighted_pdfs.values() 
                if pdf.get("folder") == folder
            ]
        else:
            filtered_pdfs = list(highlighted_pdfs.values())

        return jsonify(filtered_pdfs), 200

    except Exception as e:
        print(f"❌ Error loading highlighted PDFs: {str(e)}")
        return jsonify({"error": f"Failed to load highlighted PDFs: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
