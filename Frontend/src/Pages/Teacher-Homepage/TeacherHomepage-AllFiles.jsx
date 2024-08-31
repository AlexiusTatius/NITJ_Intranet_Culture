import React from 'react';
import './TeacherHomepage.css';
import FileExplorerContainer from '../../Components/FileExplorerContainer/FileExplorerContainer';
import { useNavigate } from 'react-router-dom';

const TeacherHomepageAllFiles = () => {
  const navigate = useNavigate();
  return (
    <div className="file-explorer-page w-full">
      <header className="page-header">
        <div className='flex justify-between items-center w-[100vw]'>
          <div><h1 className="mr-auto text-left">All Files</h1></div>
          <div>          <button className="bg-green-500 text-white px-4 py-2 rounded ml-4 mr-5" onClick={() => navigate('/Teacher/Homepage/sharedfiles')}>
            Shared Files
          </button></div>
          

        </div>
      </header>
      <main className="page-content">
        <FileExplorerContainer />
      </main>
    </div>
  );
};

export default TeacherHomepageAllFiles;
