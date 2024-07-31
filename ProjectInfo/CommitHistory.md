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