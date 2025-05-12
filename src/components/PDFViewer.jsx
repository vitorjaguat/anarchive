import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div style={{ width: '100%', height: '60vh', overflow: 'auto' }}>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading='Loading PDF...'
        error='Failed to load PDF.'
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={window.innerWidth - 32} // Adjust for padding/margin
          />
        ))}
      </Document>
    </div>
  );
}
