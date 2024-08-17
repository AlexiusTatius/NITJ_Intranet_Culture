1. 
2. Tested backend API calls Postman, set up tailwindcss for frontend.
    - The API calls were of signup, login.
    - Added more modules to front/backend.
    - NOT SURE ABOUT REST OF BACKEND CREDIBILITY.
3. (heading)
    - Added redux & redux toolkit.

4. Create a new branch called log-sin-f.
    - In this branch I will be working on the login/signup feature.
    - I added axios to make API calls.

5. Created a new branch front-page-TS.
    - In this branch I will be working on the front page. 
    - It will include react-router-dom module.
    - This branch contains all the unstaged files from the previous branch.
    - After that either I will merge or rebase or squash the commits.
    - I have updated the login and signup pages such that the teacher and student both have seperate login and signup pages.
    - I think I will also change the backend (mongo-db) of teacher and students
    - Now I think I would have to change the models, controllers and routes of the backend, specifically w.r.t. teacher and student.


6. In the log-sin-f
    - Created frontend for login and signup for both teacher and student.
    - Created new branch front-page-TS, where models, controllers and routes for teacher 
      and student were be updated.
    - Commits of front-page-TS were squashed and merged with log-sin-f.
    
7. Since everything in the log-sin-f branch was working fine, I merged it with the master branch.   (17th July, 2024)
    - I currently don't know whether I should delete the log-sin-f branch or not.

8. Created a new branch called teacher-backend-auth-n-API
    - Build a robust authentication system middleware for the teachers and students
    - Built and properly test the following API's
        1. Create, Delete, Rename a folder.
        2. Upload, Delete, Download files.

9. Renamed the teacher-backend-auth-n-API to teacher-portal:
    - Added the Teacher API's to fetch the folders and files.
    - Doing this commit in teacher-portal branch.
    - I will merge the teacher portal branch with the master branch after building the whole teacher portal.

10. I don't remember what were the changes in the previous branches, but now I will keep a clear track. 
    So here's what's going to happend:
    - I am on T-frontend-Beautify branch.
    - I will commit all the changes (the current state of the project) in the T-frontend-Beautify branch.
    - Then I will merge the T-frontend-Beautify branch with the master branch.

    Now let's see what changes I have made in the T-frontend-Beautify branch:
    - Implemented the All_Files functionality, to full extent, 
      according to the backend API's. (Hope there's no bugs)
    - Made the components and pages in frontend
    - In the backend file.controller.js and 
      folder.controller.js were updated.

