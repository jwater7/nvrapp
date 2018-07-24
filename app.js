// vim: tabstop=2 shiftwidth=2 expandtab
//

const express = require('express');
const path = require('path');

const app = express();

// routes

app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());

app.use('/api/v1/', require('./routes/api'));

// Any other paths, assume they are the frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'frontend/build/index.html')) });

module.exports = app;

