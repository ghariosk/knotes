let { Router} = require('express')
let router = Router();

let {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
} = require('../controllers/notes');

let {
    mutateNote
} = require('../middlewares/notes');

let validator = require('../middlewares');


router.use(function timeLog (req,res,next) {
    console.log('Time:', Date.now());
    next();
})

router.get('/' , getNotes);

router.post('/', mutateNote, validator, createNote);

router.put('/:noteId',mutateNote, validator, updateNote);

router.get('/:noteId', getNote);

router.delete('/:noteId', deleteNote);



module.exports = router;