const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true});

var conn = mongoose.connection;

var empSchema = new mongoose.Schema({
    name : {
        required : true,
        type : String,
        minlength : 2
    },
    age : {
        required : true,
        type : Number
    },
    department : {
        required : true,
        type : String
    },
    designation : {
        required : true,
        type : String
    }
});



var empModel = new mongoose.model('employee',empSchema);

conn.on('connected',() => {
    console.log('connected to database');
});
conn.on('error', console.error.bind(console, 'connection error:'));
conn.on('disconnected', () => {
    console.log('disconnected from database');
});

module.exports = empModel;