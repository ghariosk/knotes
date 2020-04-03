let db = require('../utilities/database');
var Model = require('./Model');


class Friendship extends Model {
    constructor() {
        
    }

    static table () {
        return "friendships";
    };

    static async request(user_id, friend_id) {
        try {
            let params = {
                status: "REQUESTED",
                user_id: user_id,
                friend_id: friend_id
            }
            let request = await this.create(params)
            return request;

        } catch(e) {
            throw e;
        }    

    }

    static async alreadyExists(user_id, friend_id) {
        try {

            
            let [[friendship]] = await db.execute(
                "SELECT 1 as `exists` FROM friendships WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND (status = ? OR status = ?)" ,
                 [user_id, friend_id, friend_id, user_id, "CONFIRMED" , "REQUESTED"]
            );
        
            return friendship && friendship.exists? true : false;

        } catch(e) {
            throw e;
        }  
    }

    static async areFriends(user_id, friend_id) {
        try { 
            let [[friendship]] = await db.execute(
                "SELECT 1 as `exists` FROM friendships WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND (status = ?)" ,
                 [user_id, friend_id, friend_id, user_id, "CONFIRMED"]
            );
            return friendship && friendship.exists? true : false;

        } catch(e) {
            throw e;
        }  
    }



    static async requested(id, user_id, friend_id) {
        try {     
            let [[friendship]] = await db.execute(
                `SELECT 
                    1 as requested 
                FROM friendships 
                    WHERE 
                id = ? AND status = ? AND ((user_id = ? AND friend_id = ?) OR  (user_id = ? AND friend_id = ?))`, 
                [id, "REQUESTED", user_id, friend_id, friend_id, user_id]
            );
            return friendship.requested? true : false;

        } catch(e) {
            throw e;
        }  
    }

    static async deny(id) {
        try {
            await this.update(id, {status: "DENIED"});
            return;
        } catch(e) {
            throw e;
        }
    }

    static async accept(id) {
        try {
            await this.update(id, {status: "ACCEPTED"});
            return;
        } catch(e) {
            throw e;
        }
    }

    static async getRequests(user_id) {

        try {
            let query = 
            `SELECT
                friendships.id,
                friendships.created_at,
                users.name, 
                users.id as user_id,
                users.profile_picture_key,
                friendships.status

            FROM 
                friendships
            INNER JOIN
                users
            ON 
                users.id = friendships.user_id
            WHERE 
                friendships.friend_id =? 
            AND
                friendships.status= ?
            `
            let [requests] = await db.execute(query,[user_id, "REQUESTED"])
            console.log(requests);

            return {requests: requests, count: requests.length}

        } catch(e) {

            throw e;
        }       

    }

    static async delete(friend_id) {
        try {
            let query = `DELETE FROM friendships WHERE  id= ? AND status = ?`
            await db.execute(query,[friend_id, "ACCEPTED"]);
            return 
        } catch(e) {
            throw e;
        }   

    }
}


module.exports = Friendship; 