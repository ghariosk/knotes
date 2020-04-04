const {
    mainDB
} = require('../utilities/database');
const AWS = require('aws-sdk');
let uniqid = require('uniqid');


let User = require('../models/User');
let Friendship = require('../models/Friendship');
let piexif = require('piexifjs');



const TYPE = `binary`

let s3Params = {
    region: process.env.AWS_REGION,
    accessKeyId: null , 
    secretAccessKey: null,
    apiVersion: '2006-03-01'
};

var profilePictureParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    ACL: "public-read"
};


let removeExif = function(fromFile) {
    // const newData = piexif.remove(
    //   fs.readFileSync(fromFile).toString(TYPE)
    // // )
  
    // fs.writeFileSync(toFile, new Buffer(newData, TYPE))
    var exifObj = piexif.load(fromFile);
    for (var ifd in exifObj) {
        if (ifd == "thumbnail") {
            continue;
        }
        console.log("-" + ifd);
        for (var tag in exifObj[ifd]) {
            console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
        }
    }
    return piexif.remove(fromFile)
}


async function uploadProfilePicture(req,res) {
    const file = req.file;
    // console.log(file);
    // file = removeExif(file.buffer);
    const key = `${req.user.email}/profile-picture/${req.file.originalname}`

    profilePictureParams = {
        ...profilePictureParams,
        Key: key,
        ContentType: file.mimetype,
        // Body: buffer,
    }
 
    if (file.mimetype === "image/jpeg") {
        let imageBase64 = "data:image/jpeg;base64," + file.buffer.toString('base64')

        imageBase64 = removeExif(imageBase64);
        imageBase64 = imageBase64.replace(/^data:image\/jpeg;base64,/, "");
        buffer = Buffer.from(imageBase64, 'base64')
        profilePictureParams.Body = buffer

    } else {
        profilePictureParams.Body = file.buffer
    }
    
    try {
        
       

        let s3bucket = new AWS.S3(s3Params);
       
        let upload = await s3bucket.upload(profilePictureParams).promise();
        console.log(upload);

        let update = await User.updateProfilePicture(req.user.id, key);

        console.log(update);


        res.status(201).send({status: 201, key: key, message: "Success"});
          
    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}

async function requestFriendship (req,res) {
  
    try {
        let {friend_id} = req.params;

        if (friend_id == req.user.id) return res.status(404).send({message: "Cannot befriend self"});
        let userExists = await User.exists(friend_id);
        if(!userExists) return res.status(404).send({message: "No user match"});
        let friendshipExists = await Friendship.alreadyExists(req.user.id, friend_id);
        if(friendshipExists) return res.status(404).send({message: "Friendship or request exists"});
        let request = await Friendship.request(req.user.id, friend_id);
        res.status(201).send({status: 201, message: "Requested" , friendship : request});

    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}

async function friendshipRequested(req,res, next) {
    let {friend_id, id} = req.params;
    try {
        let requested = await Friendship.requested(id, req.user.id, friend_id);
        if(!requested) return res.status(404).send({message: "Request not found"});
        next()
    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}

async function denyFriendship(req,res) {
    let {friend_id, id} = req.params;
    try { 
        let denied = await Friendship.deny(id);
        res.status(201).send({message: "Request Denied" , friend_id: id}); 

    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}

async function acceptFriendship(req,res) {
    let {friend_id, id} = req.params;
    try {
        let accepted = await Friendship.accept(id);
        res.status(201).send({message: "Request Accepted" , friend_id: id});

    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}

async function deleteFriendship(req ,res) {
    let {friend_id , friendship_id} = req.params;
    console.log(req.body);
    try {
        let userExists = await User.exists(friend_id);
        if(!userExists) return res.status(404).send({message: "No user match"});
        let friendshipExists = await Friendship.alreadyExists(req.user.id, friend_id);
        if(friendshipExists) return res.status(404).send({message: "Friendship or request exists"});
        let request = await Friendship.delete(friendship_id);
        res.status(201).send({status: 201, message: "Requested" , friendship : request});
    } catch(e) {
        res.status(500).send({message: "Error" , error : e, status: 500});
    }
}

async function getFriendRequests(req,res) {
    try {
        let requests = await Friendship.getRequests(req.user.id);
        res.status(200).send(
            {
                body: {
                    ...requests
                },
                message: "Success"
            }
        );      
    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error" , error : e});
    }
}



async function getProfile(req,res) {
    try {
        let {id} = req.params;

        let activity =[];
        let profile= [];
        let notes = [];

        let areFriends = await User.areFriends(id, req.user.id);

      
        if (areFriends || id === req.user.id) {
             activity =  User.getActivity(id);
             notes  = User.getNotes(id, req.user.id);
        }
        profile =  User.getProfile(req.user.id, id);
        let results = await Promise.all([activity, profile, notes])
     
        res.status(200).send({status: 200, message: "Success", activity: results[0], profile: results[1], notes: results[2]})

    } catch(e) {
        console.log(e)
        res.status(500).send({message: "Error" , error : e});
    }

}

async function getUsers(req,res) {
    try {
        let users = await User.all(req.user.id);

        res.status(200).send({users, message: "Success", status: 200})
    } catch(e) {
        res.status(500).send({status: 500, message: "Error"});
    }
}



module.exports = {
    uploadProfilePicture,
    requestFriendship,
    denyFriendship,
    acceptFriendship,
    getFriendRequests,
    friendshipRequested,
    deleteFriendship,
    getProfile,
    getUsers

}