require('dotenv').load();

import express from 'express';
import graphqlHTTP from 'express-graphql';
import cors from 'cors';
import fs from 'fs';

import Handlebars from 'handlebars';

import { Schema } from './schemas/graphqlhub';

import path from 'path';

let IS_PROD = (process.env.NODE_ENV === 'production');
let CDN = {
  react : 'https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.min.js',
  fetch : 'https://cdnjs.cloudflare.com/ajax/libs/fetch/0.9.0/fetch.min.js',
};

let CONSTANTS = {
  heapId    : process.env.HEAP_ID,
  reactPath : (IS_PROD ? CDN.react : '/react.js'),
  fetchPath : (IS_PROD ? CDN.fetch : '/fetch.js')
};

let compileFile = function(filePath) {
  let fileString = fs.readFileSync(filePath, "utf8");
  return Handlebars.compile(fileString)({ CONSTANTS });
};

let PLAYGROUND = compileFile(path.join(__dirname, 'public', 'playground', 'index.html'));
let INDEX      = compileFile(path.join(__dirname, 'public', 'index.html'));

let app = express();
app.get('/playground', function(req, res) {
  res.write(PLAYGROUND);
});
app.get('/', function(req, res) {
  res.write(INDEX);
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/graphql', cors(), graphqlHTTP({ schema: Schema }));
app.get('/playground/reddit', function (req, res) {
  res.redirect('/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%09reddit%20%7B%0A%20%20%20%20user(username%3A%20"kn0thing")%20%7B%0A%20%20%20%20%20%20username%0A%20%20%20%20%20%20commentKarma%0A%20%20%20%20%20%20createdISO%0A%20%20%20%20%7D%0A%20%20%20%20subreddit(name%3A%20"movies")%7B%0A%20%20%20%20%20%20newListings(limit%3A%202)%20%7B%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20body%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20username%0A%20%20%20%20%20%20%20%20%20%20%09commentKarma%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D');
});
app.get('/playground/hn', function (req, res) {
  res.redirect('/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20hn%20%7B%0A%20%20%20%20topStories(limit%3A%201)%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20timeISO%0A%20%20%20%20%20%20by%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20kids(limit%3A%201)%20%7B%0A%20%20%20%20%20%20%20%20timeISO%0A%20%20%20%20%20%20%20%20by%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D');
});
app.use(function(err, req, res, next) {
  console.error(err.toString());
  console.error(err.stack);
  next(err);
});

let PORT = process.env.PORT || 3000;
export const server = app.listen(PORT, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});
