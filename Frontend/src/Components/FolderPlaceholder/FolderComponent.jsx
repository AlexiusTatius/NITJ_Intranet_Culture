import React from 'react';
import ThreeDotsMenu from '../ThreeDotsMenu/ThreeDots'
import { apiTeacherInstance } from '../../Helper/axiosInstance';

const FolderComponent = ({ folder, onFolderClick, onFolderUpdate }) => {
  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFolder/${folder._id}`,
        { newName },
      );

      if (response.data.message) {
        onFolderUpdate();
      } else {
        alert('Failed to rename folder');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert(error.response?.data?.error || 'An error occurred while renaming the folder');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the folder "${folder.name}"?`);
    if (!confirmDelete) return;

    try {
      const response = await apiTeacherInstance.delete(
        `/file-folder/deleteFolder/${folder._id}`,
        {
          data: { confirmDelete: true },
        }
      );

      if (response.data.message) {
        onFolderUpdate();
      } else {
        alert('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      if (error.response?.status === 409) {
        const confirmForceDelete = window.confirm(error.response.data.message + ' Do you want to delete it anyway?');
        if (confirmForceDelete) {
          handleDelete();
        }
      } else {
        alert(error.response?.data?.error || 'An error occurred while deleting the folder');
      }
    }
  };
  const handleThreeDotsClick = (event) => {
    event.stopPropagation(); // Stop the click event from propagating to the parent
  };

  return (
    <div className="folder-component" onClick={() => onFolderClick(folder._id)}>
      <img src="/Folder.svg" alt="Folder" className="folder-icon" />
      <span className="folder-name">{folder.name}</span>
      <div onClick={handleThreeDotsClick}>
        <ThreeDotsMenu
          options=
          {
            [
              {
                label: 'Rename', action: () => {
                  const newName = prompt('Enter new folder name:', folder.name);
                  if (newName) handleRename(newName);
                }
              },
              {
                label: 'Delete', action: handleDelete
              },
            ]
          }
        />
      </div>
    </div>
  );
};

export default FolderComponent;