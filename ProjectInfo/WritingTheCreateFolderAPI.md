As per discussed in the mind earlier, here are the points which I think could help in writingthe create folder API.


1. Whenever the user signs up, 3 things get created:
    - The All Files folder
    - The shared Files folder
    - The json file structure
        - The structure of json files contains: 
            - `${email}-{user}`
            - `AllFiles`
            - `SharedFiles`

2. Whenever the user logs in the user requests the json file structure from the backend server, so that the file structure could be rendered in the front-end. The logic of rendering the fron folder in the front-end is written in AllFiles.jsx.

## The API call for creating a new folder. 
### Whenever a new folder is created
1. The json file in the frontend is updated (which is then sent to the backend server), according to the code written in the AllFiles.jsx
2. Then in the backend, we can easily create a new directory. How? Well the frontend would also send the path of the new directory (which was newly created), we can use the `fs` module to create the folder in the backend.
3. Just keep the json file updated in the backend, whenever you create a new folder.