import { Express } from 'express';
import { Server } from 'socket.io';
import './jobs/worker';
declare const app: Express;
declare const io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
declare global {
    var io: Server;
}
export { app, io };
//# sourceMappingURL=app.d.ts.map