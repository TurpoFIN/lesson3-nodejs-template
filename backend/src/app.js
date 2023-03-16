const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('kcors');

const database = require('./database');

// Create a new Koa instance for our API
const app = new Koa();

// Export the instance for server.js to run
module.exports = app;

// Use the koa-logger middleware to display the summary of
// requests and responses in the console
app.use(logger());

// Set up CORS middleware to tell the browser
// that requests from all domains are allowed
app.use(cors({ credentials: true }));

// Set up JSON parsing for request bodies.
// Allows the use of `ctx.request.body
app.use(bodyParser());

// Lists Chat entries in the database and returns them
// in the response body with status code 200
const listChats = async (ctx) => {
  const options = {};

  const chats = await database.Chat.findAll(options);

  const response = {
    results: chats,
  };

  ctx.body = response;
};

// Creates a Chat entry in the database and returns it
// in the response body with status code 201.
// Fails with 500 if message was not provided
const createChat = async (ctx) => {
  const { body } = ctx.request;

  const { message } = body;

  const chat = await database.Chat.create({ message });

  ctx.body = chat;
  ctx.status = 201;
};

// A Koa router for connecting endpoints to middleware
const publicRouter = new Router({ prefix: '/api' });

// Connect the GET /api/chats endpoint to listChats middleware
publicRouter.get('/chats', listChats);

// Connect the POST /api/chats endpoint to createChats middleware
publicRouter.post('/chats', createChat);

const greetHuman = (ctx) => {
  ctx.body = 'Hello, human!';
  ctx.status = 200;
}

// GET /api/greeting
publicRouter.get('/greeting', greetHuman);

// Add the router middleware to the Koa instance
app.use(publicRouter.routes());

// Add a middleware for responding to OPTIONS with a list of
// allowed methods
app.use(publicRouter.allowedMethods());
