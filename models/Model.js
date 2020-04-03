let db = require('../utilities/database');

let uniqid = require('uniqid');


class Model {
    constructor(id) {
        this.whereFields = [];
        this.selected = "";
        this.whereValues = []; 
    }

    static table () {
        return ""
    };

    static getQuery (field) {
        return `SELECT ${this.selected? this.selected : "*"} FROM ${this.table()} WHERE ${field} = ? LIMIT 1`;
    }

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
        let connection = await mainDB();
        let query = `SELECT ${this.selected? this.selected : "*"} FROM ${this.table()} `;
        let [[user]] = await db.execute( query,[id]);
        return user;  
    } 

    static select([...params]) {
        this.selected = params.join(',');
        return this;
    }

    // static where([field, value]) {
    //     this.whereFields = [
    //         this.whereFields,
    //         ...field
    //     ]

    //     this.whereValues = [
    //         this.whereValues,
    //         ...value
    //     ]

    //     return this;
    // }

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
        return Object.keys(params)
            .map((el) => {
                return `${el} = ?`
            })
            .join(", ");
    }

    static values(params) {
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