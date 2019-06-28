const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true});

var conn = mongoose.connection;


var loginSchema = new mongoose.Schema({
    username : {
        required : true,
        type :String
    },
    password : {
        required : true,
        type : String
    }
});

var loginModel = new mongoose.model('loginData',loginSchema);


module.exports = loginModel;