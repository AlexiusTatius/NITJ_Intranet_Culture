import React from 'react';
import PdfViewer from '../../Components/PdfViewer/PdfViewer';
import PdfViewerStudent from '../../Components/PdfViewer/PdfViewerStudent';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PdfViewerPage = () => {
  const { teacherEmailInitials } = useParams();
  console.log("The teacher email initials are: ", teacherEmailInitials);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-4 bg-gray-100 border-b border-gray-300 flex-shrink-0">
        <button onClick={handleGoBack} className="flex items-center bg-transparent border-none cursor-pointer text-base text-gray-700 mr-4 hover:text-blue-100 transition-colors duration-200">
          <ChevronLeft size={24} className="mr-2" />
          Back to Files
        </button>
        <h1 className="m-0 text-2xl font-bold text-gray-800">PDF Viewer</h1>
      </header>
      <main className="flex-grow overflow-hidden">
        {teacherEmailInitials ? <PdfViewerStudent/> : <PdfViewer />}
      </main>
    </div>
  );
};

export default PdfViewerPage;