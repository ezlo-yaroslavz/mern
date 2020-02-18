/**
 * @file The application root. Defines the Express server configuration.
 */

const express = require('express');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');
const path = require('path');

const { errorHandler } = require('./middleware');

const {
  usersRouter,
  itemsRouter,
  accountsRouter,
  institutionsRouter,
  serviceRouter,
  linkEventsRouter,
  unhandledRouter,
} = require('./routes');

const app = express();
const PORT = config.get('port') || 5000;

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname), 'client', 'build', 'index.html');
  });
}

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
const io = socketIo(server);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware to pass socket to each request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set socket.io listeners.
io.on('connection', socket => {
  console.log('SOCKET CONNECTED');

  socket.on('disconnect', () => {
    console.log('SOCKET DISCONNECTED');
  });
});

app.get('/test', (req, res) => {
  res.send('test response');
});

app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/accounts', accountsRouter);
app.use('/institutions', institutionsRouter);
app.use('/services', serviceRouter);
app.use('/link-event', linkEventsRouter);
app.use('*', unhandledRouter);

// Error handling has to sit at the bottom of the stack.
// https://github.com/expressjs/express/issues/2718
app.use(errorHandler);
