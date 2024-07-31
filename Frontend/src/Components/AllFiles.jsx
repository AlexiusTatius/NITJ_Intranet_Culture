import React, { useState, useEffect } from "react";

const FolderNavigator = () => {
  const [folder, setFolder] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [path, setPath] = useState(["root"]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    axios.get('http://localhost:8001/api/user/Teacher/folder/getFolderStructure')
      .then((response) => {
        setFolder(response.data);
        setCurrentFolder(response.data);
      })
      .catch((error) => console.error("Error loading folder structure:", error));
  }, []);

  const handleFolderClick = (clickedFolder) => {
    setCurrentFolder(clickedFolder);
    setPath((prevPath) => [...prevPath, clickedFolder.name]);
  };

  const handleBackClick = () => {
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);

    let tempFolder = folder;
    for (let i = 1; i < newPath.length; i++) {
      tempFolder = tempFolder.contents.find((item) => item.name === newPath[i]);
    }
    setCurrentFolder(tempFolder);
  };

  const handleNewFolderChange = (e) => {
    setNewFolderName(e.target.value);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      name: newFolderName.trim(),
      path: `${currentFolder.path}/${newFolderName.trim()}`,
      contents: []
    };

    const addFolderToStructure = (folder, pathParts) => {
      if (pathParts.length === 0) return;

      const [nextPart, ...restParts] = pathParts;
      const targetFolder = folder.contents.find((item) => item.name === nextPart);

      if (targetFolder) {
        if (restParts.length === 0) {
          targetFolder.contents.push(newFolder);
        } else {
          addFolderToStructure(targetFolder, restParts);
        }
      }
    };

    addFolderToStructure(folder, path.slice(1));

    // Update the current folder and reset the input field
    setCurrentFolder((prev) => {
      if (!prev) return prev;

      const updatedContents = [...prev.contents];
      return {
        ...prev,
        contents: updatedContents
      };
    });

    setNewFolderName("");
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(folder, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "updatedFolderStructure.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };


  if (!currentFolder) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <button onClick={handleBackClick} disabled={path.length === 1}>
          Back
        </button>
        <span>Current Path: {path.join("/")}</span>
      </div>
      <div>
        <input
          type="text"
          value={newFolderName}
          onChange={handleNewFolderChange}
          placeholder="New folder name"
        />
        <button onClick={handleCreateFolder}>Create Folder</button>
        <button onClick={handleDownload}>Download JSON</button>
      </div>
      <ul>
        {currentFolder.contents.map((item) => (
          <li
            key={item.path}
            onClick={() => Array.isArray(item.contents) && handleFolderClick(item)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};


export default FolderNavigator;
