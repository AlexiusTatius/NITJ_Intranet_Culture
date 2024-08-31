import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FolderComponent from '../FolderPlaceholder/FolderComponent';
import FileComponent from '../FilePlaceholder/FileComponent';
import './SharedFileExplorerContainer.css';
import { apiTeacherInstance } from '../../Helper/axiosInstance';
import { Search, ChevronLeft, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SharedFileExplorerContainer = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchSharedFolderContents('root');
  }, []);

  const fetchSharedFolderContents = async (folderId) => {
    setIsLoading(true);
    try {
      const response = await apiTeacherInstance.get(`/file-folder/sharedStructure/${folderId}`);
      const data = response.data;
      setContents([
        ...data.sharedStructure.children.map(folder => ({ ...folder, type: 'folder' })),
        ...data.sharedStructure.files.map(file => ({ ...file, type: 'file' }))
      ]);
      setCurrentFolder(data.sharedStructure);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching shared folder contents:', err);
      setError('Failed to fetch shared folder contents');
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
      fetchSharedFolderContents('root');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContents = contents.filter(item =>  
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleFileClick = (fileId) => {
    navigate(`/pdf-viewer/${fileId}`);
  };
  
  const handleShare = async (item) => {
    try {
      const endpoint = item.type === 'folder' ? 'shareFolder' : 'shareFile';
      const response = await apiTeacherInstance.put(`/file-folder/${endpoint}/${item._id}`);
      if (response.data.message) {
        toast.success(`${item.type === 'folder' ? 'Folder' : 'File'} shared successfully`);
        fetchSharedFolderContents(currentFolder._id);
      } else {
        toast.error(`Failed to share ${item.type}`);
      }
    } catch (error) {
      console.error(`Error sharing ${item.type}:`, error);
      toast.error(error.response?.data?.error || `An error occurred while sharing the ${item.type}`);
    }
  };

  const handleUnshare = async (item) => {
    try {
      const endpoint = item.type === 'folder' ? 'unshareFolder' : 'unshareFile';
      const response = await apiTeacherInstance.put(`/file-folder/${endpoint}/${item._id}`);
      if (response.data.message) {
        toast.success(`${item.type === 'folder' ? 'Folder' : 'File'} unshared successfully`);
        fetchSharedFolderContents(currentFolder._id);
      } else {
        toast.error(`Failed to unshare ${item.type}`);
      }
    } catch (error) {
      console.error(`Error unsharing ${item.type}:`, error);
      toast.error(error.response?.data?.error || `An error occurred while unsharing the ${item.type}`);
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
      className="shared-file-explorer-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="shared-file-explorer-header">
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
            placeholder="Search in shared files" 
            value={searchTerm} 
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>
      <div className="shared-file-explorer-content">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : filteredContents.length === 0 ? (
          <p className="text-gray-500 text-center">No files currently shared</p>
        ) : (
          <AnimatePresence>
            {filteredContents.map(item => {
              const itemObject = {
                ...item,
                onItemUnshare: () => handleUnshare(item),
              }
              return (
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
                    SharedFolder={itemObject}
                    onFolderClick={() => handleFolderClick(item._id)}
                    isShared={item.isShared}
                    />
                  ) : (
                    <FileComponent 
                    SharedFile={itemObject}
                    onFileClick={() => handleFileClick(item._id)}
                    isShared={item.isShared}
                    />
                  )}
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default SharedFileExplorerContainer;