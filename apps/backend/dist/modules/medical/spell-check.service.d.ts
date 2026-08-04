export interface SpellCorrection {
    original: string;
    corrected: string;
    distance: number;
}
export interface SpellCheckResult {
    originalQuery: string;
    correctedQuery: string;
    corrections: SpellCorrection[];
}
export declare class SpellCheckService {
    private readonly dictionary;
    private readonly commonMisspellings;
    constructor();
    private buildDictionary;
    check(query: string): SpellCheckResult;
    private findClosestMatch;
}
export declare const spellCheckService: SpellCheckService;
//# sourceMappingURL=spell-check.service.d.ts.map