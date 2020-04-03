const { oneOf, check, validationResult } = require('express-validator');


let validator = function (req,res,next) {
    try {
        validationResult(req).throw();
    
        // yay! we're good to start selling our skilled services :)))
        next();
      } catch (errors) {
        // Oh noes. This user doesn't have enough skills for this...
        res.status(422).json({message: "Errors", errors})
     }


}

module.exports = validator;