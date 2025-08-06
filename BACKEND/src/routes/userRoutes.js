import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getRecommendedUsers, getMyFriends , sendFriendRequest , acceptFriendRequest , getFriendRequest , getOutgoingFriendRequest } from '../controllers/userController.js';

const router = express.Router();

// apply protectRoute middleware to all routes
router.use(protectRoute);

// get recommended users
router.get('/',getRecommendedUsers);

// get my friends
router.get('/friends',getMyFriends);

// send friend request
router.post('/friend-request/:id', sendFriendRequest);

// accept friend request
router.put('/friend-request/:id/accept', acceptFriendRequest);

// get friend requests
router.get('/friend-requests', getFriendRequest);

// 
router.get('/outgoing-friend-requests', getOutgoingFriendRequest);

export default router;