var mysql=require("mysql")
var pool=mysql.createPool(
    {
        host:'localhost',
        port:3306,
        password:'123',
        user:'root',
        database:'minor',
        connectionLimit:100,
        multipleStatements:true,
    }
)
module.exports = pool;