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
        res.json({error : "You Need To Login to Access This Page."});
      }
    next();
} 
const connectionString = 'postgresql://postgres:paras123@localhost:5432/employee_record'

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
   client.query('select * from login_data')
   .then((result) => {
       var username= req.body.username;
       var password = req.body.password;
       var userCheck = result.rows[0].username;
       var userPass = result.rows[0].password;
       console.log(username);
       console.log(password);
        var errors = [];
    if(!username || !password){
        errors.push({message : "Please Enter All the Fields!!"})
    }
    // if(typeof username != String){
        // errors.push({message : "Please Enter a Valid Username."})
    // }
    // if(username != userCheck || password != userPass){
        // errors.push({message : "Invalid User"});
    // }
    console.log(errors);
    if(errors.length > 0){
        res.json(errors);
    }
    var loginToken = jwt.sign({username},'loginToken');
    localStorage.setItem('loginToken',loginToken);
    res.redirect('/HomePage');

   });
});


// - - - - - - - - - - - - - - - - - - - - - //




// - - - - - - home page - - - - - - - - - - //

app.get('/HomePage',checkLogin,(req,res) => {
    res.render('HomePage');
});

// - - - - - - add employee - - - - - - - - //

app.get('/addEmployee',checkLogin,(req,res) => {
    // console.log(req.body);
    res.render('addEmp');
});
app.post('/addEmployee',checkLogin,(req,res) => {

       const addQuery = 'insert into employee values($1,$2,$3,$4)';
       const params = [req.body.name,req.body.age,req.body.dept,req.body.designation];
       client.query(addQuery,params)
       .then(() => {
        res.render('addEmp'); 
       });

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

// - - - - - - - - - - - - - - - - - - - - - //



// - - - - - - display employee - - - - - - //

app.get('/disp',checkLogin,(req,res) => {
    client.query('select * from employee')
    .then((result) => {
        res.render('displayEmp',{result : result.rows});
    })
    .catch((err) => {
        console.log(err);
        res.json({error : "Unable to display Employee Record"});
    });

    // employee.exec((err,data) => {
    //     if(err) throw err;
    //     res.render('displayEmp',{record : data});
    // })
    
});


// - - - - - - - - - - - - - - - - - - - - - //



// - - - - - - - delete/update - - - - - - - //

app.get('/delete/:id',checkLogin,(req,res) => {
    var id = [req.params.id];
    client.query('delete from employee where emp_id =$1',id)
    .then(() => {
        res.redirect('/disp');
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/disp');
    });
    // var delEmp = empModel.findByIdAndDelete(id);
    // delEmp.exec((err) =>{
    //     if(err) throw err;
    //     res.redirect('/disp');
    // });
});


app.get('/update/:id',checkLogin,(req,res) => {
    const query = 'select * from employee where emp_id = $1';
    const param = [req.params.id];
    client.query(query,param)
    .then((result) => {
        // console.log(result.rows);
        res.render('updEmp',{result : result.rows});
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/disp');
    });


    // var updEmp = empModel.findById(req.params.id);
    // updEmp.exec((err,data) => {
    //     if(err) throw err;
    //     res.render('updEmp',{record : data});
    // })
    
});

app.post('/update/',checkLogin,(req,res) => {
    console.log(req.params.id);
    const query = 'update employee set name = $1, age=$2,department=$3,designation=$4 where emp_id = $5'
    const params = [req.body.name,req.body.age,req.body.department,req.body.designation,req.params.id];
    client.query(query,params)
    .then((result) => {
        console.log(result);
        res.redirect('/disp');
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/disp');
    })
    // var updEmpl = empModel.findByIdAndUpdate( req.body.id,{
    //     name : req.body.name,
    //     age : req.body.age,
    //     department : req.body.dept,
    //     designation : req.body.designation
    // });
    // updEmpl.exec((err,data) => {
    //     if(err) throw err;
    //     res.redirect('/disp');
    // })
    
});

app.get('/logout',(req,res) => {
    localStorage.removeItem('loginToken');
    client.end();
    res.redirect('/');
})
app.listen(4000,() => {
    console.log('server running at 4000');
});