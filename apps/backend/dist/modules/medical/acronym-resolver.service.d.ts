export interface AcronymResolution {
    original: string;
    expanded: string;
    confidence: number;
    category: 'disease' | 'medication' | 'procedure' | 'anatomy' | 'general';
}
export interface AcronymExpansion {
    acronyms: AcronymResolution[];
    expandedTerms: string[];
    originalQuery: string;
    expandedQuery: string;
}
export declare class MedicalAcronymResolver {
    private readonly acronyms;
    resolve(term: string): AcronymResolution | null;
    resolveAll(query: string): AcronymExpansion;
    getAcronymsByCategory(category: AcronymResolution['category']): Array<{
        acronym: string;
        expansion: string;
        confidence: number;
    }>;
    getAllAcronyms(): Array<{
        acronym: string;
        expansion: string;
        category: string;
        confidence: number;
    }>;
}
export declare const medicalAcronymResolver: MedicalAcronymResolver;
//# sourceMappingURL=acronym-resolver.service.d.ts.map