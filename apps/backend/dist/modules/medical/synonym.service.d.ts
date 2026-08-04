export interface SynonymExpansion {
    originalQuery: string;
    expandedQuery: string;
    matchedSynonym: string | null;
    synonyms: string[];
}
export declare class MedicalSynonymService {
    private readonly synonymMap;
    private readonly commonTerms;
    expand(query: string): SynonymExpansion;
    private findBestMatch;
    isMedicalTerm(term: string): boolean;
    getSynonymGroups(): string[][];
}
export declare const medicalSynonymService: MedicalSynonymService;
//# sourceMappingURL=synonym.service.d.ts.map