"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicRetrievalService = exports.DynamicRetrievalService = void 0;
class DynamicRetrievalService {
    constructor() {
        this.synonymService = require('./synonym.service').medicalSynonymService;
        this.acronymResolver = require('./acronym-resolver.service').medicalAcronymResolver;
    }
    analyzeQuery(query) {
        const normalized = query.toLowerCase().trim();
        const wordCount = normalized.split(/\s+/).length;
        let detectedAcronyms = [];
        const detectedSynonyms = [];
        const expandedTerms = [];
        const medicalConcepts = [];
        const acronymExpansion = this.acronymResolver.resolveAll(normalized);
        detectedAcronyms = acronymExpansion.acronyms.map((a) => a.original);
        expandedTerms.push(...acronymExpansion.expandedTerms);
        const synonymExpansion = this.synonymService.expand(normalized);
        if (synonymExpansion.matchedSynonym) {
            detectedSynonyms.push(synonymExpansion.matchedSynonym);
            expandedTerms.push(...synonymExpansion.synonyms);
        }
        const isAbbreviation = /^[A-Za-z]{2,6}$/.test(normalized) && detectedAcronyms.length > 0;
        const isSymptomQuery = /\b(pain|fever|cough|fatigue|nausea|vomiting|diarrhea|headache|dizziness|rash|swelling|bleeding|shortness of breath|chest pain|palpitations|numbness|tingling|confusion|seizure)\b/i.test(normalized);
        const isQuestion = /\b(what|how|why|when|where|is|are|can|could|should|would|do|does)\b/i.test(normalized);
        let queryType = 'keyword';
        let denseWeight = 0.5;
        let keywordWeight = 0.5;
        let complexity = 'low';
        if (isAbbreviation) {
            queryType = 'abbreviation';
            denseWeight = 0.3;
            keywordWeight = 0.7;
            complexity = 'low';
        }
        else if (isSymptomQuery) {
            queryType = 'symptom';
            denseWeight = 0.85;
            keywordWeight = 0.15;
            complexity = 'medium';
        }
        else if (isQuestion && wordCount > 5) {
            queryType = 'question';
            denseWeight = 0.8;
            keywordWeight = 0.2;
            complexity = 'high';
        }
        else if (wordCount > 3) {
            queryType = 'natural_language';
            denseWeight = 0.8;
            keywordWeight = 0.2;
            complexity = 'medium';
        }
        else if (wordCount <= 3) {
            queryType = 'keyword';
            denseWeight = 0.5;
            keywordWeight = 0.5;
            complexity = 'low';
        }
        if (detectedSynonyms.length > 0 || detectedAcronyms.length > 0) {
            keywordWeight = Math.min(keywordWeight + 0.1, 0.8);
            denseWeight = 1 - keywordWeight;
        }
        const medicalTerms = this.extractMedicalTerms(normalized);
        medicalConcepts.push(...medicalTerms);
        return {
            queryType,
            denseWeight: Math.round(denseWeight * 100) / 100,
            keywordWeight: Math.round(keywordWeight * 100) / 100,
            expandedTerms,
            detectedAcronyms,
            detectedSynonyms,
            medicalConcepts,
            complexity,
        };
    }
    extractMedicalTerms(text) {
        const terms = [];
        const patterns = [
            /\b(hypertension|diabetes|asthma|pneumonia|stroke|cancer|malaria|tuberculosis|hiv|aids|copd|ckd|chf|mi|cva|cad|gerd|ibd|ibs|uti|uri|ards|pe|dvt|tia)\b/i,
            /\b(heart attack|myocardial infarction|cerebrovascular accident|high blood pressure|low blood pressure|high blood sugar|chronic kidney disease|chronic obstructive pulmonary disease|inflammatory bowel disease|irritable bowel syndrome|urinary tract infection|upper respiratory infection|acute respiratory distress syndrome|pulmonary embolism|deep vein thrombosis|transient ischemic attack)\b/i,
        ];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                terms.push(...matches.map(m => m.toLowerCase()));
            }
        }
        return [...new Set(terms)];
    }
}
exports.DynamicRetrievalService = DynamicRetrievalService;
exports.dynamicRetrievalService = new DynamicRetrievalService();
//# sourceMappingURL=dynamic-retrieval.service.js.map