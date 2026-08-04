"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeGapDetectionService = exports.KnowledgeGapDetectionService = void 0;
class KnowledgeGapDetectionService {
    constructor() {
        this.queryHistory = new Map();
        this.maxHistorySize = 50000;
    }
    recordSearch(query, hasResults) {
        const existing = this.queryHistory.get(query) || { count: 0, lastSearched: new Date(), hasResults: false };
        this.queryHistory.set(query, {
            count: existing.count + 1,
            lastSearched: new Date(),
            hasResults: existing.hasResults || hasResults,
        });
        if (this.queryHistory.size > this.maxHistorySize) {
            const entries = Array.from(this.queryHistory.entries());
            entries.sort((a, b) => b[1].lastSearched.getTime() - a[1].lastSearched.getTime());
            this.queryHistory = new Map(entries.slice(0, this.maxHistorySize));
        }
    }
    async detectGaps() {
        const gaps = [];
        const recommendations = new Set();
        const diseaseQueries = new Map();
        const symptomQueries = new Map();
        for (const [query, data] of this.queryHistory.entries()) {
            const queryLower = query.toLowerCase();
            const isDiseaseQuery = /\b(hypertension|diabetes|asthma|copd|malaria|tuberculosis|hiv|heart failure|stroke|cancer|pneumonia|ckd|chf|mi|cva|cad|gerd|ibd|ibs|uti|ards|pe|dvt|tia|aids|hepatitis|arthritis|osteoporosis|anemia|leukemia|lymphoma|myeloma|neuropathy|alzheimer|dementia|parkinson|epilepsy|seizure|meningitis|encephalitis|pneumonia|bronchitis|sinusitis|pharyngitis|tonsillitis|otitis|conjunctivitis|dermatitis|eczema|psoriasis|acne|rosacea|urticaria|angioedema|anaphylaxis|shock|sepsis|septicemia|bacteremia|fungemia|viremia|parasitemia|helminthiasis|protozoiasis|infestation|infestation)\b/i.test(queryLower);
            const isSymptomQuery = /\b(pain|fever|cough|fatigue|weakness|nausea|vomiting|diarrhea|headache|dizziness|swelling|rash|bleeding|infection|chest pain|shortness of breath|palpitations|numbness|tingling|confusion|seizure|paralysis|tremor|stiffness|joint pain|muscle pain|weight loss|weight gain|appetite loss|insomnia|anxiety|depression|sore throat|congestion|wheezing|blood in urine|blood in stool|abdominal pain|back pain|neck pain|shoulder pain|knee pain|hip pain|foot pain|hand pain|leg pain|arm pain|jaw pain|tooth pain|ear pain|eye pain|throat pain|skin rash|itching|hives|blisters|ulcers|sores|lesions|edema|inflammation|redness|warmth|tenderness|coughing|sneezing|runny nose|stuffy nose|hoarseness|voice change|difficulty swallowing|dysphagia|heartburn|indigestion|bloating|gas|constipation|frequent urination|painful urination|difficulty urinating|irregular heartbeat|fast heartbeat|slow heartbeat|fainting|syncope|lightheadedness|vertigo|memory loss|disorientation|agitation|restlessness|shaking)\b/i.test(queryLower);
            if (isDiseaseQuery && !data.hasResults) {
                const terms = queryLower.match(/\b([a-z]{3,})\b/g) || [];
                for (const term of terms) {
                    if (!diseaseQueries.has(term)) {
                        diseaseQueries.set(term, { count: 0, lastSearched: new Date(), hasResults: false });
                    }
                    const existing = diseaseQueries.get(term);
                    existing.count += data.count;
                    existing.lastSearched = data.lastSearched > existing.lastSearched ? data.lastSearched : existing.lastSearched;
                    existing.hasResults = existing.hasResults || data.hasResults;
                }
            }
            if (isSymptomQuery && !data.hasResults) {
                const terms = queryLower.match(/\b([a-z]{3,})\b/g) || [];
                for (const term of terms) {
                    if (!symptomQueries.has(term)) {
                        symptomQueries.set(term, { count: 0, lastSearched: new Date(), hasResults: false });
                    }
                    const existing = symptomQueries.get(term);
                    existing.count += data.count;
                    existing.lastSearched = data.lastSearched > existing.lastSearched ? data.lastSearched : existing.lastSearched;
                    existing.hasResults = existing.hasResults || data.hasResults;
                }
            }
        }
        for (const [query, data] of diseaseQueries.entries()) {
            if (!data.hasResults && data.count >= 3) {
                const priority = data.count >= 10 ? 'high' : data.count >= 5 ? 'medium' : 'low';
                gaps.push({
                    id: `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    query,
                    searchCount: data.count,
                    lastSearched: data.lastSearched,
                    suggestedDocuments: this.suggestDocuments(query),
                    priority,
                    status: 'new',
                });
                recommendations.add(`Add authoritative documents for ${query}`);
            }
        }
        for (const [query, data] of symptomQueries.entries()) {
            if (!data.hasResults && data.count >= 3) {
                const priority = data.count >= 10 ? 'high' : data.count >= 5 ? 'medium' : 'low';
                gaps.push({
                    id: `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    query,
                    searchCount: data.count,
                    lastSearched: data.lastSearched,
                    suggestedDocuments: this.suggestDocuments(query),
                    priority,
                    status: 'new',
                });
                recommendations.add(`Add documents covering symptom: ${query}`);
            }
        }
        gaps.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.searchCount - a.searchCount;
        });
        return {
            totalGaps: gaps.length,
            highPriorityGaps: gaps.filter(g => g.priority === 'high').length,
            mediumPriorityGaps: gaps.filter(g => g.priority === 'medium').length,
            lowPriorityGaps: gaps.filter(g => g.priority === 'low').length,
            gaps: gaps.slice(0, 100),
            recommendations: Array.from(recommendations).slice(0, 20),
        };
    }
    suggestDocuments(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        const authoritativeDocs = {
            'hypertension': ['WHO Hypertension Guideline', 'AHA/ACC Hypertension Guidelines', 'ESC Hypertension Guidelines'],
            'diabetes': ['ADA Standards of Medical Care', 'WHO Diabetes Guideline', 'NICE Diabetes Guidelines'],
            'asthma': ['GINA Asthma Strategy', 'NHLBI Asthma Guidelines', 'ERS Asthma Guidelines'],
            'copd': ['GOLD COPD Report', 'ERS COPD Guidelines', 'NICE COPD Guidelines'],
            'malaria': ['WHO Malaria Guidelines', 'CDC Malaria Treatment Guidelines', 'WHO Malaria Report'],
            'tuberculosis': ['WHO TB Guidelines', 'CDC TB Treatment Guidelines', 'WHO End TB Strategy'],
            'hiv': ['WHO HIV Guidelines', 'CDC HIV Treatment Guidelines', 'IAS HIV Guidelines'],
            'heart failure': ['AHA/ACC Heart Failure Guidelines', 'ESC Heart Failure Guidelines', 'HFSA Guidelines'],
            'stroke': ['AHA/ASA Stroke Guidelines', 'ESO Stroke Guidelines', 'WHO Stroke Guidelines'],
            'cancer': ['WHO Cancer Guidelines', 'NCCN Guidelines', 'ESMO Guidelines'],
            'pneumonia': ['IDSA/ATS Pneumonia Guidelines', 'WHO Pneumonia Guidelines', 'ERS Pneumonia Guidelines'],
            'ckd': ['KDIGO CKD Guidelines', 'NKF Clinical Practice Guidelines', 'ERA CKD Guidelines'],
        };
        for (const [key, docs] of Object.entries(authoritativeDocs)) {
            if (queryLower.includes(key)) {
                suggestions.push(...docs);
            }
        }
        if (suggestions.length === 0) {
            suggestions.push(`WHO ${query} Guideline`, `${query} Clinical Practice Guidelines`, `NIH ${query} Evidence Report`);
        }
        return suggestions.slice(0, 5);
    }
    getQueryHistory() {
        return Array.from(this.queryHistory.entries())
            .map(([query, data]) => ({ query, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);
    }
}
exports.KnowledgeGapDetectionService = KnowledgeGapDetectionService;
exports.knowledgeGapDetectionService = new KnowledgeGapDetectionService();
//# sourceMappingURL=knowledge-gap-detection.service.js.map