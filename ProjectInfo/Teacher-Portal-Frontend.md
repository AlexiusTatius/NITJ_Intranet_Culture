## Earlier Idea
1. Create a page which recursively displays the folder structure.
2. Create button to delete folder, create button to rename folder.

1. Create a button to upload files.
2. Create a button to delete files.
3. Create a button to dowload files.

## Newer Idea
Or better yet, whenever you click on the 3 dots of a folder, it provides you 2 options:
1. delete the whole folder.
2. rename folder.
3. create a sub-folder.
4. upload files.

Similarly, for a file whenever you click on the 3 dots of a file, it provides you 2 options:
1. delete file.
2. download file.


## More detailed Ideas
Since, I don't have any register with me. I'll type my ideas:

1. Imagine a rectangle container which has the name (state) of the current folder being viewed.
2. In that current folder, we would see multiple subfolders and files which are created.
3. Each subfolder and file would have a 3 dots icon on the right side.
4. Whenever you click on the 3 dots icon, it provides you 2 options:
    1. delete the whole folder.
    2. rename folder.
    3. create a sub-folder.
    4. upload files.
5. Whenever you click on the current folder, its sub-section (which would display all the sub-folders and files) would get re-rendered.
    1. If the folder is empty, the sub-section would display: "The folder is empty"
    2. Else the subsection would display all the subfolders.

6. Now, there are some problems which are to be solved:
    1. Whenever the folder structure is changed, how would the frontend handle those changes? 
       Like would it handle those changes in an object?
    2. How would the API's be called?
    3. Where shall the browser store all the user related info?