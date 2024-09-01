import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

const FolderComponent = ({
  AllFolder,
  SharedFolder,
  onFolderClick,
  isShared = false,
}) => {
  const folderId = AllFolder ? AllFolder._id : SharedFolder._id;
  const folderName = AllFolder ? AllFolder.name : SharedFolder.name;

  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFolder/${folderId}`,
        { newName }
      );

      if (response.data.message) {
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
      <span className="folder-name">{folderName}</span>
      {SharedFolder &&
        (isShared ? (
          <div className="mr-2">
            <span className="md:hidden bg-green-100 text-green-900 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
              ✔
            </span>
            <span className="hidden md:inline-block bg-green-100 text-green-900 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
              Shared
            </span>
          </div>
        ) : (
          <></>
        ))}
      <div onClick={handleThreeDotsClick}>
        {AllFolder &&
          (isShared ? (
            <ThreeDotsMenu
              options={[
                {
                  label: "Rename",
                  action: () => {
                    const newName = prompt(
                      "Enter new folder name:",
                      folderName
                    );
                    if (newName) handleRename(newName);
                  },
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
                  action: () => {
                    const newName = prompt(
                      "Enter new folder name:",
                      folderName
                    );
                    if (newName) handleRename(newName);
                  },
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
