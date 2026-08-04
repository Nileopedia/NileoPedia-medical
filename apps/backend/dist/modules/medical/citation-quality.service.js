"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citationQualityService = exports.CitationQualityService = void 0;
class CitationQualityService {
    constructor() {
        this.sourceTiers = {
            'who.int': { tier: 'WHO', weight: 10 },
            'who': { tier: 'WHO', weight: 10 },
            'world health organization': { tier: 'WHO', weight: 10 },
            'cdc.gov': { tier: 'CDC', weight: 9.5 },
            'centers for disease control': { tier: 'CDC', weight: 9.5 },
            'cdc': { tier: 'CDC', weight: 9.5 },
            'nih.gov': { tier: 'NIH', weight: 9.5 },
            'national institutes of health': { tier: 'NIH', weight: 9.5 },
            'nih': { tier: 'NIH', weight: 9.5 },
            'nice.org.uk': { tier: 'NICE', weight: 9.5 },
            'nice': { tier: 'NICE', weight: 9.5 },
            'aha.org': { tier: 'AHA', weight: 9 },
            'american heart association': { tier: 'AHA', weight: 9 },
            'aha': { tier: 'AHA', weight: 9 },
            'acc.org': { tier: 'ACC', weight: 9 },
            'american college of cardiology': { tier: 'ACC', weight: 9 },
            'acc': { tier: 'ACC', weight: 9 },
            'esc.org': { tier: 'ESC', weight: 9 },
            'european society of cardiology': { tier: 'ESC', weight: 9 },
            'esc': { tier: 'ESC', weight: 9 },
            'pubmed': { tier: 'PubMed', weight: 8.5 },
            'ncbi.nlm.nih.gov': { tier: 'PubMed', weight: 8.5 },
            'cochrane': { tier: 'Cochrane', weight: 9 },
            'cochranelibrary.com': { tier: 'Cochrane', weight: 9 },
            'medlineplus.gov': { tier: 'PEER_REVIEWED', weight: 8 },
            'medlineplus': { tier: 'PEER_REVIEWED', weight: 8 },
            'nejm.org': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'new england journal of medicine': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'nejm': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'thelancet.com': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'lancet': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'bmj.com': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'british medical journal': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'bmj': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'jamanetwork.com': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'jama': { tier: 'PEER_REVIEWED', weight: 8.5 },
            'springer': { tier: 'PEER_REVIEWED', weight: 7.5 },
            'elsevier': { tier: 'PEER_REVIEWED', weight: 7.5 },
            'wiley': { tier: 'PEER_REVIEWED', weight: 7.5 },
            'nature.com': { tier: 'PEER_REVIEWED', weight: 8 },
            'nature': { tier: 'PEER_REVIEWED', weight: 8 },
            'science.org': { tier: 'PEER_REVIEWED', weight: 8 },
            'science': { tier: 'PEER_REVIEWED', weight: 8 },
            'guideline': { tier: 'GUIDELINE', weight: 8 },
            'clinical guideline': { tier: 'GUIDELINE', weight: 8 },
            'textbook': { tier: 'TEXTBOOK', weight: 7 },
            'harrison': { tier: 'TEXTBOOK', weight: 8 },
            'uptodate': { tier: 'TEXTBOOK', weight: 7.5 },
            'msd manual': { tier: 'TEXTBOOK', weight: 7.5 },
            'merck manual': { tier: 'TEXTBOOK', weight: 7.5 },
            'blog': { tier: 'BLOG', weight: 2 },
            'unknown': { tier: 'UNKNOWN', weight: 3 },
        };
    }
    evaluate(source, documentType, authors) {
        const normalizedSource = source.toLowerCase().trim();
        const normalizedDocType = documentType?.toLowerCase() || '';
        const hasAuthors = authors && authors.length > 0;
        for (const [key, config] of Object.entries(this.sourceTiers)) {
            if (normalizedSource.includes(key.toLowerCase())) {
                return {
                    qualityScore: config.weight,
                    tier: config.tier,
                    source: normalizedSource,
                    authorityWeight: config.weight,
                };
            }
        }
        if (hasAuthors && normalizedDocType.includes('journal')) {
            return { qualityScore: 7, tier: 'PEER_REVIEWED', source: normalizedSource, authorityWeight: 7 };
        }
        if (hasAuthors && normalizedDocType.includes('article')) {
            return { qualityScore: 7, tier: 'PEER_REVIEWED', source: normalizedSource, authorityWeight: 7 };
        }
        if (normalizedDocType.includes('guideline')) {
            return { qualityScore: 8, tier: 'GUIDELINE', source: normalizedSource, authorityWeight: 8 };
        }
        if (normalizedDocType.includes('textbook')) {
            return { qualityScore: 7, tier: 'TEXTBOOK', source: normalizedSource, authorityWeight: 7 };
        }
        if (normalizedDocType.includes('blog')) {
            return { qualityScore: 2, tier: 'BLOG', source: normalizedSource, authorityWeight: 2 };
        }
        return { qualityScore: 3, tier: 'UNKNOWN', source: normalizedSource, authorityWeight: 3 };
    }
    getTierPriority(tier) {
        const priorities = {
            'WHO': 1,
            'CDC': 2,
            'NIH': 3,
            'NICE': 4,
            'AHA': 5,
            'ACC': 6,
            'ESC': 7,
            'Cochrane': 8,
            'PubMed': 9,
            'PEER_REVIEWED': 10,
            'GUIDELINE': 11,
            'TEXTBOOK': 12,
            'BLOG': 13,
            'UNKNOWN': 14,
        };
        return priorities[tier] || 14;
    }
}
exports.CitationQualityService = CitationQualityService;
exports.citationQualityService = new CitationQualityService();
//# sourceMappingURL=citation-quality.service.js.map