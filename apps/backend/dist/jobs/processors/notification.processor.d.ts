import { NotificationJob } from '../types';
export declare function processNotification(job: NotificationJob): Promise<{
    success: boolean;
    notificationId: string;
}>;
export declare function processBulkNotifications(jobs: NotificationJob[]): Promise<{
    success: boolean;
    count: number;
}>;
//# sourceMappingURL=notification.processor.d.ts.map