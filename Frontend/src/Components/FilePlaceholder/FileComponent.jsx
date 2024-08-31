import React from 'react';
import ThreeDotsMenu from '../ThreeDotsMenu/ThreeDots';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {apiTeacherInstance} from '../../Helper/axiosInstance';

const FileComponent = ({ AllFile, SharedFile, onFileClick, isShared = false }) => {
  const fileId = AllFile ? AllFile._id : SharedFile._id;
  const fileName = AllFile ? AllFile.name : SharedFile.name;
  const fileMimeType = AllFile ? AllFile.mimeType : SharedFile.mimeType;
  const fileSize = AllFile ? AllFile.size : SharedFile.size;
  const fileUpdatedAt = AllFile ? AllFile.updatedAt : SharedFile.updatedAt;

  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(`/file-folder/renameFile/${fileId}`,
        { newName }
      );

      if (response.data.message) {
        AllFile.onItemUpdate();
        toast.success('File renamed successfully!');
      } else {
        toast.error('Failed to rename file');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error(error.response?.data?.error || 'An error occurred while renaming the file');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the file "${fileName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await apiTeacherInstance.delete(`/file-folder/deleteFile/${fileId}`,);
      if (response.data.message) {
        AllFile.onItemUpdate();
        toast.success('File deleted successfully!');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error.response?.data?.error || 'An error occurred while deleting the file');
    }
  };

  return (
    <div className="file-component" onClick={() => onFileClick()}>
      <img src="/Pdf.svg" alt={fileMimeType} className="file-icon" />
      <span className="file-name">{fileName}</span>
      <span className="file-info">{(fileSize / 1024).toFixed(2)} KB</span>
      <span className="file-info hidden md:inline-block" >
        | Last modified: {new Date(fileUpdatedAt).toLocaleDateString()}
      </span>
      {AllFile && (
        isShared ? (
          <ThreeDotsMenu
            options={[
              {
                label: 'Rename',
                action: () => {
                  const newName = prompt('Enter new file name:', fileName);
                  if (newName) handleRename(newName);
                }
              },
              {
                label: 'Delete',
                action: handleDelete
              },
              {
                label: "Unshare",
                action: AllFile.onItemUnshare,
              },
            ]}
          />
        ) : (
          <ThreeDotsMenu
            options={[
              {
                label: 'Rename',
                action: () => {
                  const newName = prompt('Enter new folder name:', fileName);
                  if (newName) handleRename(newName);
                }
              },
              {
                label: 'Delete',
                action: handleDelete
              },
              {
                label: "Share",
                action: AllFile.onItemShare,
              }
            ]}
          />
        )
      )}
      {SharedFile && (
        isShared ?(
          <ThreeDotsMenu
          options={[
            {
              label: 'Unshare',
              action: SharedFile.onItemUnshare,
            }
          ]}
        />
        ) : (
        <></>
        ) 
      )}
    </div>
  );
};

export default FileComponent;