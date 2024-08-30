import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiTeacherInstance } from '../../Helper/axiosInstance';

const PdfViewer = () => {
  const { fileId } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await apiTeacherInstance.get(
          `/file-folder/getPdfFile/${fileId}`,
          {
            responseType: 'blob',
          }
        );

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        setError('Failed to load PDF. Please try again.');
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [fileId]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pdf-viewer h-full w-full">
      {pdfUrl ? (
        <iframe 
          src={pdfUrl}
          title="PDF Viewer"
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      ) : (
        <div className="loading-message">Loading PDF...</div>
      )}
    </div>
  );
};

export default PdfViewer;