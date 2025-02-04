// src/server/router/context.ts
import * as trpc from '@trpc/server';
import ws from 'ws';
import * as trpcNext from '@trpc/server/adapters/next';
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/declarations/src/adapters/node-http';
import EventEmitter from 'events';
import { IncomingMessage } from 'http';

import { prisma } from '../db/client';

import { getSession } from 'next-auth/react';

const ee = new EventEmitter();

export const createContext = async (
  opts?:
    | trpcNext.CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  const req = opts?.req;
  const res = opts?.res;

  // we can't use getServerSession here because we're not on the server
  // we're in React
  const session = req && res && (await getSession({ req }));

  return {
    req,
    res,
    session,
    prisma,
    ee,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
