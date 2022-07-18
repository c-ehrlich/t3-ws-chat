import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from './router';
import { createContext } from './router/context';

const wss = new ws.Server({
  port: 3001, // TODO get from env
});

const handler = applyWSSHandler({ wss, createContext, router: appRouter });

wss.on('connection', () => {
  console.log(`++ Got a connection ${wss.clients.size}`);

  wss.once('close', () => {
    console.log(`-- Closed connection ${wss.clients.size}`);
  });
});

console.log(`ws server started`);

process.on('SIGTERM', () => {
  console.log('SIGTERM');

  // tell clients that they need to reconnect
  handler.broadcastReconnectNotification();

  wss.close();
});
