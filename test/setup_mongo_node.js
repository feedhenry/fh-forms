var DB = require('mongodb').Db;
var Server = require('mongodb').Server;
var db = new DB('test', new Server(process.env.MONGODB_HOST || "localhost", 27017));

console.log("Opening database.");

db.open()
  .then(d => {
    var adminDb = d.admin();
    return adminDb.authenticate('admin', 'admin')
    .then(result =>{
      console.log("User admin:admin already exists.");
      return result;
    }).catch(err => {
      if (err.code === 18) { // code for Authentication failed, same on both mongo 2.x and 3.x
        return adminDb.addUser('admin', 'admin');
      } else {
        return Promise.reject(err);
      }
    });
  }).then(x => {
    console.log(x);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });