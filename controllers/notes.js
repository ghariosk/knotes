let db = require('../utilities/database');
var uniqid = require('uniqid');

let Note = require('../models/Note')

async function getNotes(req, res) {

    try {
        const notes = await Note.all(req.user.id);
        res.status(200).send({
            status: 200,
            message: "Success",
            body: notes
        })
    } catch (e) {

        console.log(e);
        res.status(500).send({status: 500, error: e})
    }  

}

function unflatten(data) {
    var result = {}
    for (var i in data) {
      var keys = i.split('.')
      keys.reduce(function(r, e, j) {
        return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? data[i] : {}) : [])
      }, result)
    }
    return result
}

async function getNote(req,res) {
    var connection = await mainDB();
    var id = req.params.noteId;
    try {
        const [rows] = await connection.execute('SELECT * FROM `notes` WHERE `id`=?',[id]);
        res.status(200).send({
            status: 200,
            message: "Success",
            body: rows
        });
    } catch(e) {
        res.status(500).send({
            status: 500,
            error: e,
            message:"Error"
        })
    }
}


async function createNote(req,res) {

    try {
        const note = await  Note.create({
            ...req.body,
            user_id: req.user.id
            }
        )
        res.status(201).send({
            status: 201,
            message: "Success",
            body: {
                ...note,
                created_at: new Date(),
                user_id: req.user.id,
                user_name: req.user.name,
                user_profikle: req.profile_picture_key


            }
        });
    } catch(e) {
        console.log(e)
    }
}


async function updateNote(req,res) {
  

    try {
        console.log(req.body);
        var {content, title, importance, privacy , type} = req.body;
        var id = req.params.noteId;
        console.log(content, title, importance, privacy , type);
        let match = await Note.belongsToUser(id, req.user.id);
        if (match) {
            const results = await Note.update(id, {content, title, importance,privacy, type});
            res.status(201).send({
                status: 201,
                message: "Success"
            })
       
        } else {

            res.status(401).send({status: 401, message: "Note belongs to another user"});
        }
    } catch(e) {
        res.status(500).send({status: 500, message: "Server Error"});
    }
}

async function deleteNote(req,res) {

    var id = req.params.noteId;
    try {

        let match = await Note.belongsToUser(id, req.user.id);
        if (match) {
            const results = await Note.delete(id)
            res.status(201).send({
                status: 201,
                message: "Success"
            })
            
        } else {

            res.status(401).send({status: 401, message: "Note belongs to another user"});
        }
       
       
    } catch(e) {
        console.log(e);
    }
}


module.exports = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
}