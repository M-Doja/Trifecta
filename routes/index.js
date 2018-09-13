var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var Bcrypt = require('bcrypt');
var fsm = require('./fsMethods');
var session = require('express-session');
var id;
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  entries: [
    {
      subject: String,
      body: String,
      date: Date,
      time: Date,
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ]
});
const User = mongoose.model('User', UserSchema);
const encryptPassword = (password) => {
  return Bcrypt.hashSync(password, Bcrypt.genSaltSync(10), null);
}
const validPassword = (password) => {
  return Bcrypt.compareSync(password, this.password);
}

// var fs = require('fs');
var os = require('os');
// var Cryptr = require('cryptr');
var destination = os.homedir()+'/Documents/TrifectaExport';
var profileLoc = destination+'/profile-json';
var dataLoc = destination+'/trifecta.db';
// var cryptr = new Cryptr('ZQ7d6F3Edb2eg');


router.post('/newUser', function(req, res, next){
  // res.send(req.body);
  var newbie = new User({
    email: req.body.email,
    username:  os.userInfo().username,
    password: encryptPassword(req.body.password)
  });
  var sess = req.session;
  sess.id = newbie._id;
  console.log("ID: ", sess.id);
  // res.send(newbie)
  newbie.save(function(err){
    console.log('User saved!');
    if (err) {
      console.log(err);
      res.send(err);
    }
    res.send('New user saved!')
  })
})



/* GET home page. */
router.get('/', function(req, res, next) {
fsm.directoryCheck();
  // console.log("NEWUSER", newUser);

  var data = fsm.fetchData(dataLoc);
  res.render('index', {
    title: 'Express-Trifecta eJournal ',
    documents: data,
    profile: fsm.fetchData(profileLoc)
  });
});

/* POST new data */
router.post('/data', function(req, res, next){
  var sess = req.session;
  var data = fsm.fetchData(dataLoc);
  var entry = {
    subject: req.body.subject,
    body: req.body.body,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    id: new Date().getTime(),
    authorId: fsm.getAuthId()
  };
  data.push(entry);
  fsm.saveData(data)
  if (req.sess.id) {
    console.log('ID is on file');
  }else {
    console.log("no ID on file");
  }
  res.redirect('/');
});

/* DELETE data by ID */
router.post('/delete/:id', function(req, res, next){
  var id = req.params.id;
  fsm.removeData(id);
  res.redirect('/');
});

/* Update data */
router.post('/update/:id', function(req, res, next){
  var data = fsm.fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(item){
    if (id == item.id) {
      res.render('update', { title: 'Express-Trifecta', doc: item });
    }
  });
});

/* Save data update */
router.post('/dataUpdate/:id', function(req, res, next){
  var data = fsm.fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(doc, index){
    if(id == doc.id){
      var revisedDoc = {
        subject: req.body.subjectUpdate,
        body : req.body.bodyUpdate,
        id: new Date().getTime(),
        authorId: fsm.getAuthId()
      }
      data.splice(index, 1, revisedDoc);
      fsm.saveData(data);
      res.redirect('/');
    }
  });
});
/* GET a single data item by ID */
router.get('/data/:id', function(req, res, next) {
  var data = fsm.fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(item){
    if (id == item.id) {
      res.render('single', { title: 'Express-Trifecta', item: item })
    }
  });
});


module.exports = router;
