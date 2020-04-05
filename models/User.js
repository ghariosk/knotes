let db = require('../utilities/database');
var Model = require('./Model');


class User extends Model {
    constructor({id, password, email, name, status, }) {
        
    }

    static table () {
        return "users";
    };

    static getQuery (field) {
        return `SELECT ${this.selected? this.selected : "*"} FROM ${this.table()} WHERE ${field} = ? AND (status = "CONFIRMED" OR status="FORCE_CHANGE_PASSWORD") LIMIT 1`;
    }


    static async getByEmail(email) {
        try {
            return await this.get(email, "email"); 
        } catch(e) {
            throw e;
        }    
    }

    static async existsEmail(email) {
        try {
            return this.exists(email, "email");
        } catch(e) {
            throw e;
        }
       
    }

    static async updateProfilePicture(id, key) {
        try {
            console.log("TESST");
           return await this.update(id, {profile_picture_key: key})
        } catch(e) {
            throw e;
        }
    }

    static async getActivity(user_id) {
        // Gets the friendship and notes activity of a user using a mysql union and column aliasing
        try {
            let query = `SELECT friendships.updated_at as date, users.name as content, "friendship" as type, users.id as id   FROM friendships
                INNER JOIN users
                ON ((users.id = friendships.friend_id) OR (users.id = friendships.user_id)) AND users.id != ?
                WHERE friendships.status = "ACCEPTED"  AND (friendships.user_id = ? OR friendships.friend_id = ?)
                UNION SELECT created_at as date, title as content, "note" as type , id  FROM notes WHERE user_id = ? ORDER BY date DESC`;
            let params = [user_id, user_id,user_id, user_id];
            let [results] = await db.execute(query,params);
            return results;
        } catch(e) {
            console.log(e);
            throw e;
        }
    }

    static async getProfile(user_id, friend_id) {
        try {
            let query = `SELECT 
                users.id, name, email, profile_picture_key, friendships.status, friendships.id as friendship_id
            FROM users
            LEFT JOIN friendships 
                ON ((user_id =? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND (friendships.status = ? OR friendships.status = ?)
            WHERE users.id = ?
            LIMIT 1 `;
            let params = [user_id , friend_id , friend_id , user_id , "ACCEPTED" , "REQUESTED", friend_id]

            let [[result]] = await db.execute(query,params);
            return result;
        } catch(e) {
            throw e;
        }
    }

    static async getNotes(user_id, auth_id) {
        return new Promise(async (resolve,reject)=> {
            try {
                let query = `SELECT * FROM notes WHERE user_id = ? `;
                let params = [user_id];
                if (user_id !== auth_id) { 
                    query += "AND privacy = ? ";
                    params.push("public");
                }
                query += "ORDER BY created_at DESC"

                let [results] = await db.execute(query,params);
                resolve(results);
            }   catch (e) {
                reject(e)
            }

        })
       
    } 

    static async areFriends(user_1, user_2) {
        try {
            let query = `SELECT 1 as friends FROM friendships
             WHERE ((friend_id = ? AND user_id =?) OR (friend_id = ? AND user_id =?))
             AND status = ? LIMIT 1`
             let params = [user_1, user_2, user_2, user_1 ,"ACCEPTED"]
            let [[results]] = await db.execute(query,params)
            return results? true : false;
        } catch(e) {
            throw e;
        }
    }

    static async all(auth_id) {
        try {
            let query = `SELECT 
                        users.id, name, email, profile_picture_key, friendships.status, friendships.id as friendship_id
                        FROM users
                        LEFT JOIN friendships 
                        ON ((user_id = users.id AND friend_id = ?) OR 
                        (friend_id = users.id AND user_id = ?)) AND (friendships.status = ? OR friendships.status = ?)
                        WHERE users.id != ?
                        `

            let params = [auth_id, auth_id, "ACCEPTED" , "REQUESTED", auth_id]

            let [results] = await db.execute(query,params);
            return results
        } catch(e) {
            throw e;
        }
    }
  
}


module.exports = User;