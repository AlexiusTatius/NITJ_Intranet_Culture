import React from 'react';
import './TeacherHomepage.css';
import FileExplorerContainer from '../../Components/FileExplorerContainer/FileExplorerContainer';

const TeacherHomepage = () => {
  return (
    <div className="file-explorer-page">
      <header className="page-header">
        <h1>All Files</h1>
      </header>
      <main className="page-content">
        <FileExplorerContainer />
      </main>
    </div>
  );
};

export default TeacherHomepage;