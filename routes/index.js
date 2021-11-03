const express = require('express');
const router = express.Router();

const path = require('path');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
const app = express();

app.use(express.static(path.join(__dirname, '../client/build')));
router.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


module.exports = router;
