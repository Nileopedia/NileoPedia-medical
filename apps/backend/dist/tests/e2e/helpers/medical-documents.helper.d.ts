export interface MedicalDocumentFixture {
    topic: string;
    specialty: string;
    title: string;
    content: string;
    fileType: 'pdf' | 'docx' | 'html' | 'txt';
    expectedDisease?: string;
    expectedSymptoms?: string[];
    expectedTreatments?: string[];
    expectedDiagnosis?: string[];
    expectedMedications?: string[];
    expectedSpecialty?: string;
}
declare const MEDICAL_DOCUMENTS: MedicalDocumentFixture[];
export declare function createTestDocument(fixture: MedicalDocumentFixture, userId: string): Promise<any>;
export declare function cleanupTestDocuments(): Promise<void>;
export { MEDICAL_DOCUMENTS };
//# sourceMappingURL=medical-documents.helper.d.ts.map