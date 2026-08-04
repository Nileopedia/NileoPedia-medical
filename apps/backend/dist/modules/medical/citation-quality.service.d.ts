export interface CitationQualityResult {
    qualityScore: number;
    tier: 'WHO' | 'CDC' | 'NIH' | 'NICE' | 'AHA' | 'ACC' | 'ESC' | 'PubMed' | 'Cochrane' | 'PEER_REVIEWED' | 'TEXTBOOK' | 'GUIDELINE' | 'BLOG' | 'UNKNOWN';
    source: string;
    authorityWeight: number;
}
export declare class CitationQualityService {
    private readonly sourceTiers;
    evaluate(source: string, documentType?: string, authors?: string[]): CitationQualityResult;
    getTierPriority(tier: CitationQualityResult['tier']): number;
}
export declare const citationQualityService: CitationQualityService;
//# sourceMappingURL=citation-quality.service.d.ts.map