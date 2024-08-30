import React from 'react';
import './TeacherHomepage.css';
import SharedFileExplorerContainer from '../../Components/SharedExplorerContainer/SharedFilesExplorerContainer';

const TeacherHomepageSharedFiles = () => {
  return (
    <div className="file-explorer-page w-full">
      <header className="page-header">
        <h1>Shared Files</h1>
      </header>
      <main className="page-content">
        <SharedFileExplorerContainer />
      </main>
    </div>
  );
};

export default TeacherHomepageSharedFiles;