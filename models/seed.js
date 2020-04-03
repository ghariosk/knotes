let db = require('../utilities/database');
const bcrypt = require('bcrypt');

let SALT = 8;


//id //name //email // password //status
let users = async function() {
    let password = await bcrypt.hash("password", SALT);
    return await [
        [1, "Karlito Brigante", "karlito@mail.com", password, "CONFIRMED"],
        [2, "John Snow", "john@snow.com",password, "CONFIRMED"],
        [3, "Mr Test", "mr@test.com" , password , "CONFIRMED"]
    ]

} 
// id // user_id // friend_i // status
let friendships = [
    [1, 1, 2, "CONFIRMED"],
    [2, 1, 3 , "REQUESTED"],
    [3, 3, 2 , "CONFIRMED"]
]
// id // title // content// user_id // type // importance // privacy // 
let notes = [
    [1, 'first note' , 'first note content' , 1 , "Business", 2 , "public"],
    [2, 'second note' , 'second note content' , 1, "Cooking", 1 , "public"],
    [3 , 'second note' , 'second note content' , 2, "Cooking", 3 , "public"],
    [3 , 'second note' , 'second note content' , 3, "Cooking", 2 , "private"]
]



async function SeedUsers() {
    let conn = await db.mainDB()
    let data = await users();
    data.forEach(async(el) => {
        await conn.query("INSERT INTO users (id , name ,email ,password ,status) VALUES (?,?,?,?,?)" , el);
    })
    console.log("success seeding users");
 
}

async function SeedFriendships () {
    let conn =  await db.mainDB();
    let data =  friendships;
    data.forEach(async(el) => {
        await conn.query("INSERT INTO friendships (id , user_id ,friend_id ,status) VALUES (?,?,?,?)" , el);
    })
    conn.end()
}   



// SeedUsers();

// SeedFriendships();




