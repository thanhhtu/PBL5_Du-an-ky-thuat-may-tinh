import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import 'dotenv/config';
import routers from './apis';
import errorHandler from './middleware/errorHandler.middleware';
import urlValidateMiddleware from'./middleware/urlValidate.middleware';
import http from 'http';
import path from 'path';
import { socketConfig } from './config/socket.config';

const app = express();
const server = http.createServer(app);
socketConfig(server);

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/upload')));

app.use('/', routers);

app.use(errorHandler);
app.use(urlValidateMiddleware.checkUrl);

const port = 3000;
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

server.listen(port, () => {
  console.log('Socket server running on port 3000');
});