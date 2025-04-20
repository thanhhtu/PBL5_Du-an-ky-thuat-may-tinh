import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import 'dotenv/config';
import http from 'http';
import path from 'path';
import routers from './api';
import errorHandler from './middlewares/errorHandler.middleware';
import urlValidateMiddleware from './middlewares/urlValidate.middleware';
import { socketConfig } from './config/socket.config';

const app = express();
const server = http.createServer(app);
socketConfig(server);

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/images')));

app.use('/', routers);

app.use(errorHandler);
app.use(urlValidateMiddleware.checkUrl);

const port = 3000;
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
