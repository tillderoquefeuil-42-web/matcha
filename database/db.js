const neo4j = require('neo4j-driver').v1;
const {username, password, hostname, port} = require('../config/config').database;

let uri = `bolt://${hostname}:${port}`;

let db = {};

db.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
db.session = function(){
    return db.driver.session();
}

module.exports = db;
