import User from '../models/userModel.js';
import FriendRequest from '../models/friendRequestModel.js';

export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and : [
                { _id: { $ne: currentUserId } }, // Exclude current user
                { _id: { $nin: currentUser.friends } }, // Exclude current user's friends
                {isOnboarded: true},
            ]
        });

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error('Error fetching recommended users:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


export const getMyFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('friends')
            .populate('friends', 'fullName profilePicture nativeLanguage learningLanguage');
        
        res.status(200).json(user.friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


export const sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user.id;
        const { id : recipientId } = req.params;

        // prevent sending friend request to self
        if (myId === recipientId) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
        }

        // check if recipient exists
        const recipient = await User.findById(recipientId);
        if(!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }   

        // prevent sending friend request to someone already in friend list
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: 'You have already sent a friend request to this user' });
        }

        // check if friend request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You have already sent a friend request to this user' });
        }

        // create friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
}


export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // verify the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(401).json({ message: 'You are not authorized to accept this friend request' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // add each other as friends
        await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: friendRequest.recipient } });
        await User.findByIdAndUpdate(friendRequest.recipient, { $addToSet: { friends: friendRequest.sender } });

        res.status(200).json({ message: 'Friend request accepted' });  

    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getFriendRequest = async (req, res) => {
    try {
        const incomingRequests = await FriendRequest.find({ recipient: req.user.id, status: 'pending' })
        .populate('sender', ' fullName profilePicture nativeLanguage learningLanguage');

        const acceptedRequests = await FriendRequest.find({ sender: req.user.id, status: 'accepted' })
        .populate('recipient', ' fullName profilePicture ');

        res.status(200).json({ incomingRequests, acceptedRequests });
    }
    catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getOutgoingFriendRequest = async (req, res) => {
    try {
        const outgoingRequests = await FriendRequest.find({ sender: req.user.id, status: 'pending' })
        .populate('recipient', ' fullName profilePicture nativeLanguage learningLanguage');

        res.status(200).json(outgoingRequests);
    } catch (error) {
        res.error('Error fetching outgoing friend requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}