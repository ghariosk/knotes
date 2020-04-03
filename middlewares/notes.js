const { oneOf, check, validationResult } = require('express-validator');

let mutateNote = [
    check('type').exists(),
    check('importance').exists(),
    check('privacy').exists(),
    check('title').exists().notEmpty(),
    check('content').exists().notEmpty(),
    check('type').isIn(['Business', 'Health', 'Wellness' , 'Cooking' , 'Coding']),
    check('importance').isIn([1,2,3]),
    check('privacy').isIn(['public', 'private'])
]


module.exports = {
    mutateNote: mutateNote
}