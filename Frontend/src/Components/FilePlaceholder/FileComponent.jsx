import React, { useState } from "react";
import ThreeDotsMenu from "../ThreeDotsMenu/ThreeDots";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiTeacherInstance } from "../../Helper/axiosInstance";
import { DeleteConfirmation } from "./DeleteConfirmation"; // Import the DeleteConfirmation component
import { GeneratePdfLinkDialog } from "./GeneratePdfLink"; // Import the GeneratePdfLink component


const FileComponent = ({AllFile, SharedFile, onFileClick, StudentViewFile, isShared = false}) => {
  const [isDeleting, setIsDeleting] = useState(false); // State for delete process
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State to open the delete dialog
  const [pdfLink, setPdfLink] = useState(""); // State to store the generated PDF link
  const [openPdfDialog, setOpenPdfDialog] = useState(false); // State to check if the PDF link is generated
  const [pdfIsLoading, setPdfIsLoading] = useState(false); // State to check if the PDF link is loading


  const fileId = AllFile ? AllFile._id : (SharedFile ? SharedFile._id : StudentViewFile._id);
  const fileName = AllFile ? AllFile.name : (SharedFile ? SharedFile.name : StudentViewFile.name);
  const fileMimeType = AllFile ? AllFile.mimeType : (SharedFile ? SharedFile.mimeType : StudentViewFile.mimeType);
  const fileSize = AllFile ? AllFile.size : (SharedFile ? SharedFile.size : StudentViewFile.size);
  const fileUpdatedAt = AllFile ? AllFile.updatedAt : (SharedFile ? SharedFile.updatedAt : StudentViewFile.updatedAt);

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

  const openPdfDialogBox = () => {
    handleGeneratePdfLink(); // Open the GeneratePdfLink dialog
  };

  const handleGeneratePdfLink = async () => {
    setPdfIsLoading(true);
    console.log("Generating PDF link for file:", fileId);
    try {
      const response = await apiTeacherInstance.get(
        `/file-folder/generatePdfLink/${fileId}`
      );
      if (response.data.success) {
        setPdfLink(response.data.pdfLink);
        setOpenPdfDialog(true);
        toast({
          title: "Success",
          description: response.data.message,
        });
      } else {
        throw new Error("Failed to generate link");
      }
    }catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate the PDF link. Please try again.",
        variant: "destructive",
      });
    }finally {
      setPdfIsLoading(false);
    }
  };
  

  return (
    <>
      <div className="file-component" onClick={() => onFileClick()}>
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
        {!StudentViewFile && (
          <>
            <span className="file-info">{(fileSize / 1024).toFixed(2)} KB</span>
            <span className="file-info hidden md:inline-block">
              | Last modified: {new Date(fileUpdatedAt).toLocaleDateString()}
            </span>
          </>
        )}
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
                {
                  label: pdfIsLoading ? "Generating..." : "Generate Link",
                  action: openPdfDialogBox,
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
                {
                  label: pdfIsLoading ? "Generating..." : "Generate Link",
                  action: openPdfDialogBox,
                }
              ]}
            />
          ) : (
            <></>
          ))}
        {StudentViewFile && (
          <></>
        )}
      </div>
      {/* Render the delete confirmation dialog */}
      <DeleteConfirmation
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        handleDelete={handleDelete} 
        isDeleting={isDeleting}
      />
      <GeneratePdfLinkDialog
        isOpen={openPdfDialog}
        setIsOpen={setOpenPdfDialog}
        pdfLink={pdfLink}
      />
    </>
  );
};

export default FileComponent;
