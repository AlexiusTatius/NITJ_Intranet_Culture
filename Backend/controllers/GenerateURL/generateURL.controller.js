const generateSharedFileURL = (email) => {
    // Extract the part of the email before the '@' symbol
    const emailPrefix = email.split('@')[0];
    
    // Construct the URL
    const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const sharedFilesPath = 'Sharedfiles';
    
    // Combine all parts to form the final URL
    const uniqueURL = `${baseURL}/${emailPrefix}/${sharedFilesPath}`;
    
    return uniqueURL;
};

// http://localhost:5173/mehtabs.cs.21/pdf-viewer/66ef152fec16a43279468880

const generatePdfURL = (email, fileId) => {
    // Extract the part of the email before the '@' symbol
    const emailPrefix = email.split('@')[0];
    
    // Construct the URL
    const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const pdfViewerPath = 'pdf-viewer';
    
    // Combine all parts to form the final URL
    const pdfURL = `${baseURL}/${emailPrefix}/${pdfViewerPath}/${fileId}`;
    return pdfURL;
}

// Example usage
const generateUniqueShareableLink = async (req, res) => {
    try {
        const { email } = req.user; 
        
        if (!email) {
            return res.status(400).json({ message: "User email not found" });
        }
        
        const shareableLink = generateSharedFileURL(email);
        
        res.status(200).json({ 
            success: true, 
            shareableLink, 
            message: "Shareable link generated successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generatePdfLink = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { email } = req.user;
        if (!fileId) {
            return res.status(400).json({ message: "File ID not found" });
        }
        
        const pdfLink = generatePdfURL(email, fileId);
        
        res.status(200).json({ 
            success: true, 
            pdfLink, 
            message: "PDF link generated successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



export { generateUniqueShareableLink, generatePdfLink };