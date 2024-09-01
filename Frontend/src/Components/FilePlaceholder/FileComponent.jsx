import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

const FileComponent = ({ file, onFileClick, isShared }) => {
  // Check if the file prop is provided and is valid
  if (!file) {
    console.error("FileComponent: `file` prop is missing or undefined.");
    return <div>Error: File data not found</div>;
  }

  const { _id, name } = file;

  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFile/${_id}`,
        { newName }
      );

      if (response.data.message) {
        // Refresh or update the list to reflect changes
        if (onFileClick) onFileClick();
      } else {
        toast.error("Failed to rename file");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while renaming the file"
      );
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the file "${name}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await apiTeacherInstance.delete(
        `/file-folder/deleteFile/${_id}`,
        {
          data: { confirmDelete: true },
        }
      );

      if (response.data.message) {
        // Refresh or update the list to reflect changes
        if (onFileClick) onFileClick();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while deleting the file"
      );
    }
  };

  const handleThreeDotsClick = (event) => {
    event.stopPropagation(); // Stop the click event from propagating to the parent
  };

  return (
    <div className="file-component" onClick={() => onFileClick()}>
      <img src="/File.svg" alt="File" className="file-icon" />
      <span className="file-name">{name}</span>
      <div onClick={handleThreeDotsClick}>
        {isShared ? (
          <ThreeDotsMenu
            options={[
              {
                label: "Rename",
                action: () => {
                  const newName = prompt("Enter new file name:", name);
                  if (newName) handleRename(newName);
                },
              },
              {
                label: "Delete",
                action: handleDelete,
              },
              // Add other options if needed
            ]}
          />
        ) : (
          <ThreeDotsMenu
            options={[
              {
                label: "Rename",
                action: () => {
                  const newName = prompt("Enter new file name:", name);
                  if (newName) handleRename(newName);
                },
              },
              {
                label: "Delete",
                action: handleDelete,
              },
              // Add other options if needed
            ]}
          />
        )}
      </div>
    </div>
  );
};

FileComponent.propTypes = {
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onFileClick: PropTypes.func,
  isShared: PropTypes.bool,
};

export default FileComponent;
