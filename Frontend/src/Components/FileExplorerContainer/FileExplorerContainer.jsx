import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FolderComponent from "../FolderPlaceholder/FolderComponent";
import FileComponent from "../FilePlaceholder/FileComponent";
import "./FileExplorerContainer.css";
import { apiTeacherInstance } from "../../Helper/axiosInstance";
import { Search, FolderPlus, Upload, ChevronLeft, Loader } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FileExplorerContainer = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFolderContents("root"); // Start with the root folder
  }, []);

  const fetchFolderContents = async (folderId) => {
    setIsLoading(true);
    try {
      const response = await apiTeacherInstance.get(
        `/file-folder/folderStructure/${folderId}`
      );
      const data = response.data;
      setContents([
        ...data.folderStructure.children.map((folder) => ({
          ...folder,
          type: "folder",
        })),
        ...data.folderStructure.files.map((file) => ({
          ...file,
          type: "file",
        })),
      ]);
      setCurrentFolder(data.folderStructure);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching folder contents:", err);
      setError("Failed to fetch folder contents");
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folderId) => {
    fetchFolderContents(folderId);
  };

  const handleBackClick = () => {
    if (currentFolder && currentFolder.parentFolder) {
      fetchFolderContents(currentFolder.parentFolder);
    } else {
      fetchFolderContents("root");
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContents = contents.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    try {
      const response = await apiTeacherInstance.post(
        "/file-folder/createFolder",
        {
          name: newFolderName,
          parentFolderId: currentFolder._id,
        }
      );

      if (response.data._id) {
        fetchFolderContents(currentFolder._id);
        setNewFolderName("");
        setIsCreatingFolder(false);
        toast.success("Folder created successfully");
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while creating the folder"
      );
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await apiTeacherInstance.post(
        `/file-folder/uploadFile/${currentFolder._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        fetchFolderContents(currentFolder._id);
        toast.success(response.data.message || "Files uploaded successfully");
      } else {
        toast.error(
          response.data.message ||
            response.data.error ||
            "Failed to upload files"
        );
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "An error occurred while uploading files"
      );
    }
  };

  const handleFileClick = (fileId) => {
    navigate(`/pdf-viewer/${fileId}`);
  };

  const handleShare = async (item) => {
    try {
      const endpoint = item.type === "folder" ? "shareFolder" : "shareFile";
      const response = await apiTeacherInstance.put(
        `/file-folder/${endpoint}/${item._id}`
      );
      if (response.data.message) {
        toast.success(
          `${item.type === "folder" ? "Folder" : "File"} shared successfully`
        );
        fetchFolderContents(currentFolder._id);
      } else {
        toast.error(`Failed to share ${item.type}`);
      }
    } catch (error) {
      console.error(`Error sharing ${item.type}:`, error);
      toast.error(
        error.response?.data?.error ||
          `An error occurred while sharing the ${item.type}`
      );
    }
  };

  const handleUnshare = async (item) => {
    try {
      const endpoint = item.type === "folder" ? "unshareFolder" : "unshareFile";
      const response = await apiTeacherInstance.put(
        `/file-folder/${endpoint}/${item._id}`
      );
      if (response.data.message) {
        toast.success(
          `${item.type === "folder" ? "Folder" : "File"} unshared successfully`
        );
        fetchFolderContents(currentFolder._id);
      } else {
        toast.error(`Failed to unshare ${item.type}`);
      }
    } catch (error) {
      console.error(`Error unsharing ${item.type}:`, error);
      toast.error(
        error.response?.data?.error ||
          `An error occurred while unsharing the ${item.type}`
      );
    }
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
      className="file-explorer-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="file-explorer-header">
        <div className="flex items-center">
          {currentFolder && currentFolder.parentFolder && (
            <motion.button
              onClick={handleBackClick}
              className="back-button mr-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={16} className="inline mr-1" />
              Back
            </motion.button>
          )}
          <h2 className="folder-name text-2xl">
            {currentFolder ? currentFolder.name : "Root"}
          </h2>
        </div>
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search in current folder"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>
      <div className="file-explorer-actions">
        <motion.button
          onClick={() => setIsCreatingFolder(true)}
          className="create-folder-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FolderPlus size={18} className="inline mr-2" />
          Create Folder
        </motion.button>
        <motion.div
          className="file-upload-container hover:cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.button className="file-upload-button hover:cursor-pointer">
            <Upload size={18} className="inline mr-2" />
            Upload Files
          </motion.button>
          <input
            type="file"
            onChange={handleFileUpload}
            multiple
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="file-upload-input hover:cursor-pointer"
          />
        </motion.div>
      </div>
      <div className="file-explorer-content ">
        {isCreatingFolder ? (
          <div className="folder-component gap-4">
            <div className="folder-right flex">
              <img src="/Folder.svg" alt="Folder" className="folder-icon " />
              <input
                type="text"
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={handleCreateFolder}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
                className="create-folder-input pl-1 outline-blue-500"
                autoFocus
              />
            </div>
            <button
              className="px-3 py-1 bg-red-500 rounded-md text-white hover:cursor-pointer hover:bg-red-600"
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          ""
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <AnimatePresence>
            {filteredContents.length > 0 ? (
              filteredContents.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {item.type === "folder" ? (
                    <FolderComponent
                      AllFolder={item}
                      onFolderClick={() => handleFolderClick(item._id)}
                    />
                  ) : (
                    <FileComponent
                      file={item}
                      onFileClick={() => handleFileClick(item._id)}
                      onShare={() => handleShare(item)}
                      onUnshare={() => handleUnshare(item)}
                    />
                  )}
                </motion.div>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </AnimatePresence>
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default FileExplorerContainer;
