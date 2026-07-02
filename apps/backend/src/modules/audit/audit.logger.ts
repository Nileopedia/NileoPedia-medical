import { Request } from 'express';
import type { JsonValue } from '@prisma/client/runtime/library';
import prisma from '../../config/prisma';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogger {
  static async log(req: Request, input: AuditLogInput) {
    try {
      const data: any = {
        action: input.action,
      };
      if (input.userId) data.userId = input.userId;
      else if (req?.user?.id) data.userId = req.user.id;
      if (input.entityType) data.entityType = input.entityType;
      if (input.entityId) data.entityId = input.entityId;
      if (input.description) data.description = input.description;
      if (req?.ip) data.ipAddress = req.ip;
      else if (req?.connection?.remoteAddress) data.ipAddress = req.connection.remoteAddress;
      if (req?.get) {
        const ua = req.get('user-agent');
        if (ua) data.userAgent = ua;
      }
      if (input.metadata) data.metadata = input.metadata as JsonValue;

      await prisma.auditLog.create({ data });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
