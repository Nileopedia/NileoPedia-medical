"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionController = void 0;
const queues_1 = require("../../../jobs/queues");
const document_processor_1 = require("../../../jobs/processors/document.processor");
const logger_1 = require("../../../config/logger");
const JOURNAL_SOURCES = [
    { name: 'PubMed Central', specialty: 'general' },
    { name: 'NEJM', specialty: 'general' },
    { name: 'The Lancet', specialty: 'general' },
    { name: 'JAMA', specialty: 'general' },
    { name: 'Circulation', specialty: 'cardiology' },
    { name: 'Diabetes Care', specialty: 'endocrinology' },
    { name: 'Journal of Clinical Oncology', specialty: 'oncology' },
    { name: 'Neurology', specialty: 'neurology' },
    { name: 'Gastroenterology', specialty: 'gastroenterology' },
];
class IngestionController {
    async runManualIngestion(req, res, next) {
        try {
            const results = await (0, document_processor_1.refreshKnowledgeBase)(false);
            res.status(200).json({ success: true, message: 'Manual ingestion completed', data: results });
        }
        catch (error) {
            logger_1.logger.error('Error in runManualIngestion controller:', error);
            next(error);
        }
    }
    async runIncrementalRefresh(req, res, next) {
        try {
            const results = await (0, document_processor_1.refreshKnowledgeBase)(true);
            res.status(200).json({ success: true, message: 'Incremental refresh completed', data: results });
        }
        catch (error) {
            logger_1.logger.error('Error in runIncrementalRefresh controller:', error);
            next(error);
        }
    }
    async getStatus(req, res, next) {
        try {
            const status = {
                isRunning: false,
                isActive: !!queues_1.documentQueue,
                sources: JOURNAL_SOURCES.length,
            };
            res.status(200).json({ success: true, data: status });
        }
        catch (error) {
            logger_1.logger.error('Error in getStatus controller:', error);
            next(error);
        }
    }
}
exports.IngestionController = IngestionController;
//# sourceMappingURL=ingestion.controller.js.map