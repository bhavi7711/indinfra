**PDF ANNOTATION TOOL**

PDF annotation tool is an innovative tool built to interact with PDFs, allowing users to snip portions of a PDF and highlight text. The application integrates a backend system that stores these annotations in an SQLite3 database, ensuring that all user interactions with the PDFs are stored efficiently. The tool is hosted on Firebase, offering seamless deployment and access.

Features Overview
Snip Tool:
The snip tool allows users to select and crop specific portions of a PDF document. Once an area is selected, the snip is captured and stored as an image. This tool is perfect for extracting important sections of documents for quick access.

Highlight Tool:
Users can highlight text directly within a PDF. The highlights are stored in the backend and can be visualized as transparent overlays on the PDF. This tool provides a clear, customizable method to emphasize key content in documents.

Backend (Flask & SQLite3):
The backend, built using Flask (Python), is responsible for handling the saving and retrieval of snips and highlights. The data is stored in an SQLite3 database, ensuring all annotations are linked to the corresponding PDF and are easily retrievable when required.

Frontend (React & TypeScript):
The frontend of the application is developed with React and TypeScript. This combination ensures a fast, dynamic, and type-safe user interface. The frontend is styled using Tailwind CSS, providing a clean and responsive design for both desktop and mobile devices.

Hosting on Firebase:
The entire application is hosted on Firebase, ensuring that users can access the app reliably and at scale. Firebase Hosting provides a fast and secure way to serve the app's static files, while Firebase's integration capabilities simplify deployment.

Technologies Used:
Frontend:

React (for building user interfaces)
TypeScript (for type safety)
Tailwind CSS (for styling)
Backend:

Flask (Python web framework)
SQLite3 (for local database storage)
Hosting:

Firebase Hosting (for deploying the frontend application)
Others:

PDF-lib (for manipulating PDF documents)
html2canvas (for snipping and capturing portions of the PDF)
react-pdf (for rendering and displaying PDF files)
Development Process:
The project started with the design phase, where wireframes were created to define the user flow and interface layout. The implementation began by setting up the frontend environment using React and TypeScript. Key features like the snip and highlight tools were developed step-by-step. During the backend development, Flask was chosen to handle API requests, while SQLite3 was integrated to store the annotations efficiently.

The application was later deployed to Firebase to provide a cloud-based hosting solution, making the tool available for users across the globe. Continuous testing and debugging were performed to ensure all features worked seamlessly and the database interactions were stable.

Challenges Faced:
Snip Tool Accuracy: Initially, the snip tool had some issues with accurately capturing selected areas, which were fixed through rigorous testing and tweaks.
Cross-Device Compatibility: Ensuring the application worked smoothly on various screen sizes and devices was challenging but was addressed by using responsive design principles.
Database Integration: Ensuring that the snips and highlights were correctly stored and linked with the relevant PDFs was a key focus, and the use of SQLite3 proved to be efficient.
Future Improvements:
Cloud Database Integration: As the application grows, integrating a cloud database like Firebase Firestore might improve scalability.
User Authentication: Implementing a user authentication system so that users can save their annotations securely and access them across multiple devices.
Advanced PDF Editing Features: Further development of PDF editing features, such as adding comments, text annotations, and more.
