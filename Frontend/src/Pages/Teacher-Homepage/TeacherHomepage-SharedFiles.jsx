import React from "react";
import "./TeacherHomepage.css";
import SharedFileExplorerContainer from "../../Components/SharedExplorerContainer/SharedFilesExplorerContainer";
import { useNavigate } from "react-router-dom";
import { ShareLinkComponent } from "../../Components/SharedExplorerContainer/share-link";

const TeacherHomepageSharedFiles = () => {
  const navigate = useNavigate();

  return (
    <div className="file-explorer-page w-full">
      <header className="page-header">
        <div className="flex justify-between items-center w-[100vw]">
          <div>
            <h1 className="mr-auto text-left">Shared Files</h1>
          </div>
          <div className="flex items-center">
            <ShareLinkComponent />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded ml-4 mr-5"
              onClick={() => navigate("/Teacher/Homepage/allfiles")}>
              All Files
            </button>
          </div>
        </div>
      </header>
      <main className="page-content">
        <SharedFileExplorerContainer />
      </main>
    </div>
  );
};

export default TeacherHomepageSharedFiles;
