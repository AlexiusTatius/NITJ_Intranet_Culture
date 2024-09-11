import React, { useState } from "react";
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiTeacherInstance } from "../../Helper/axiosInstance";
import { DeleteConfirmation } from "./DeleteConfirmation"; // Import the DeleteConfirmation component

const FileComponent = ({
  AllFile,
  SharedFile,
  onFileClick,
  isShared = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false); // State for delete process
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State to open the delete dialog

  const fileId = AllFile ? AllFile._id : SharedFile._id;
  const fileName = AllFile ? AllFile.name : SharedFile.name;
  const fileMimeType = AllFile ? AllFile.mimeType : SharedFile.mimeType;
  const fileSize = AllFile ? AllFile.size : SharedFile.size;
  const fileUpdatedAt = AllFile ? AllFile.updatedAt : SharedFile.updatedAt;

  const handleRename = async (newName) => {
    if (!newName) return;

    try {
      const response = await apiTeacherInstance.put(
        `/file-folder/renameFile/${fileId}`,
        { newName }
      );

      if (response.data.message) {
        AllFile.onItemUpdate();
        toast.success("File renamed successfully!");
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

  const confirmDelete = () => {
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await apiTeacherInstance.delete(
        `/file-folder/deleteFile/${fileId}`
      );
      if (response.data.message) {
        AllFile.onItemUpdate();
        toast.success("File deleted successfully!");
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while deleting the file"
      );
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false); // Close the dialog after delete
    }
  };

  return (
    <div
      className="file-component"
      onClick={(e) => {
        // Prevent click event on dialog content from triggering file open
        if (e.target.closest(".dialog-content")) {
          return;
        }
        onFileClick();
      }}>
      <img src="/Pdf.svg" alt={fileMimeType} className="file-icon" />
      <span className="file-name">{fileName}</span>
      {AllFile &&
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
      <span className="file-info">{(fileSize / 1024).toFixed(2)} KB</span>
      <span className="file-info hidden md:inline-block">
        | Last modified: {new Date(fileUpdatedAt).toLocaleDateString()}
      </span>
      {AllFile &&
        (isShared ? (
          <ThreeDotsMenu
            options={[
              {
                label: "Rename",
                action: () => {
                  const newName = prompt("Enter new file name:", fileName);
                  if (newName) handleRename(newName);
                },
              },
              {
                label: "Delete",
                action: confirmDelete, // Trigger delete confirmation dialog
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
                label: "Rename",
                action: () => {
                  const newName = prompt("Enter new folder name:", fileName);
                  if (newName) handleRename(newName);
                },
              },
              {
                label: "Delete",
                action: confirmDelete, // Trigger delete confirmation dialog
              },
              {
                label: "Share",
                action: AllFile.onItemShare,
              },
            ]}
          />
        ))}
      {SharedFile &&
        (isShared ? (
          <ThreeDotsMenu
            options={[
              {
                label: "Unshare",
                action: SharedFile.onItemUnshare,
              },
            ]}
          />
        ) : (
          <></>
        ))}

      {/* Render the delete confirmation dialog */}
      {openDeleteDialog && (
        <DeleteConfirmation
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          handleDelete={handleDelete} // Pass the delete handler to the dialog
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default FileComponent;
