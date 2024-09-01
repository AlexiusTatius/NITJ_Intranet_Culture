import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

const FolderComponent = ({
  AllFolder,
  SharedFolder,
  onFolderClick,
  isShared = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(
    AllFolder ? AllFolder.name : SharedFolder.name
  );
  const folderId = AllFolder ? AllFolder._id : SharedFolder._id;

  const handleRename = async () => {
    if (!folderName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFolder/${folderId}`,
        { newName: folderName }
      );

      if (response.data.message) {
        setIsEditing(false);
        AllFolder.onItemUpdate();
      } else {
        toast.error("Failed to rename folder");
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while renaming the folder"
      );
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the folder "${folderName}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await apiTeacherInstance.delete(
        `/file-folder/deleteFolder/${folderId}`,
        {
          data: { confirmDelete: true },
        }
      );

      if (response.data.message) {
        AllFolder.onItemUpdate();
      } else {
        toast.error("Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      if (error.response?.status === 409) {
        const confirmForceDelete = window.confirm(
          error.response.data.message + " Do you want to delete it anyway?"
        );
        if (confirmForceDelete) {
          handleDelete();
        }
      } else {
        toast.error(
          error.response?.data?.error ||
            "An error occurred while deleting the folder"
        );
      }
    }
  };

  const handleThreeDotsClick = (event) => {
    event.stopPropagation(); // Stop the click event from propagating to the parent
  };

  return (
    <div className="folder-component" onClick={() => onFolderClick()}>
      <img src="/Folder.svg" alt="Folder" className="folder-icon" />
      {isEditing ? (
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleRename();
          }}
          className="folder-name-edit"
          autoFocus
        />
      ) : (
        <span className="folder-name" onDoubleClick={() => setIsEditing(true)}>
          {folderName}
        </span>
      )}
      <div onClick={handleThreeDotsClick}>
        {AllFolder &&
          (isShared ? (
            <ThreeDotsMenu
              options={[
                {
                  label: "Rename",
                  action: () => setIsEditing(true),
                },
                {
                  label: "Delete",
                  action: handleDelete,
                },
                {
                  label: "Unshare",
                  action: AllFolder.onItemUnshare,
                },
              ]}
            />
          ) : (
            <ThreeDotsMenu
              options={[
                {
                  label: "Rename",
                  action: () => setIsEditing(true),
                },
                {
                  label: "Delete",
                  action: handleDelete,
                },
                {
                  label: "Share",
                  action: AllFolder.onItemShare,
                },
              ]}
            />
          ))}
        {SharedFolder &&
          (isShared ? (
            <ThreeDotsMenu
              options={[
                {
                  label: "Unshare",
                  action: SharedFolder.onItemUnshare,
                },
              ]}
            />
          ) : (
            <></>
          ))}
      </div>
    </div>
  );
};

export default FolderComponent;
