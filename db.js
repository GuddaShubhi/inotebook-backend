const mongooseConnect = require('mongoose');
const mongoURI = "mongodb://localhost:27017/iconnect";

const connectToMongo = () => {
    mongooseConnect.connect(mongoURI).then( ()=> {
        console.log("connected successfully");
    });
}

module.exports = connectToMongo;