// - - - - - - - module import - - - - - //
const express = require('express');
const jwt = require('jsonwebtoken');
if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
const {Client} = require('pg');
require('dotenv').config();
  
// - - - - - - - routes - - - - - - - - //
// const empModel = require('./models/dbconn');
// const loginModel = require('./models/logindb');

// var employee = empModel.find({});

const app = express();

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.json());
app.use(express.urlencoded({extended : false}));

function checkLogin(req,res,next) {
    try {
        var token = localStorage.getItem('loginToken');
        jwt.verify(token,'loginToken');
      } catch(err) {
        res.send("You Need To Login to Access This Page.");
      }
    next();
} 
const connectionString = 'postgresql://Paras:paras123@localhost:4000/employee_record'

const client = new Client({
    connectionString: connectionString
  })
  client.connect()

// - - - - - - sign in page  - - - - - - - //
app.get('/',(req,res) => {
   res.render('login'); 
});

app.post('/',(req,res) => {
   var {username,password} = req.body;
        var errors = [];
    if(!username || !password){
        errors.push[{message : "Please Enter All the Fields!!"}]
    }
    if(typeof username != String){
        errors.push[{message : "Please Enter a Valid Username."}]
    }
    console.log(errors);
    if(errors.length > 0){
        res.send(errors);
    }
    var loginToken = jwt.sign({username},'loginToken');
    localStorage.setItem('loginToken',loginToken);
    res.render('HomePage');
});

// - - - - - - home page - - - - - - - - - - //

app.get('/HomePage',checkLogin,(req,res) => {
    res.render('HomePage');
});

// - - - - - - add employee - - - - - - - - //

app.get('/addEmployee',(req,res) => {
    // console.log(req.body);
    res.render('addEmp');
});
app.post('/addEmployee',(req,res) => {

       const addQuery = 'insert into employee values($1,$2,$3,$4)';
       const params = ['nameany',23,'dept1','Trainee']
       client.query(addQuery,params);
   },(result) => {
       console.log(result)
       res.render('addEmp');
   });
    // var employee = new empModel({
    //     name : req.body.name,
    //     age : req.body.age,
    //     department : req.body.dept,
    //     designation : req.body.designation
    // });
    // employee.save();
    // console.log(employee);
    // res.render('addEmp');

// - - - - - - display employee - - - - - - //

app.get('/disp',(req,res) => {
    employee.exec((err,data) => {
        if(err) throw err;
        res.render('displayEmp',{record : data});
    })
    
});

// - - - - - - - delete/update - - - - - - - //

app.get('/delete/:id',(req,res) => {
    var id = req.params.id;
    var delEmp = empModel.findByIdAndDelete(id);
    delEmp.exec((err) =>{
        if(err) throw err;
        res.redirect('/disp');
    });
});


app.get('/update/:id',(req,res) => {
    var updEmp = empModel.findById(req.params.id);
    updEmp.exec((err,data) => {
        if(err) throw err;
        res.render('updEmp',{record : data});
    })
    
});

app.post('/update/',(req,res) => {
    var updEmpl = empModel.findByIdAndUpdate( req.body.id,{
        name : req.body.name,
        age : req.body.age,
        department : req.body.dept,
        designation : req.body.designation
    });
    updEmpl.exec((err,data) => {
        if(err) throw err;
        res.redirect('/disp');
    })
    
});

app.get('/logout',(req,res) => {
    localStorage.removeItem('loginToken');
    res.render('login');
})
app.listen(4000,() => {
    console.log('server running at 4000');
});