import { Worker } from 'bullmq';
import { EmailJob } from '../types';
declare const worker: Worker<EmailJob, any, string>;
export default worker;
//# sourceMappingURL=email.worker.d.ts.map