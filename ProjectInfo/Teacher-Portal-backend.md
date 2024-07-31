# The Teacher Portal Backend
The teacher portal backend consists of all the ideas which came to my mind while creating the teacher portal. 
1. In the user schema, the folderPath will only contains: "./TeacherFolders/alexiustatius@gmail.com-Alexius Tatius/". Remove the "AllFiles"
2. In the controller 2 sub-folders would automatically get created called "AllFiles" & "SharedFiles"
3. Before building the below API's you must solve the problem of authorisation and authentication, and tokens.
4. Multiple API's to be created for the following functionalities:
    - Create a new folder --> POST /api/teacher/createFolder
    - Delete a folder. --> DELETE /api/teacher/deleteFolder
    - Transfer a folder to shared files.  --> PUT /api/teacher/transferFolder
    - Open a folder. --> GET /api/teacher/openFolder
    - Transfer a file to shared files.
    - Open a pdf file.
    - Delete a file.
    - Delete a folder.
    - Delete a file in the folder.
    - Upload multiple files.
    - Display the files to the students.

5. How would handle deleting a folder which contains sub-folders and files?
6. How would you handle the case where the user tries to delete a folder which is not present?
7. What if someone tries to delete the root folder? (don't let them access it)
8. How would you handle the case where the user tries to create a folder with no parent folder?

I think we don't need to create a seperate Shared_Files folder. We can just add a boolean field in the file schema called shared. If the file is shared then the boolean field will be true else false.
How would make sure that those folders, sub-folders and files are shared with the students?
We'll simply create a seperate collection in the mongoDB called sharedFiles. This collection will contain the shared files and folders. The shared files and folders will be stored in the sharedFiles collection. 


**IMPORTANT**: The data-base will store only relative path while the fs.mkdir will create the folder in the absolute path, so we need to convert the relative path to absolute path. The base of the path will be picked from the `config.js`


Reference Chat GPT:
https://chatgpt.com/c/f442a716-8976-4235-8a2e-5601409837fe

Here's also a reference to markdown file of createFolderAPI: [Create Folder API markdown](./WritingTheCreateFolderAPI.md)