"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainabilityService = exports.ExplainabilityService = void 0;
class ExplainabilityService {
    generateExplanation(params) {
        const documentSelectionReasons = params.selectedDocuments.map(doc => {
            const reason = this.generateSelectionReason(doc);
            const evidenceLevel = this.getEvidenceLevel(doc.citationQuality, doc.specialty);
            return {
                documentId: doc.id,
                title: doc.title,
                reason,
                similarityScore: doc.similarityScore,
                rerankerScore: doc.rerankerScore,
                citationQuality: doc.citationQuality,
                metadataCompleteness: doc.metadataCompleteness,
                evidenceLevel,
                specialty: doc.specialty,
                publicationYear: doc.publicationYear,
            };
        });
        return {
            query: params.query,
            expandedQuery: params.expandedQuery,
            resolvedAcronyms: params.resolvedAcronyms,
            resolvedSynonyms: params.resolvedSynonyms,
            retrievalSteps: params.retrievalSteps,
            documentSelectionReasons,
            confidenceBreakdown: params.confidenceBreakdown,
            hybridWeights: params.hybridWeights,
        };
    }
    generateSelectionReason(doc) {
        const reasons = [];
        if (doc.similarityScore > 0.7) {
            reasons.push('strong semantic match');
        }
        else if (doc.similarityScore > 0.5) {
            reasons.push('moderate semantic match');
        }
        else {
            reasons.push('weak semantic match');
        }
        if (doc.rerankerScore > 0.8) {
            reasons.push('high relevance score');
        }
        else if (doc.rerankerScore > 0.5) {
            reasons.push('moderate relevance');
        }
        if (doc.citationQuality >= 8) {
            reasons.push('high-quality source');
        }
        else if (doc.citationQuality >= 5) {
            reasons.push('moderate-quality source');
        }
        if (doc.metadataCompleteness > 80) {
            reasons.push('complete metadata');
        }
        else if (doc.metadataCompleteness > 50) {
            reasons.push('partial metadata');
        }
        return reasons.join(', ');
    }
    getEvidenceLevel(citationQuality, specialty) {
        if (citationQuality >= 9)
            return 'Level I - Systematic Review/Meta-Analysis';
        if (citationQuality >= 8)
            return 'Level II - Randomized Controlled Trial';
        if (citationQuality >= 7)
            return 'Level III - Cohort Study';
        if (citationQuality >= 6)
            return 'Level IV - Case-Control Study';
        if (citationQuality >= 5)
            return 'Level V - Expert Opinion';
        return 'Level VI - Unknown Evidence Level';
    }
    formatExplanationForUI(explanation) {
        let output = `## Retrieval Explanation\n\n`;
        output += `**Original Query:** ${explanation.query}\n`;
        output += `**Expanded Query:** ${explanation.expandedQuery}\n\n`;
        if (explanation.resolvedAcronyms.length > 0) {
            output += `**Resolved Acronyms:** ${explanation.resolvedAcronyms.join(', ')}\n`;
        }
        if (explanation.resolvedSynonyms.length > 0) {
            output += `**Resolved Synonyms:** ${explanation.resolvedSynonyms.join(', ')}\n`;
        }
        output += `\n**Hybrid Weights:**\n`;
        output += `- Dense: ${explanation.hybridWeights.dense * 100}%\n`;
        output += `- Keyword: ${explanation.hybridWeights.keyword * 100}%\n\n`;
        output += `**Retrieval Steps:**\n`;
        for (const step of explanation.retrievalSteps) {
            output += `- ${step.step}: ${step.description} (${step.duration}ms)\n`;
        }
        output += `\n**Document Selection Reasons:**\n`;
        for (const doc of explanation.documentSelectionReasons) {
            output += `- **${doc.title}**\n`;
            output += `  - Similarity: ${doc.similarityScore.toFixed(3)}\n`;
            output += `  - Reranker: ${doc.rerankerScore.toFixed(3)}\n`;
            output += `  - Citation Quality: ${doc.citationQuality}/10\n`;
            output += `  - Metadata: ${doc.metadataCompleteness}%\n`;
            output += `  - Evidence: ${doc.evidenceLevel}\n`;
            output += `  - Reason: ${doc.reason}\n\n`;
        }
        output += `**Confidence Breakdown:**\n`;
        for (const [key, value] of Object.entries(explanation.confidenceBreakdown)) {
            output += `- ${key}: ${value.toFixed(2)}\n`;
        }
        return output;
    }
}
exports.ExplainabilityService = ExplainabilityService;
exports.explainabilityService = new ExplainabilityService();
//# sourceMappingURL=explainability.service.js.map