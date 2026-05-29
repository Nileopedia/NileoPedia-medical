import './workers/document.worker';
import './workers/ai.worker';
import './workers/email.worker';
import './workers/notification.worker';
import './workers/audit.worker';
import './workers/cleanup.worker';
import { setupSchedulers } from './schedulers';

console.log('Worker system initialized');
setupSchedulers();

process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});