let db = require('../utilities/database');

let uniqid = require('uniqid');

// a custom made simple query builder

class Model {
    constructor(id) {
        this.whereFields = [];
        this.selected = "";
        this.whereValues = []; 
    }

    static table () {
        return ""
    };

    // generates the get Query
    static getQuery (field) {
        return `SELECT ${this.selected? this.selected : "*"} FROM ${this.table()} WHERE ${field} = ? LIMIT 1`;
    }

    // uses the get query with a default of id as condition
    static async get(value, field = "id") { 
        let query = this.getQuery(field)
        let [[user]] = await db.execute(query,[value]);
        return user;  
    }

    static async exists(value, field = "id") {
        let model = await this.get(value, field);
        console.log(model);
        return model? true: false;
    };

   
    static async all() {
        let query = `SELECT ${this.selected? this.selected : "*"} FROM ${this.table()} `;
        let [[user]] = await db.execute( query,[id]);
        return user;  
    } 

    static select([...params]) {
        this.selected = params.join(',');
        return this;
    }



    static async create({...params}) {
        try {
            params.id = uniqid()
            let attributes = this.createAttributes(params);
            let values = this.values(params);
            let fields = Array(values.length).fill('?').join(',');
            
            let mutation = `INSERT INTO ${this.table()} (${attributes}) VALUES (${fields})`
            console.log(mutation);
            let results = await db.execute(
                mutation,
                values
            )

            return params;

        } catch(e) {
            throw e;
        } 
       
    }

    static createAttributes(params) {
        // creates a string of the from x,y,z
        return Object.keys(params)
            .map((el) => {
                return el
            })
            .join(", ");
    }

    
    static async update(id, {...params}) {

        try {
            let attributes = this.updateAttributes(params);
            let values = this.values(params);
            let mutation =  `UPDATE ${this.table()} SET ${attributes} WHERE id = ?`;
            await db.execute(
                mutation,
                [
                    ...values,
                    id
                ]
            )
            return id;
        } catch(e) {
            throw e;
        }
        
    }

    static  updateAttributes(params) {
        // creates a string of the form by plucking the keys of the params object :
        //  x = ? , y=?
        return Object.keys(params)
            .map((el) => {
                return `${el} = ?`
            })
            .join(", ");
    }

    static values(params) {
        // plucks the values out of the params object
        return Object.values(params).map((el) => {
            return el;
        });
    }

    static async delete(id)  {
        try  {
            await db.execute(`DELETE FROM ${this.table()} WHERE id = ?`, [id])

            return true
        } catch(e){
            throw(e)
        }
    }



}


module.exports = Model;