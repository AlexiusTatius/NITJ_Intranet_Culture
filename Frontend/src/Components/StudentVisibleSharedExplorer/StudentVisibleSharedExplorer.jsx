import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FolderComponent from "../FolderPlaceholder/FolderComponent";
import FileComponent from "../FilePlaceholder/FileComponent";
import "./StudentVisibleSharedExplorer.css";
import { apiTeacherInstance } from "../../Helper/axiosInstance";
import { Search, ChevronLeft, Loader, Grid, List } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentVisibleSharedExplorer = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGridView, setIsGridView] = useState(true); // New state to track view mode
  const navigate = useNavigate();
  const { teacherEmailInitials } = useParams();

  useEffect(() => {
    fetchSharedFolderContents("root");
  }, []);

  const fetchSharedFolderContents = async (folderId) => {
    setIsLoading(true);
    try {
      const response = await apiTeacherInstance.get(
        `/file-folder/sharedStructure/${teacherEmailInitials}/${folderId}`
      );
      const data = response.data;
      setContents([
        ...data.sharedStructure.children.map((folder) => ({
          ...folder,
          type: "folder",
        })),
        ...data.sharedStructure.files.map((file) => ({
          ...file,
          type: "file",
        })),
      ]);
      setCurrentFolder(data.sharedStructure);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching shared folder contents:", err);
      setError("Failed to fetch shared folder contents");
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folderId) => {
    fetchSharedFolderContents(folderId);
  };

  const handleBackClick = () => {
    if (currentFolder && currentFolder.parentFolder) {
      fetchSharedFolderContents(currentFolder.parentFolder);
    } else {
      fetchSharedFolderContents("root");
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContents = contents.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileClick = (fileId) => {
    navigate(`/${teacherEmailInitials}/pdf-viewer/${fileId}`);
  };

  const toggleViewMode = () => {
    setIsGridView(!isGridView);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="student-shared-explorer-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <div className="student-shared-explorer-header">
        <div className="flex items-center">
          {currentFolder && currentFolder.parentFolder && (
            <motion.button
              onClick={handleBackClick}
              className="back-button mr-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <ChevronLeft size={16} className="inline mr-1" />
              Back
            </motion.button>
          )}
          <h2 className="folder-name text-2xl">
            {currentFolder ? currentFolder.name : "Root"}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search files and folders"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <motion.button
            onClick={toggleViewMode}
            className="view-toggle-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            {isGridView ? <List size={24} /> : <Grid size={24} />}
          </motion.button>
        </div>
      </div>

      <div
        className={`student-shared-explorer-content ${
          isGridView ? "grid-layout" : "list-layout"
        }`}>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : filteredContents.length === 0 ? (
          <p className="text-gray-500 text-center">
            No files or folders available
          </p>
        ) : (
          <AnimatePresence>
            {filteredContents.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
                className={`${isGridView ? "grid-item" : "list-item"}`}>
                {item.type === "folder" ? (
                  <FolderComponent
                    StudentViewFolder={item}
                    onFolderClick={() => handleFolderClick(item._id)}
                    isShared={true}
                  />
                ) : (
                  <FileComponent
                    StudentViewFile={item}
                    onFileClick={() => handleFileClick(item._id)}
                    isShared={true}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default StudentVisibleSharedExplorer;
