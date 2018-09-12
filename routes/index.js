var express = require('express');
var router = express.Router();
var fs = require('fs');
var os = require('os');
var Cryptr = require('cryptr');
var destination = os.homedir()+'/Documents/TrifectaExport';
var profileLoc = destination+'/profile-json';
var dataLoc = destination+'/trifecta.db';
var id;
var cryptr = new Cryptr('ZQ7d6F3Edb2eg');




// check if Directory exists
// if no directory found one is created
if (!fs.existsSync(destination)){
  fs.mkdir(destination, function(err){
    if (err) {
      return console.error(err);
    }

    var userData = {
      userName: os.userInfo().username,
      address: os.networkInterfaces()["Wi-Fi"][3].address,
      host: os.hostname(),
      timeStamp: new Date().getTime()
    }

    fs.writeFile(profileLoc, JSON.stringify(userData), (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });
}
// GET ALL JSON FILE DATA
var fetchData = (fileLocation) => {
  try {
    var dataString = fs.readFileSync(fileLocation);
    if (fileLocation === dataLoc) {
      var x = cryptr.decrypt(dataString);
      return JSON.parse(x);
    }
    return JSON.parse(dataString);
  } catch(e){
    return [];
  }
};
// SAVE DATA
var saveData = (entry) => {
  var x = cryptr.encrypt(JSON.stringify(entry));
  fs.writeFile(dataLoc, x, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};
// REMOVE DATA BY ID
function removeData(id) {
  var data = fetchData(dataLoc);
  var filteredData = data.filter((entry) => entry.id != id);
  saveData(filteredData);
  return data.length !== filteredData.length;
};
// GET USER AUTH ID
function getAuthId(){
  var author = fetchData(profileLoc);
  return author.timeStamp+'_'+author.host;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = fetchData(dataLoc);
  res.render('index', {
    title: 'Express-Trifecta',
    documents: data,
    profile: fetchData(profileLoc)
  });
});

/* POST new data */
router.post('/data', function(req, res, next){
  var data = fetchData(dataLoc);
  var entry = {
    title: req.body.title,
    body: req.body.body,
    id: new Date().getTime(),
    authorId: getAuthId()
  };
  data.push(entry);
  saveData(data)
  res.redirect('/');
});

/* DELETE data by ID */
router.post('/delete/:id', function(req, res, next){
  var id = req.params.id;
  removeData(id);
  res.redirect('/');
});

/* Update data */
router.post('/update/:id', function(req, res, next){
  var data = fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(item){
    if (id == item.id) {
      res.render('update', { title: 'Express-Trifecta', doc: item });
    }
  });
});

/* Save data update */
router.post('/dataUpdate/:id', function(req, res, next){
  var data = fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(doc, index){
    if(id == doc.id){
      var revisedDoc = {
        title: req.body.titleUpdate,
        body : req.body.bodyUpdate,
        id: new Date().getTime(),
        authorId: getAuthId()
      }
      data.splice(index, 1, revisedDoc);
      saveData(data);
      res.redirect('/');
    }
  });
});
/* GET a single data item by ID */
router.get('/data/:id', function(req, res, next) {
  var data = fetchData(dataLoc);
  var id = req.params.id;
  data.forEach(function(item){
    if (id == item.id) {
      res.render('single', { title: 'Express-Trifecta', item: item })
    }
  });
});


module.exports = router;
