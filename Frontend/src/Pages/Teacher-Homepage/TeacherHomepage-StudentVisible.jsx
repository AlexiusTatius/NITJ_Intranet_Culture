import React from 'react';
import './TeacherHomepage.css';
import StudentVisibleSharedExplorer from '../../Components/StudentVisibleSharedExplorer/StudentVisibleSharedExplorer';

const StudentViewHomepageSharedFiles = () => {
  return (
    <div className="file-explorer-page w-full">
      <header className="page-header">
        <div className='flex justify-between items-center w-[100vw]'>
          <div><h1 className="mr-auto text-left">Files and Folders</h1></div>
        </div>
      </header>
      <main className="page-content">
        <StudentVisibleSharedExplorer />
      </main>
    </div>
  );
};

export default StudentViewHomepageSharedFiles;