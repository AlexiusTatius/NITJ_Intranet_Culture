import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TeacherHomepage.css';
import FileExplorerContainer from '../../Components/FileExplorerContainer/FileExplorerContainer';

const TeacherHomepageAllFiles = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event) => {
      // If the user tries to go back, redirect to the home page
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    navigate('/', { replace: true });
  };

  return (
    <div className="file-explorer-page w-full">
      <header className="page-header">
        <div className="flex justify-between items-center w-[100vw]">
          <div>
            <h1 className="mr-auto text-left">All Files</h1>
          </div>
          <div className="flex items-center">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded ml-4 mr-5"
              onClick={() => navigate('/Teacher/Homepage/sharedfiles')}
            >
              Shared Files
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded ml-4 mr-5"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="page-content">
        <FileExplorerContainer />
      </main>
    </div>
  );
};

export default TeacherHomepageAllFiles;