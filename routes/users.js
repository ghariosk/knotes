let { Router} = require('express')
let router = Router();
var multer  = require('multer')

let {
    uploadProfilePicture,
    getFriendRequests,
    getUsers,
    requestFriendship,
    denyFriendship,
    acceptFriendship,
    friendshipRequested,
    deleteFriendship,
    getProfile
} = require('../controllers/users');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });


// Upload a profile picture to S3 with mutler as a middleware
router.put('/avatar', upload.single('file') , uploadProfilePicture);

// Get the users friend request
router.get('/friends/requests', getFriendRequests);

// Send a friend request
router.post('/friends/:friend_id', requestFriendship);

// Deny a friendship. Denying implements soft deletes and sets the friendships status to denied
router.delete('/friends/:friend_id/requests/:id',friendshipRequested, denyFriendship);

// Accept a friend request
router.put('/friends/:friend_id/requests/:id', friendshipRequested, acceptFriendship);

router.delete('/friends/:friend_id/:friendship_id', deleteFriendship);

router.get('/:id', getProfile)




router.get('/', getUsers);



module.exports = router;