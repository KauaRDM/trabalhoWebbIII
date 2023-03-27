import express, { response } from 'express';
import { router } from './router/index';

const server = express();
const port = 3000;

server.use(express.json());
server.use(router)

server.listen(port, () => {
  console.log(`Servidor ligado - URL: http://localhost:${port}`);

});
