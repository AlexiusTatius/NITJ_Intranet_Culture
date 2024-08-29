import React from 'react';
import ThreeDotsMenu from '../ThreeDotsMenu/ThreeDots';
import {apiTeacherInstance} from '../../Helper/axiosInstance';

const FileComponent = ({ file, onFileUpdate, onFileClick }) => {
  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(`/file-folder/renameFile/${file._id}`,
        { newName }
      );

      if (response.data.message) {
        onFileUpdate();
      } else {
        alert('Failed to rename file');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      alert(error.response?.data?.error || 'An error occurred while renaming the file');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the file "${file.name}"?`);
    if (!confirmDelete) return;

    try {
      const response = await apiTeacherInstance.delete(`/file-folder/deleteFile/${file._id}`,);
      if (response.data.message) {
        onFileUpdate();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(error.response?.data?.error || 'An error occurred while deleting the file');
    }
  };

  return (
    <div className="file-component" onClick={() => onFileClick(file._id)}>
      <img src="/Pdf.svg" alt={file.mimeType} className="file-icon" />
      <span className="file-name">{file.name}</span>
      <span className="file-info">{(file.size / 1024).toFixed(2)} KB</span>
      <span className="file-info hidden md:inline-block" >
        | Last modified: {new Date(file.updatedAt).toLocaleDateString()}
      </span>
      <ThreeDotsMenu
        options={[
          {
            label: "Rename",
            action: () => {
              const newName = prompt("Enter new file name:", file.name);
              if (newName) handleRename(newName);
            },
          },
          {
            label: "Delete",
            action: handleDelete,
          },
        ]}
      />
    </div>
  );
};

export default FileComponent;