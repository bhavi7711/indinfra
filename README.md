# Indian Infrastructure Annotation Tool

A comprehensive PDF annotation and folder management tool with authentication and dashboard functionality.

## Features

- 🔐 **Authentication**: Google and email/password login
- 📁 **Dashboard**: Upload and manage folders from your local system
- 📄 **PDF Viewer**: View and annotate PDF documents
- ✂️ **Snipping Tool**: Take screenshots and save them to folders
- 🎨 **Annotation Tools**: Highlight and annotate PDFs
- 📂 **Folder Management**: Organize documents in folders

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd annotation-tool
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open the Application**
   - Navigate to `http://localhost:5173` in your browser
   - Sign in using Google or create an account with email/password
   - You'll be redirected to the dashboard where you can upload folders

## Usage

### Dashboard
- After login, you'll see the dashboard
- Click "Upload Folder" to select a folder from your local system
- All files within the folder will be uploaded and organized
- View uploaded folders in a grid layout with file counts and upload dates

### PDF Viewer
- Click on any folder to open it in the PDF viewer
- View and annotate PDF documents
- Use the snipping tool to take screenshots
- Save annotations and modifications

### Folder Management
- Upload multiple folders
- Delete folders when no longer needed
- Navigate between folders using the sidebar
- All folders are preserved on the server

## Project Structure

```
annotation-tool/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth.tsx     # Authentication component
│   │   │   ├── Dashboard.tsx # Dashboard component
│   │   │   ├── Sidebar.tsx  # Sidebar navigation
│   │   │   └── PDFViewer.tsx # PDF viewing component
│   │   └── App.tsx          # Main application component
│   └── package.json
├── backend/                  # Flask backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/           # Uploaded files directory
└── README.md
```

## API Endpoints

- `GET /get-folders` - Get all uploaded folders
- `POST /upload-folder` - Upload a new folder
- `DELETE /delete-folder/<id>` - Delete a folder
- `GET /get-pdfs` - Get PDFs from a specific folder
- `POST /upload-pdf` - Upload a single PDF
- `POST /start-snip` - Start the snipping tool

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Flask, Python
- **Authentication**: Firebase Auth
- **PDF Handling**: React PDF Viewer, PDF.js
- **File Upload**: HTML5 File API

## Development

### Adding New Features
1. Create new components in `frontend/src/components/`
2. Add corresponding API endpoints in `backend/app.py`
3. Update the main App.tsx to include new routes/views

### Styling
- The application uses Tailwind CSS for styling
- Icons are from Lucide React
- Responsive design for different screen sizes

## Troubleshooting

- **Backend not starting**: Make sure Python dependencies are installed
- **Frontend not loading**: Check if Node.js dependencies are installed
- **Upload issues**: Ensure the `uploads` directory exists and has write permissions
- **Authentication errors**: Verify Firebase configuration in `frontend/src/firebase.ts`

## License

This project is licensed under the MIT License.
