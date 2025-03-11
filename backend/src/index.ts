import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import 'dotenv/config';
import routers from './apis';
import errorHandler from './middleware/errorHandler.middleware';
import urlValidateMiddleware from'./middleware/urlValidate.middleware';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.use('/', routers);

app.use(errorHandler);
app.use(urlValidateMiddleware.checkUrl)

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})