import jwt from 'jsonwebtoken';
import TeacherUserModel from '../models/users/TeacherUser.model.js';
import NodeCache from 'node-cache';

const teacherUserCache = new NodeCache({ stdTTL: 3600, checkperiod: 1200 }); // Cache for 5 minutes

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({message:'Unauthorized'});
    }
    const jwt_token = authorization.split(' ')[1]+"";
    try {
        const { id } = jwt.verify(jwt_token, process.env.JWT_SECRET);
        // Check cache first
        let userObject = teacherUserCache.get(id);  // try to get user object from cache (if exists) cache memory is basically RAM memory so it is faster than cloud database fetching.
        
        if (!userObject) {
            // If not in cache, fetch from database
            userObject = await TeacherUserModel.findById(id).select('-password'); // return user object without password
            
            if (!userObject) {
                return res.status(401).json({message:'User not found'});
            }
            // Store in cache
            teacherUserCache.set(id, userObject);
        }
        
        req.user = userObject;
        req.jwt_token = jwt_token;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:error.message});
    }
}

export default requireAuth;

/*
    All the user authentication related routes are protected by this middleware.
    Once the user is authenticated, the user object id is stored in req.user.
    We can use this user object id to get the user details from the database.
 */


/*
    Some questions:

    Question 1: Why did we retrieve the whole user object, why not just the user id? 
    Answer: Because we need to use the user object in the routes to get the user details.
    If we only store the user id, then we will have to fetch the user details again in the routes.

    Question 2: Why did we retrieve the user object in the middleware and not in the controller functions?
    Answer: First of all we would have to write the same code logic in all the controller functions. 
    Of coure we can write a function to get the user details from the user id, but that would be an extra function call.
    And also, we would have to write the same code logic in all the controller functions. 

    Question 3: Why did we store the user object in the cache?
    Answer: Well if we are using the middleware for authentication, then we pass the user id to the controller functions where it would fetch the user details from the database.
    If we have to fetch the user details from the database in every controller function, then it would be a performance issue. So to optimise we first fetch the whole user object and store it in the cache.
    Otherwise there would be no difference in fetching the user details from the database in the controller functions or in the middleware. 
    By doing storing the user information in the user-cache we are reducing the number of database calls. Since the cache is stored in the RAM memory, it is faster to fetch the user details from the cache than from the database.

*/
