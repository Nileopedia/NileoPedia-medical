export interface SynonymExpansion {
  originalQuery: string;
  expandedQuery: string;
  matchedSynonym: string | null;
  synonyms: string[];
}

export class MedicalSynonymService {
  private readonly synonymMap: Map<string, string[]> = new Map([
    ['hypertension', ['high blood pressure', 'htn', 'high bp', 'elevated blood pressure']],
    ['htn', ['hypertension', 'high blood pressure', 'high bp']],
    ['high blood pressure', ['hypertension', 'htn', 'elevated blood pressure']],
    ['heart attack', ['myocardial infarction', 'mi', 'cardiac arrest', 'acute coronary syndrome']],
    ['myocardial infarction', ['heart attack', 'mi', 'acute coronary syndrome']],
    ['mi', ['myocardial infarction', 'heart attack', 'acute coronary syndrome']],
    ['stroke', ['cerebrovascular accident', 'cva', 'brain attack', 'cerebral vascular accident']],
    ['cva', ['stroke', 'cerebrovascular accident', 'brain attack']],
    ['cerebrovascular accident', ['stroke', 'cva', 'brain attack']],
    ['high blood sugar', ['diabetes mellitus', 'diabetes', 'hyperglycemia', 'high glucose']],
    ['diabetes mellitus', ['diabetes', 'high blood sugar', 'hyperglycemia', 'high glucose']],
    ['diabetes', ['diabetes mellitus', 'high blood sugar', 'hyperglycemia']],
    ['blood pressure', ['hypertension', 'high blood pressure', 'htn', 'bp']],
    ['bp', ['blood pressure', 'hypertension', 'high blood pressure']],
    ['asthma', ['bronchial asthma', 'reactive airway disease', 'asthma attack']],
    ['copd', ['chronic obstructive pulmonary disease', 'chronic bronchitis', 'emphysema']],
    ['chronic obstructive pulmonary disease', ['copd', 'chronic bronchitis', 'emphysema']],
    ['malaria', ['paludism', 'malarial fever']],
    ['tuberculosis', ['tb', 'consumption', 'pulmonary tuberculosis']],
    ['tb', ['tuberculosis', 'consumption']],
    ['hiv', ['human immunodeficiency virus', 'aids', 'acquired immunodeficiency syndrome']],
    ['aids', ['hiv', 'human immunodeficiency virus', 'acquired immunodeficiency syndrome']],
    ['heart failure', ['congestive heart failure', 'chf', 'cardiac failure', 'heart dysfunction']],
    ['chf', ['heart failure', 'congestive heart failure', 'cardiac failure']],
    ['congestive heart failure', ['heart failure', 'chf', 'cardiac failure']],
    ['cancer', ['malignancy', 'malignant tumor', 'neoplasm', 'carcinoma']],
    ['malignancy', ['cancer', 'malignant tumor', 'neoplasm']],
    ['pneumonia', ['lung infection', 'pulmonary infection', 'lower respiratory tract infection']],
    ['ckd', ['chronic kidney disease', 'kidney failure', 'renal failure', 'renal insufficiency']],
    ['chronic kidney disease', ['ckd', 'kidney failure', 'renal failure', 'renal insufficiency']],
    ['kidney failure', ['renal failure', 'ckd', 'chronic kidney disease']],
    ['renal failure', ['kidney failure', 'ckd', 'chronic kidney disease']],
    ['myocardial infarction', ['heart attack', 'mi', 'acute coronary syndrome']],
    ['acute coronary syndrome', ['myocardial infarction', 'heart attack', 'mi']],
    ['cerebrovascular accident', ['stroke', 'cva', 'brain attack']],
    ['brain attack', ['stroke', 'cerebrovascular accident', 'cva']],
    ['cardiac arrest', ['heart attack', 'myocardial infarction', 'sudden cardiac death']],
    ['sudden cardiac death', ['cardiac arrest', 'heart attack', 'myocardial infarction']],
    ['hyperglycemia', ['high blood sugar', 'diabetes mellitus', 'diabetes']],
    ['hypercholesterolemia', ['high cholesterol', 'elevated cholesterol']],
    ['high cholesterol', ['hypercholesterolemia', 'elevated cholesterol']],
    ['myocardial', ['heart attack', 'myocardial infarction', 'mi']],
    ['cerebral', ['stroke', 'cerebrovascular accident', 'cva']],
    ['cerebral vascular accident', ['stroke', 'cva', 'cerebrovascular accident']],
  ]);

  private readonly commonTerms = new Set([
    'pain', 'ache', 'fever', 'cough', 'fatigue', 'weakness', 'nausea', 'vomiting',
    'diarrhea', 'headache', 'dizziness', 'swelling', 'rash', 'bleeding', 'infection',
    'symptoms', 'diagnosis', 'treatment', 'medication', 'disease', 'patient', 'doctor',
    'hospital', 'clinic', 'surgery', 'test', 'exam', 'screening', 'prevention',
    'cause', 'risk', 'factor', 'sign', 'syndrome', 'disorder', 'condition', 'illness',
    'acute', 'chronic', 'severe', 'mild', 'moderate', 'prognosis', 'complication',
    'side effect', 'allergy', 'reaction', 'dose', 'therapy', 'drug', 'medicine',
  ]);

  expand(query: string): SynonymExpansion {
    const normalized = query.toLowerCase().trim();
    const matchedSynonym = this.findBestMatch(normalized);
    
    let expandedQuery = normalized;
    const synonyms: string[] = [];

    if (matchedSynonym) {
      const expansions = this.synonymMap.get(matchedSynonym) || [];
      const uniqueExpansions = expansions.filter(s => s !== matchedSynonym && !normalized.includes(s));
      synonyms.push(...uniqueExpansions);
      
      expandedQuery = [normalized, ...uniqueExpansions].join(' ');
    }

    return {
      originalQuery: normalized,
      expandedQuery: expandedQuery.trim(),
      matchedSynonym: matchedSynonym || null,
      synonyms,
    };
  }

  private findBestMatch(query: string): string | null {
    const queryTerms = query.split(/\s+/);
    
    for (const term of queryTerms) {
      if (this.synonymMap.has(term)) {
        return term;
      }
    }

    for (const [key, values] of this.synonymMap.entries()) {
      if (query.includes(key)) {
        return key;
      }
      for (const value of values) {
        if (query.includes(value)) {
          return key;
        }
      }
    }

    return null;
  }

  isMedicalTerm(term: string): boolean {
    const normalized = term.toLowerCase().trim();
    if (this.synonymMap.has(normalized)) {
      return true;
    }
    for (const [key, values] of this.synonymMap.entries()) {
      if (normalized.includes(key) || values.some(v => normalized.includes(v))) {
        return true;
      }
    }
    return this.commonTerms.has(normalized.split(' ')[0]);
  }

  getSynonymGroups(): string[][] {
    const groups: string[][] = [];
    const seen = new Set<string>();
    
    for (const [key, values] of this.synonymMap.entries()) {
      if (seen.has(key)) continue;
      const group = [key, ...values];
      groups.push(group);
      for (const term of group) {
        seen.add(term);
      }
    }
    
    return groups;
  }
}

export const medicalSynonymService = new MedicalSynonymService();
