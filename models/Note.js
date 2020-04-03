let db = require('../utilities/database');
var Model = require('./Model');


class Note extends Model {
    constructor() {
        
    }

    static table () {
        return "notes";
    };

    static async all(user_id) {
        try {

            let [notes] = await db.execute(
                `SELECT
                notes.id,
                notes.title,
                notes.created_at, 
                notes.content, 
                notes.importance,
                notes.privacy,
                notes.type,
                notes.user_id,
                users.name as user_name, 
                users.profile_picture_key as user_profile,
                friendships.id as friendship_id,
                friendships.updated_at as friends_since,
                (CASE
                    WHEN friendships.id IS NULL OR friendships.status != ? THEN 0
                    ELSE 1
                END) as friends,
                (CASE
                    WHEN friendships.status = "REQUESTED" AND friendships.user_id = ? THEN "REQUESTED"
                    WHEN friendships.status = "REQUESTED" AND friendships.friend_id = ? THEN "AWAITING_CONFIMATION"
                    ELSE "NOT_FRIENDS"
                END) as friendship_status   
                FROM
                    notes
                        INNER JOIN
                    users
                        ON
                    notes.user_id = users.id
                    LEFT JOIN
                    friendships
                        ON
                    (
                        ( notes.user_id = friendships.user_id AND friendships.friend_id = ?)
                            OR
                        ( notes.user_id = friendships.friend_id AND  friendships.user_id  = ?)
                    )
                        AND
                    (friendships.status = "ACCEPTED" OR friendships.status = "REQUESTED")
                WHERE (
                    notes.privacy != ?
                OR
                    notes.user_id = ?
                ) 
                ORDER BY
                notes.created_at DESC`,
                ["ACCEPTED",user_id,user_id,user_id, user_id, ,"private" , user_id]
            )

            return notes
        } catch(e) {
            throw e;
        }
    }

    static async belongsToUser(id, user_id) {
        try {
            let [[results]] = await db.execute(`SELECT 1 as belongs FROM ${this.table()} WHERE id = ? AND user_id = ? `, [id, user_id])
 
            return results.belongs;

        } catch(e) {
            throw e;
        }
    }
 
  
}


module.exports = Note;