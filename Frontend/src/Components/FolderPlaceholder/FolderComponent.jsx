import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { apiTeacherInstance } from "../../Helper/axiosInstance";
import { DeleteConfirmation } from "../FilePlaceholder/DeleteConfirmation";

const FolderComponent = ({
  AllFolder,
  SharedFolder,
  StudentViewFolder,
  onFolderClick,
  isShared = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const folderId = AllFolder
    ? AllFolder._id
    : SharedFolder
    ? SharedFolder._id
    : StudentViewFolder._id;
  const folderName = AllFolder
    ? AllFolder.name
    : SharedFolder
    ? SharedFolder.name
    : StudentViewFolder.name;

  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFolder/${folderId}`,
        { newName }
      );

      if (response.data.message) {
        AllFolder.onItemUpdate();
        toast.success("Folder renamed successfully!");
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

  const confirmDelete = () => {
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await apiTeacherInstance.delete(
        `/file-folder/deleteFolder/${folderId}`,
        {
          data: { confirmDelete: true },
        }
      );

      if (response.data.message) {
        AllFolder.onItemUpdate();
        toast.success("Folder deleted successfully!");
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
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleThreeDotsClick = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      <div className="folder-component" onClick={() => onFolderClick()}>
        <img src="/Folder.svg" alt="Folder" className="folder-icon" />
        <span className="folder-name">{folderName}</span>
        {AllFolder &&
          (isShared ? (
            <>
              <span className="md:hidden bg-green-100 text-green-900 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                ✔
              </span>
              <span className="hidden md:inline-block bg-green-100 text-green-900 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                Shared
              </span>
            </>
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
                    action: confirmDelete,
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
                    action: confirmDelete,
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
          {StudentViewFolder && <></>}
        </div>
      </div>
      <DeleteConfirmation
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FolderComponent;
