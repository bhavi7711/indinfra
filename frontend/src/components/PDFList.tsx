import { useState, useEffect } from "react";

const PDFList = () => {
  const [pdfs, setPdfs] = useState<{ id: number; filename: string; folder: string }[]>([]);

  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get-pdfs");
        if (!response.ok) {
          throw new Error(`Failed to fetch PDFs: ${response.statusText}`);
        }
        const data = await response.json();
        setPdfs(data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
      }
    };

    fetchPDFs();
  }, []); // Dependency array left empty to fetch data only once on mount

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Uploaded PDFs</h2>
      <ul>
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <a
              href={`http://127.0.0.1:5000/uploads/${pdf.folder}/${pdf.filename}`} // Correctly using template literals
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {pdf.filename}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default PDFList;
