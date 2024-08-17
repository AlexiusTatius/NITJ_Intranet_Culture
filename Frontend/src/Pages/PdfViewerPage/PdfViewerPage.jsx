import React from 'react';
import PdfViewer from '../../Components/PdfViewer/PdfViewer';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './PdfViewerPage.css';

const PdfViewerPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="pdf-viewer-page flex flex-col h-screen">
      <header className="pdf-viewer-header flex-shrink-0">
        <button onClick={handleGoBack} className="back-button">
          <ChevronLeft size={24} className="mr-2" />
          Back to Files
        </button>
        <h1>PDF Viewer</h1>
      </header>
      <main className="pdf-viewer-content flex-grow overflow-hidden">
        <PdfViewer />
      </main>
    </div>
  );
};

export default PdfViewerPage;