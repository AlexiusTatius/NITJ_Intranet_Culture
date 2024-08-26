import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FolderComponent from '../FolderPlaceholder/FolderComponent';
import FileComponent from '../FilePlaceholder/FileComponent';
import './FileExplorerContainer.css';
import { Search, FolderPlus, Upload, ChevronLeft, Loader } from 'lucide-react';

const FileExplorerContainer = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFolderContents('root'); // Start with the root folder
  }, []);

  const fetchFolderContents = async (folderId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token'); // Assuming you store the JWT in localStorage
      const response = await axios.get(`http://localhost:8001/api/user/Teacher/file-folder/folderStructure/${folderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data;
      setContents([
        ...data.folderStructure.children.map(folder => ({ ...folder, type: 'folder' })),
        ...data.folderStructure.files.map(file => ({ ...file, type: 'file' }))
      ]);
      setCurrentFolder(data.folderStructure);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching folder contents:', err);
      setError('Failed to fetch folder contents');
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
      fetchFolderContents('root');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContents = contents.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post(
        'http://localhost:8001/api/user/Teacher/file-folder/createFolder',
        {
          name: folderName,
          parentFolderId: currentFolder._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data._id) {
        fetchFolderContents(currentFolder._id);
        alert('Folder created successfully');
      } else {
        alert('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert(error.response?.data?.error || 'An error occurred while creating the folder');
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      formData.append('files', files[i]);
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post(
        `http://localhost:8001/api/user/Teacher/file-folder/uploadFile/${currentFolder._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        fetchFolderContents(currentFolder._id);
        alert(response.data.message || 'Files uploaded successfully');
      } else {
        alert(response.data.message || response.data.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'An error occurred while uploading files');
    }
  };

  const handleFileClick = (fileId) => {
    navigate(`/pdf-viewer/${fileId}`);
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
          <h2 className="folder-name text-2xl">{currentFolder ? currentFolder.name : 'Root'}</h2>
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
          onClick={handleCreateFolder} 
          className="create-folder-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FolderPlus size={18} className="inline mr-2" />
          Create Folder
        </motion.button>
        <div className="file-upload-container">
          <motion.button 
            className="file-upload-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={18} className="inline mr-2" />
            Upload Files
          </motion.button>
          <input 
            type="file" 
            onChange={handleFileUpload} 
            multiple 
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="file-upload-input"
          />
        </div>  
      </div>
      <div className="file-explorer-content">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <AnimatePresence>
            {filteredContents.map(item => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
              >
                {item.type === 'folder' ? (
                  <FolderComponent 
                    folder={item} 
                    onFolderClick={() => handleFolderClick(item._id)}
                    onFolderUpdate={() => fetchFolderContents(currentFolder._id)}
                  />
                ) : (
                  <FileComponent 
                    file={item}
                    onFileUpdate={() => fetchFolderContents(currentFolder._id)}
                    onFileClick={() => handleFileClick(item._id)}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default FileExplorerContainer;