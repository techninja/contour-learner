const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');

const app = express();
const port = 3242;
const dataPath = './public/data';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static('public'));

app.post('/data/:id', (req, res) => {
  fs.writeFileSync(`${dataPath}/${req.params.id}.d`, req.body.d);
  res.send('Got it');
});

app.get('/last', (req, res) => {
  const lastID = fs.readdirSync(dataPath).pop().split('.')[0];
  res.send(lastID);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
