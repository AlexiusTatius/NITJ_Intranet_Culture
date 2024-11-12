import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TeacherHomepage.css";
import FileExplorerContainer from "../../Components/FileExplorerContainer/FileExplorerContainer";

const TeacherHomepageAllFiles = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event) => {
      // If the user tries to go back, redirect to the home page
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    navigate("/", { replace: true });
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
              className="bg-green-500 text-white px-4 py-2 rounded ml-4 mr-3"
              onClick={() => navigate("/Teacher/Homepage/sharedfiles")}>
              Shared Files
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded ml-2 mr-5"
              onClick={handleLogout}>
              <span className="md:hidden inline-block">
                <svg
                  className="h-4 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                </svg>
              </span>
              <span className="hidden md:inline-block">Logout</span>
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