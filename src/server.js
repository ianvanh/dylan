const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');

const path = require('path');
const ejs = require('ejs');

const { name, version, description, author } = JSON.parse(fs.readFileSync('./package.json'));

const publicPath = path.join(__dirname, 'public');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.render('index', {
    projectName: name.toUpperCase(),
    projectVersion: version,
    projectDescription: description,
    projectAuthor: author
  });
});

// test image
app.get('/lib/logo.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, '../lib/bot.jpg'));
});

app.get('/politica-de-privacidad', (req, res) => {
  res.render('politica-de-privacidad');
});

app.get('/contacto', (req, res) => {
  res.render('contacto', {
    projectName: name.toUpperCase(),
    projectVersion: version,
    projectAuthor: author
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});