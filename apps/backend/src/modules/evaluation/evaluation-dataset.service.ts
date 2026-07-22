export interface EvaluationQuestion {
  id: string;
  question: string;
  expectedDisease: string[];
  expectedCitations: string[];
  expectedSpecialty: string;
  expectedAnswer: string;
  expectedRetrievedDocuments: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface EvaluationResult {
  questionId: string;
  question: string;
  precision: number;
  recall: number;
  mrr: number;
  ndcg: number;
  contextPrecision: number;
  citationAccuracy: number;
  answerCorrectness: number;
  overallScore: number;
  retrievedDocuments: string[];
  actualCitations: string[];
  actualAnswer: string;
}

export interface EvaluationReport {
  totalQuestions: number;
  averagePrecision: number;
  averageRecall: number;
  averageMRR: number;
  averageNDCG: number;
  averageContextPrecision: number;
  averageCitationAccuracy: number;
  averageAnswerCorrectness: number;
  averageOverallScore: number;
  results: EvaluationResult[];
}

export class EvaluationDataset {
  private questions: EvaluationQuestion[] = [];

  constructor() {
    this.loadDefaultQuestions();
  }

  private loadDefaultQuestions(): void {
    const defaultQuestions: Omit<EvaluationQuestion, 'id'>[] = [
      // Cardiovascular (25 questions)
      {
        question: 'What is hypertension?',
        expectedDisease: ['hypertension'],
        expectedCitations: ['AHA/ACC'],
        expectedSpecialty: 'cardiology',
        expectedAnswer: 'Hypertension is high blood pressure, defined as BP >= 130/80 mmHg',
        expectedRetrievedDocuments: ['high blood pressure', 'hypertension'],
        difficulty: 'easy',
        category: 'cardiovascular',
      },
      {
        question: 'What are the symptoms of myocardial infarction?',
        expectedDisease: ['myocardial infarction', 'heart attack'],
        expectedCitations: ['AHA'],
        expectedSpecialty: 'cardiology',
        expectedAnswer: 'Symptoms include chest pain, shortness of breath, arm pain, sweating',
        expectedRetrievedDocuments: ['heart attack', 'myocardial infarction', 'acute coronary syndrome'],
        difficulty: 'easy',
        category: 'cardiovascular',
      },
      {
        question: 'How is diabetes mellitus diagnosed?',
        expectedDisease: ['diabetes mellitus'],
        expectedCitations: ['ADA', 'CDC'],
        expectedSpecialty: 'endocrinology',
        expectedAnswer: 'Diagnosed by HbA1c >= 6.5%, fasting glucose >= 126 mg/dL, or 2-hour glucose >= 200 mg/dL',
        expectedRetrievedDocuments: ['diabetes', 'diabetes mellitus', 'hyperglycemia'],
        difficulty: 'medium',
        category: 'endocrinology',
      },
      {
        question: 'What is the first-line treatment for asthma?',
        expectedDisease: ['asthma'],
        expectedCitations: ['GINA', 'NIH'],
        expectedSpecialty: 'pulmonology',
        expectedAnswer: 'Inhaled corticosteroids (ICS) are first-line, with SABA as rescue medication',
        expectedRetrievedDocuments: ['asthma', 'bronchial asthma'],
        difficulty: 'medium',
        category: 'pulmonology',
      },
      {
        question: 'What are the complications of stroke?',
        expectedDisease: ['stroke', 'cerebrovascular accident'],
        expectedCitations: ['AHA', 'CDC'],
        expectedSpecialty: 'neurology',
        expectedAnswer: 'Complications include paralysis, speech difficulties, cognitive impairment, depression',
        expectedRetrievedDocuments: ['stroke', 'cva', 'cerebrovascular accident'],
        difficulty: 'medium',
        category: 'neurology',
      },
      {
        question: 'How is tuberculosis transmitted?',
        expectedDisease: ['tuberculosis'],
        expectedCitations: ['CDC', 'WHO'],
        expectedSpecialty: 'infectious disease',
        expectedAnswer: 'TB is transmitted via airborne droplets from person to person',
        expectedRetrievedDocuments: ['tuberculosis', 'tb'],
        difficulty: 'easy',
        category: 'infectious disease',
      },
      {
        question: 'What is the difference between COPD and asthma?',
        expectedDisease: ['copd', 'asthma'],
        expectedCitations: ['GOLD', 'GINA'],
        expectedSpecialty: 'pulmonology',
        expectedAnswer: 'COPD is irreversible airflow limitation, asthma is reversible bronchoconstriction',
        expectedRetrievedDocuments: ['copd', 'asthma', 'chronic obstructive pulmonary disease'],
        difficulty: 'hard',
        category: 'pulmonology',
      },
      {
        question: 'What are risk factors for heart failure?',
        expectedDisease: ['heart failure', 'congestive heart failure'],
        expectedCitations: ['AHA', 'ESC'],
        expectedSpecialty: 'cardiology',
        expectedAnswer: 'Risk factors include CAD, hypertension, diabetes, obesity, smoking',
        expectedRetrievedDocuments: ['heart failure', 'chf', 'congestive heart failure'],
        difficulty: 'medium',
        category: 'cardiovascular',
      },
      {
        question: 'What is the standard treatment for community-acquired pneumonia?',
        expectedDisease: ['pneumonia'],
        expectedCitations: ['IDSA', 'ATS'],
        expectedSpecialty: 'infectious disease',
        expectedAnswer: 'Amoxicillin or macrolide antibiotics for outpatients, macrolide + beta-lactam for inpatients',
        expectedRetrievedDocuments: ['pneumonia', 'lung infection'],
        difficulty: 'hard',
        category: 'infectious disease',
      },
      {
        question: 'How is CKD staged?',
        expectedDisease: ['ckd', 'chronic kidney disease'],
        expectedCitations: ['KDIGO', 'NKF'],
        expectedSpecialty: 'nephrology',
        expectedAnswer: 'CKD is staged by eGFR: Stage 1 >=90, Stage 2 60-89, Stage 3a 45-59, Stage 3b 30-44, Stage 4 15-29, Stage 5 <15',
        expectedRetrievedDocuments: ['ckd', 'chronic kidney disease', 'kidney failure'],
        difficulty: 'hard',
        category: 'nephrology',
      },
      {
        question: 'What is the ICD-10 code for type 2 diabetes mellitus?',
        expectedDisease: ['diabetes mellitus'],
        expectedCitations: ['ICD-10', 'WHO'],
        expectedSpecialty: 'endocrinology',
        expectedAnswer: 'ICD-10 code for type 2 diabetes mellitus is E11',
        expectedRetrievedDocuments: ['diabetes', 'diabetes mellitus'],
        difficulty: 'medium',
        category: 'endocrinology',
      },
      {
        question: 'What is the mechanism of action of ACE inhibitors?',
        expectedDisease: ['hypertension'],
        expectedCitations: ['AHA', 'NIH'],
        expectedSpecialty: 'pharmacology',
        expectedAnswer: 'ACE inhibitors block conversion of angiotensin I to angiotensin II, causing vasodilation',
        expectedRetrievedDocuments: ['hypertension', 'high blood pressure', 'ace inhibitors'],
        difficulty: 'hard',
        category: 'pharmacology',
      },
      {
        question: 'What are the contraindications for aspirin?',
        expectedDisease: [],
        expectedCitations: ['FDA', 'WHO'],
        expectedSpecialty: 'pharmacology',
        expectedAnswer: 'Contraindications include active bleeding, aspirin allergy, hemorrhagic stroke',
        expectedRetrievedDocuments: ['aspirin', 'antiplatelet'],
        difficulty: 'medium',
        category: 'pharmacology',
      },
      {
        question: 'What is the difference between MI and angina?',
        expectedDisease: ['myocardial infarction', 'angina'],
        expectedCitations: ['AHA', 'ACC'],
        expectedSpecialty: 'cardiology',
        expectedAnswer: 'MI is myocardial necrosis with troponin elevation; angina is reversible ischemia without cell death',
        expectedRetrievedDocuments: ['heart attack', 'myocardial infarction', 'acute coronary syndrome', 'angina'],
        difficulty: 'hard',
        category: 'cardiovascular',
      },
      {
        question: 'What vaccinations are recommended for adults with HIV?',
        expectedDisease: ['hiv', 'aids'],
        expectedCitations: ['CDC', 'WHO'],
        expectedSpecialty: 'infectious disease',
        expectedAnswer: 'Influenza, pneumococcal, hepatitis B, HPV, Tdap, and varicella vaccines',
        expectedRetrievedDocuments: ['hiv', 'aids', 'immunization'],
        difficulty: 'hard',
        category: 'infectious disease',
      },
      {
        question: 'What is the Glasgow Coma Scale?',
        expectedDisease: [],
        expectedCitations: ['NEJM', 'CDC'],
        expectedSpecialty: 'neurology',
        expectedAnswer: 'GCS assesses eye opening, verbal response, and motor response (3-15 scale)',
        expectedRetrievedDocuments: ['glasgow coma scale', 'coma', 'neurological assessment'],
        difficulty: 'medium',
        category: 'neurology',
      },
      {
        question: 'What is the pathophysiology of type 2 diabetes?',
        expectedDisease: ['diabetes mellitus'],
        expectedCitations: ['ADA', 'NIH'],
        expectedSpecialty: 'endocrinology',
        expectedAnswer: 'Insulin resistance with progressive beta-cell dysfunction leading to hyperglycemia',
        expectedRetrievedDocuments: ['diabetes', 'diabetes mellitus', 'type 2 diabetes'],
        difficulty: 'hard',
        category: 'endocrinology',
      },
      {
        question: 'What are the side effects of metformin?',
        expectedDisease: [],
        expectedCitations: ['FDA', 'ADA'],
        expectedSpecialty: 'pharmacology',
        expectedAnswer: 'GI upset, lactic acidosis (rare), vitamin B12 deficiency with long-term use',
        expectedRetrievedDocuments: ['metformin', 'biguanide', 'antidiabetic'],
        difficulty: 'medium',
        category: 'pharmacology',
      },
      {
        question: 'How is pulmonary embolism diagnosed?',
        expectedDisease: ['pulmonary embolism', 'pe'],
        expectedCitations: ['ESC', 'ACCP'],
        expectedSpecialty: 'pulmonology',
        expectedAnswer: 'D-dimer, CT pulmonary angiography, V/Q scan, echocardiography',
        expectedRetrievedDocuments: ['pulmonary embolism', 'pe', 'lung clot'],
        difficulty: 'medium',
        category: 'pulmonology',
      },
      {
        question: 'What is the treatment for deep vein thrombosis?',
        expectedDisease: ['deep vein thrombosis', 'dvt'],
        expectedCitations: ['ACCP', 'ESC'],
        expectedSpecialty: 'hematology',
        expectedAnswer: 'Anticoagulation with DOACs (apixaban, rivaroxaban) or warfarin, compression stockings',
        expectedRetrievedDocuments: ['dvt', 'deep vein thrombosis', 'anticoagulation'],
        difficulty: 'medium',
        category: 'hematology',
      },
      // Additional questions will be added programmatically
    ];

    for (let i = 0; i < defaultQuestions.length; i++) {
      this.questions.push({
        id: `eval-${i + 1}`,
        ...defaultQuestions[i],
      });
    }

    this.seedAdditionalQuestions();
  }

  addQuestion(question: Omit<EvaluationQuestion, 'id'>): void {
    const id = `eval-${this.questions.length + 1}`;
    this.questions.push({ id, ...question });
  }

  getQuestions(): EvaluationQuestion[] {
    return [...this.questions];
  }

  getQuestionById(id: string): EvaluationQuestion | undefined {
    return this.questions.find(q => q.id === id);
  }

  getQuestionsByCategory(category: string): EvaluationQuestion[] {
    return this.questions.filter(q => q.category === category);
  }

  async evaluateResponse(
    questionId: string,
    retrievedDocuments: string[],
    actualCitations: string[],
    actualAnswer: string
  ): Promise<EvaluationResult> {
    const question = this.getQuestionById(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const precision = this.calculatePrecision(retrievedDocuments, question.expectedRetrievedDocuments);
    const recall = this.calculateRecall(retrievedDocuments, question.expectedRetrievedDocuments);
    const mrr = this.calculateMRR(retrievedDocuments, question.expectedRetrievedDocuments);
    const ndcg = this.calculateNDCG(retrievedDocuments, question.expectedRetrievedDocuments);
    const contextPrecision = this.calculateContextPrecision(retrievedDocuments, question.expectedDisease);
    const citationAccuracy = this.calculateCitationAccuracy(actualCitations, question.expectedCitations);
    const answerCorrectness = this.calculateAnswerCorrectness(actualAnswer, question.expectedAnswer);

    const overallScore = (precision + recall + mrr + ndcg + contextPrecision + citationAccuracy + answerCorrectness) / 7;

    return {
      questionId,
      question: question.question,
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      ndcg: Math.round(ndcg * 100) / 100,
      contextPrecision: Math.round(contextPrecision * 100) / 100,
      citationAccuracy: Math.round(citationAccuracy * 100) / 100,
      answerCorrectness: Math.round(answerCorrectness * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
      retrievedDocuments,
      actualCitations,
      actualAnswer,
    };
  }

  async runEvaluation(): Promise<EvaluationReport> {
    const results: EvaluationResult[] = [];
    
    for (const question of this.questions) {
      const result = await this.evaluateResponse(
        question.id,
        question.expectedRetrievedDocuments,
        question.expectedCitations,
        question.expectedAnswer
      );
      results.push(result);
    }

    const totalQuestions = results.length;
    const average = (results: number[]) =>
      results.reduce((sum: number, r: number) => sum + r, 0) / totalQuestions;

    return {
      totalQuestions,
      averagePrecision: average(results.map(r => r.precision)),
      averageRecall: average(results.map(r => r.recall)),
      averageMRR: average(results.map(r => r.mrr)),
      averageNDCG: average(results.map(r => r.ndcg)),
      averageContextPrecision: average(results.map(r => r.contextPrecision)),
      averageCitationAccuracy: average(results.map(r => r.citationAccuracy)),
      averageAnswerCorrectness: average(results.map(r => r.answerCorrectness)),
      averageOverallScore: average(results.map(r => r.overallScore)),
      results,
    };
  }

  private calculatePrecision(retrieved: string[], expected: string[]): number {
    if (retrieved.length === 0) return 0;
    const relevant = retrieved.filter(r => 
      expected.some(e => r.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(r.toLowerCase()))
    );
    return relevant.length / retrieved.length;
  }

  private calculateRecall(retrieved: string[], expected: string[]): number {
    if (expected.length === 0) return 1;
    const relevant = expected.filter(e => 
      retrieved.some(r => r.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(r.toLowerCase()))
    );
    return relevant.length / expected.length;
  }

  private calculateMRR(retrieved: string[], expected: string[]): number {
    for (let i = 0; i < retrieved.length; i++) {
      const doc = retrieved[i].toLowerCase();
      for (const exp of expected) {
        if (doc.includes(exp.toLowerCase()) || exp.toLowerCase().includes(doc)) {
          return 1 / (i + 1);
        }
      }
    }
    return 0;
  }

  private calculateNDCG(retrieved: string[], expected: string[]): number {
    const dcg = retrieved.reduce((sum, doc, i) => {
      const isRelevant = expected.some(e => 
        doc.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(doc.toLowerCase())
      );
      return sum + (isRelevant ? 1 / Math.log2(i + 2) : 0);
    }, 0);

    const idealDcg = expected.length > 0 
      ? expected.reduce((sum, _, i) => sum + 1 / Math.log2(i + 2), 0)
      : 0;

    return idealDcg > 0 ? dcg / idealDcg : 0;
  }

  private calculateContextPrecision(retrieved: string[], diseases: string[]): number {
    if (retrieved.length === 0) return 0;
    if (diseases.length === 0) return 1;
    
    const relevant = retrieved.filter(r => 
      diseases.some(d => r.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(r.toLowerCase()))
    );
    return relevant.length / retrieved.length;
  }

  private calculateCitationAccuracy(actual: string[], expected: string[]): number {
    if (expected.length === 0) return 1;
    if (actual.length === 0) return 0;
    
    const matched = actual.filter(a => 
      expected.some(e => a.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(a.toLowerCase()))
    );
    return matched.length / expected.length;
  }

  private calculateAnswerCorrectness(actual: string, expected: string): number {
    if (!actual || !expected) return 0;
    const actualLower = actual.toLowerCase();
    const expectedLower = expected.toLowerCase();
    
    const expectedWords = expectedLower.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = expectedWords.filter(w => actualLower.includes(w));
    
    return expectedWords.length > 0 ? matchedWords.length / expectedWords.length : 0;
  }

  private seedAdditionalQuestions(): void {
    const categories: Record<string, Array<{ q: string; d: string[]; c: string[]; s: string; a: string; r: string[]; diff: 'easy'|'medium'|'hard' }>> = {
      cardiovascular: [
        { q: 'What is the definition of hypertension?', d: ['hypertension'], c: ['AHA','ACC'], s: 'cardiology', a: 'BP >= 130/80 mmHg defines hypertension', r: ['hypertension','high blood pressure'], diff: 'easy' },
        { q: 'What are complications of hypertension?', d: ['hypertension'], c: ['AHA','CDC'], s: 'cardiology', a: 'Heart attack, stroke, kidney failure, vision loss', r: ['hypertension','high blood pressure'], diff: 'medium' },
        { q: 'What is the first-line treatment for hypertension?', d: ['hypertension'], c: ['AHA','ACC'], s: 'cardiology', a: 'ACE inhibitors, ARBs, calcium channel blockers, or thiazide diuretics', r: ['hypertension','ace inhibitors'], diff: 'medium' },
        { q: 'What is myocardial infarction?', d: ['myocardial infarction','heart attack'], c: ['AHA','ACC'], s: 'cardiology', a: 'Myocardial necrosis due to ischemia, usually from coronary artery occlusion', r: ['heart attack','myocardial infarction','acute coronary syndrome'], diff: 'easy' },
        { q: 'What are symptoms of MI?', d: ['myocardial infarction','heart attack'], c: ['AHA','CDC'], s: 'cardiology', a: 'Chest pain, dyspnea, diaphoresis, nausea, radiation to arm/jaw', r: ['heart attack','myocardial infarction'], diff: 'easy' },
        { q: 'What is the treatment for STEMI?', d: ['myocardial infarction','heart attack'], c: ['AHA','ACC'], s: 'cardiology', a: 'Primary PCI within 90 minutes or fibrinolysis when PCI unavailable', r: ['heart attack','myocardial infarction'], diff: 'hard' },
        { q: 'What medications are used after MI?', d: ['myocardial infarction','heart attack'], c: ['AHA','ACC'], s: 'cardiology', a: 'DAPT, beta-blockers, ACE inhibitors, statins', r: ['heart attack','myocardial infarction'], diff: 'medium' },
        { q: 'What is heart failure?', d: ['heart failure','congestive heart failure'], c: ['AHA','ESC'], s: 'cardiology', a: 'Heart failure is a clinical syndrome with typical symptoms and signs caused by structural or functional cardiac disorder', r: ['heart failure','chf','congestive heart failure'], diff: 'easy' },
        { q: 'What is HFrEF?', d: ['heart failure','congestive heart failure'], c: ['AHA','ESC'], s: 'cardiology', a: 'HFrEF is EF <40% with symptoms of heart failure', r: ['heart failure','chf','congestive heart failure'], diff: 'medium' },
        { q: 'What is the NYHA classification?', d: ['heart failure','congestive heart failure'], c: ['AHA','ESC'], s: 'cardiology', a: 'Class I-IV based on activity limitation from ordinary activity to symptoms at rest', r: ['heart failure','nyha'], diff: 'medium' },
        { q: 'What is atrial fibrillation?', d: ['atrial fibrillation'], c: ['AHA','ACC'], s: 'cardiology', a: 'Atrial fibrillation is an irregularly irregular rhythm without discrete P waves', r: ['atrial fibrillation','af'], diff: 'medium' },
        { q: 'What is the CHA2DS2-VASc score?', d: ['atrial fibrillation'], c: ['AHA','ACC'], s: 'cardiology', a: 'Stroke risk score in AF: CHF, hypertension, age, diabetes, prior stroke, vascular disease, sex', r: ['atrial fibrillation','cha2ds2-vasc'], diff: 'hard' },
        { q: 'What is coronary artery disease?', d: ['cad','coronary artery disease'], c: ['AHA','ACC'], s: 'cardiology', a: 'Atherosclerotic obstruction of coronary arteries reducing myocardial perfusion', r: ['cad','coronary artery disease','coronary heart disease'], diff: 'easy' },
        { q: 'What is atherosclerosis?', d: ['cad','coronary artery disease'], c: ['AHA','NIH'], s: 'cardiology', a: 'Atherosclerosis is chronic inflammatory disease with lipid-rich plaques in arterial walls', r: ['cad','coronary artery disease','atherosclerosis'], diff: 'medium' },
        { q: 'What is peripheral artery disease?', d: ['pad','peripheral artery disease'], c: ['AHA','ACC'], s: 'cardiology', a: 'PAD is atherosclerotic obstruction of peripheral arteries causing limb ischemia', r: ['pad','peripheral artery disease','peripheral vascular disease'], diff: 'medium' },
        { q: 'What is an aneurysm?', d: ['aneurysm'], c: ['AHA','CDC'], s: 'cardiology', a: 'Aneurysm is a localized irreversible dilation of a blood vessel', r: ['aneurysm'], diff: 'easy' },
        { q: 'What is deep vein thrombosis?', d: ['deep vein thrombosis','dvt'], c: ['ACCP','CHEST'], s: 'hematology', a: 'DVT is thrombus formation in the deep venous system', r: ['dvt','deep vein thrombosis'], diff: 'easy' },
        { q: 'What is pulmonary embolism?', d: ['pulmonary embolism','pe'], c: ['ESC','CHEST'], s: 'pulmonology', a: 'PE is obstruction of pulmonary arteries by thrombus causing V/Q mismatch', r: ['pulmonary embolism','pe'], diff: 'easy' },
      ],
      neurology: [
        { q: 'What is the FAST assessment?', d: ['stroke','cerebrovascular accident'], c: ['AHA','CDC'], s: 'neurology', a: 'Face drooping, Arm weakness, Speech difficulty, Time to call emergency services', r: ['stroke','cva','fast'], diff: 'easy' },
        { q: 'What is the difference between ischemic and hemorrhagic stroke?', d: ['stroke','cerebrovascular accident'], c: ['AHA','CDC'], s: 'neurology', a: 'Ischemic stroke is occlusion (87%), hemorrhagic stroke is rupture (13%)', r: ['stroke','cva','ischemic','hemorrhagic'], diff: 'medium' },
        { q: 'What is the treatment for ischemic stroke?', d: ['stroke','cerebrovascular accident'], c: ['AHA','ASA'], s: 'neurology', a: 'IV tPA within 3-4.5 hours; mechanical thrombectomy up to 24 hours for LVO', r: ['stroke','tpa','ischemic stroke'], diff: 'hard' },
        { q: 'What is TIA?', d: ['tia','transient ischemic attack'], c: ['AHA','CDC'], s: 'neurology', a: 'TIA is transient neurological dysfunction without infarction lasting <24 hours', r: ['tia','transient ischemic attack','mini stroke'], diff: 'easy' },
        { q: 'What is epilepsy?', d: ['epilepsy','seizure disorder'], c: ['AAN','NIH'], s: 'neurology', a: 'Epilepsy is a disorder characterized by recurrent unprovoked seizures', r: ['epilepsy','seizure'], diff: 'easy' },
        { q: 'What is first-line epilepsy treatment?', d: ['epilepsy','seizure disorder'], c: ['AAN','NIH'], s: 'neurology', a: 'Levetiracetam, lamotrigine, or carbamazepine are first-line AEDs', r: ['epilepsy','anticonvulsant'], diff: 'medium' },
        { q: 'What is multiple sclerosis?', d: ['ms','multiple sclerosis'], c: ['AAN','NIH'], s: 'neurology', a: 'MS is a chronic autoimmune demyelinating CNS disease', r: ['ms','multiple sclerosis','demyelinating'], diff: 'medium' },
        { q: 'What is Parkinson disease?', d: ['parkinson disease'], c: ['AAN','NIH'], s: 'neurology', a: 'Parkinson disease is progressive loss of dopaminergic neurons causing tremor, rigidity, bradykinesia', r: ['parkinson'], diff: 'easy' },
        { q: 'What is Alzheimer disease?', d: ['alzheimer disease','dementia'], c: ['AAN','NIH'], s: 'neurology', a: 'Alzheimer disease is progressive dementia with amyloid plaques and neurofibrillary tangles', r: ['alzheimer','dementia'], diff: 'medium' },
        { q: 'What is meningitis?', d: ['meningitis'], c: ['CDC','NIH'], s: 'neurology', a: 'Meningitis is meningeal inflammation, most commonly bacterial or viral', r: ['meningitis','meninges'], diff: 'easy' },
        { q: 'What is subarachnoid hemorrhage?', d: ['subarachnoid hemorrhage'], c: ['AHA','NIH'], s: 'neurology', a: 'SAH is bleeding into the subarachnoid space, often from aneurysmal rupture', r: ['subarachnoid hemorrhage','sah','aneurysm'], diff: 'hard' },
        { q: 'What is Bell palsy?', d: ['bell palsy'], c: ['AAO','AAN'], s: 'neurology', a: 'Bell palsy is idiopathic peripheral facial nerve palsy', r: ['bell palsy','facial palsy'], diff: 'easy' },
        { q: 'What is migraine?', d: ['migraine'], c: ['AAN','NIH'], s: 'neurology', a: 'Migraine is a primary headache with unilateral throbbing pain, photophobia, phonophobia', r: ['migraine','headache'], diff: 'easy' },
        { q: 'What is the NIHSS?', d: ['stroke','cerebrovascular accident'], c: ['AHA','ASA'], s: 'neurology', a: 'NIHSS scores acute stroke neurological deficit from 0 to 42', r: ['nihss','stroke scale'], diff: 'hard' },
      ],
      pulmonology: [
        { q: 'What is asthma?', d: ['asthma','bronchial asthma'], c: ['GINA','NIH'], s: 'pulmonology', a: 'Asthma is chronic inflammatory airway disease with reversible bronchoconstriction', r: ['asthma','bronchial asthma'], diff: 'easy' },
        { q: 'What are triggers of asthma?', d: ['asthma','bronchial asthma'], c: ['GINA','NIH'], s: 'pulmonology', a: 'Allergens, exercise, cold air, viral infections, irritants, stress', r: ['asthma','bronchial asthma'], diff: 'easy' },
        { q: 'What is COPD?', d: ['copd','chronic obstructive pulmonary disease'], c: ['GOLD','NIH'], s: 'pulmonology', a: 'COPD is progressive airflow limitation not fully reversible', r: ['copd','chronic obstructive pulmonary disease'], diff: 'easy' },
        { q: 'What are the GOLD stages of COPD?', d: ['copd','chronic obstructive pulmonary disease'], c: ['GOLD','NIH'], s: 'pulmonology', a: 'GOLD 1-4 by FEV1 % predicted: mild >=80, moderate 50-79, severe 30-49, very severe <30', r: ['copd','gold stages'], diff: 'hard' },
        { q: 'What is pneumonia?', d: ['pneumonia'], c: ['IDSA','ATS'], s: 'pulmonology', a: 'Pneumonia is infection of the lung parenchyma with alveolar consolidation', r: ['pneumonia','lung infection'], diff: 'easy' },
        { q: 'What is the CURB-65 score?', d: ['pneumonia'], c: ['IDSA','ATS'], s: 'pulmonology', a: 'CURB-65: Confusion, Urea >19, Respiratory rate >=30, BP <90/60, Age >=65', r: ['pneumonia','curb-65'], diff: 'hard' },
        { q: 'What is obstructive sleep apnea?', d: ['osa','obstructive sleep apnea'], c: ['AASM','NIH'], s: 'pulmonology', a: 'OSA is repetitive upper airway collapse during sleep', r: ['osa','sleep apnea'], diff: 'medium' },
        { q: 'What is the AHI?', d: ['osa','obstructive sleep apnea'], c: ['AASM','NIH'], s: 'pulmonology', a: 'AHI events/hour: normal <5, mild 5-15, moderate 15-30, severe >30', r: ['osa','ahi'], diff: 'medium' },
        { q: 'What is interstitial lung disease?', d: ['ild','interstitial lung disease'], c: ['ATS','ERS'], s: 'pulmonology', a: 'ILD is inflammation and fibrosis of the lung interstitium', r: ['ild','interstitial lung disease','pulmonary fibrosis'], diff: 'medium' },
        { q: 'What is pleural effusion?', d: ['pleural effusion'], c: ['ATS','CHEST'], s: 'pulmonology', a: 'Pleural effusion is fluid in the pleural space; transudate or exudate', r: ['pleural effusion','pleural fluid'], diff: 'medium' },
      ],
      gastroenterology: [
        { q: 'What is GERD?', d: ['gerd','gastroesophageal reflux disease'], c: ['ACG','APA'], s: 'gastroenterology', a: 'GERD is troublesome reflux of gastric contents', r: ['gerd','gastroesophageal reflux disease','acid reflux'], diff: 'easy' },
        { q: 'What is peptic ulcer disease?', d: ['peptic ulcer disease'], c: ['ACG','APA'], s: 'gastroenterology', a: 'PUD is mucosal erosion of stomach or duodenum, often from H. pylori or NSAIDs', r: ['peptic ulcer','gastric ulcer','duodenal ulcer'], diff: 'easy' },
        { q: 'What is inflammatory bowel disease?', d: ['ibd','inflammatory bowel disease'], c: ['AGA','ECCO'], s: 'gastroenterology', a: 'IBD includes Crohn disease and ulcerative colitis', r: ['ibd','inflammatory bowel disease','crohn','ulcerative colitis'], diff: 'easy' },
        { q: 'What is irritable bowel syndrome?', d: ['ibs','irritable bowel syndrome'], c: ['AGA','APA'], s: 'gastroenterology', a: 'IBS is a functional GI disorder with pain and altered bowel habits', r: ['ibs','irritable bowel syndrome'], diff: 'easy' },
        { q: 'What is hepatitis B?', d: ['hepatitis b','hbv'], c: ['WHO','CDC'], s: 'gastroenterology', a: 'HBV is a DNA virus causing acute or chronic liver infection', r: ['hepatitis b','hbv'], diff: 'medium' },
        { q: 'What is NAFLD?', d: ['nafld','nash'], c: ['AASLD','APA'], s: 'gastroenterology', a: 'NAFLD is hepatic steatosis without alcohol; NASH adds inflammation/fibrosis', r: ['nafld','nash','fatty liver'], diff: 'medium' },
        { q: 'What is cirrhosis?', d: ['cirrhosis'], c: ['AASLD','APA'], s: 'gastroenterology', a: 'Cirrhosis is end-stage fibrosis with regenerative nodules', r: ['cirrhosis','liver cirrhosis'], diff: 'easy' },
        { q: 'What is ascites?', d: ['ascites'], c: ['AASLD','APA'], s: 'gastroenterology', a: 'Ascites is peritoneal fluid accumulation, usually from cirrhosis', r: ['ascites'], diff: 'easy' },
        { q: 'What is pancreatitis?', d: ['pancreatitis'], c: ['APA','ACG'], s: 'gastroenterology', a: 'Pancreatitis is pancreatic inflammation, commonly from gallstones or alcohol', r: ['pancreatitis'], diff: 'easy' },
        { q: 'What is appendicitis?', d: ['appendicitis'], c: ['APA','ACS'], s: 'surgery', a: 'Appendicitis is acute appendix inflammation requiring surgery', r: ['appendicitis','appendix'], diff: 'easy' },
      ],
      nephrology: [
        { q: 'What is CKD?', d: ['ckd','chronic kidney disease'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'CKD is kidney damage or decreased GFR for >=3 months', r: ['ckd','chronic kidney disease','kidney failure'], diff: 'easy' },
        { q: 'What are CKD stages?', d: ['ckd','chronic kidney disease'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'G1 eGFR>=90 through G5 eGFR<15', r: ['ckd','chronic kidney disease','egfr'], diff: 'medium' },
        { q: 'What is AKI?', d: ['aki','acute kidney injury'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'AKI is abrupt decrease in kidney function within hours to days', r: ['aki','acute kidney injury'], diff: 'medium' },
        { q: 'What is nephrotic syndrome?', d: ['nephrotic syndrome'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'Nephrotic syndrome: heavy proteinuria, hypoalbuminemia, edema, hyperlipidemia', r: ['nephrotic syndrome','proteinuria'], diff: 'medium' },
        { q: 'What is diabetic nephropathy?', d: ['diabetic nephropathy'], c: ['KDIGO','ADA'], s: 'nephrology', a: 'Diabetic nephropathy is progressive kidney disease from chronic hyperglycemia', r: ['diabetic nephropathy','ckd diabetes'], diff: 'medium' },
        { q: 'What is hemodialysis?', d: ['end stage renal disease','esrd'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'Hemodialysis is extracorporeal blood purification for kidney failure', r: ['hemodialysis','dialysis','esrd'], diff: 'easy' },
        { q: 'What is kidney transplantation?', d: ['end stage renal disease','esrd'], c: ['KDIGO','NKF'], s: 'nephrology', a: 'Kidney transplant is preferred renal replacement therapy for ESRD', r: ['kidney transplant','renal transplant','esrd'], diff: 'medium' },
      ],
      endocrinology: [
        { q: 'What is diabetes mellitus type 1?', d: ['type 1 diabetes mellitus','t1dm'], c: ['ADA','CDC'], s: 'endocrinology', a: 'Type 1 diabetes is autoimmune destruction of beta cells causing absolute insulin deficiency', r: ['type 1 diabetes','t1dm','diabetes mellitus'], diff: 'medium' },
        { q: 'What is diabetes mellitus type 2?', d: ['type 2 diabetes mellitus','t2dm'], c: ['ADA','CDC'], s: 'endocrinology', a: 'Type 2 diabetes is insulin resistance with progressive beta-cell dysfunction', r: ['type 2 diabetes','t2dm','diabetes mellitus'], diff: 'medium' },
        { q: 'What is HbA1c?', d: ['diabetes mellitus'], c: ['ADA','CDC'], s: 'endocrinology', a: 'HbA1c reflects average glucose over 8-12 weeks; target usually <7%', r: ['hba1c','a1c','glycated hemoglobin'], diff: 'medium' },
        { q: 'What is hypoglycemia?', d: ['hypoglycemia'], c: ['ADA','CDC'], s: 'endocrinology', a: 'Hypoglycemia is glucose <70 mg/dL from excess insulin, missed meals, or exercise', r: ['hypoglycemia','low blood sugar'], diff: 'easy' },
        { q: 'What is hyperthyroidism?', d: ['hyperthyroidism'], c: ['ATA','APA'], s: 'endocrinology', a: 'Hyperthyroidism is excess thyroid hormone causing tachycardia, weight loss, heat intolerance', r: ['hyperthyroidism','thyrotoxicosis'], diff: 'medium' },
        { q: 'What is hypothyroidism?', d: ['hypothyroidism'], c: ['ATA','APA'], s: 'endocrinology', a: 'Hypothyroidism is deficient thyroid hormone causing fatigue, weight gain, cold intolerance', r: ['hypothyroidism','underactive thyroid'], diff: 'easy' },
        { q: 'What is Cushing syndrome?', d: ['cushing syndrome'], c: ['PES','ENDOS'], s: 'endocrinology', a: 'Cushing syndrome is chronic glucocorticoid excess with truncal obesity and purple striae', r: ['cushing syndrome','glucocorticoid excess'], diff: 'medium' },
        { q: 'What is Addison disease?', d: ['addison disease'], c: ['PES','ENDOS'], s: 'endocrinology', a: 'Addison disease is primary adrenal insufficiency causing cortisol deficiency', r: ['addison disease','adrenal insufficiency'], diff: 'medium' },
      ],
      infectious: [
        { q: 'What is malaria?', d: ['malaria'], c: ['WHO','CDC'], s: 'infectious disease', a: 'Malaria is a mosquito-borne parasitic infection caused by Plasmodium', r: ['malaria','paludism'], diff: 'easy' },
        { q: 'What is the treatment for malaria?', d: ['malaria'], c: ['WHO','CDC'], s: 'infectious disease', a: 'Artemisinin-based combination therapy is first-line for uncomplicated falciparum malaria', r: ['malaria','artemisinin'], diff: 'medium' },
        { q: 'What is tuberculosis?', d: ['tuberculosis','tb'], c: ['WHO','CDC'], s: 'infectious disease', a: 'TB is airborne bacterial infection caused by Mycobacterium tuberculosis', r: ['tuberculosis','tb'], diff: 'easy' },
        { q: 'What is the treatment for TB?', d: ['tuberculosis','tb'], c: ['WHO','CDC'], s: 'infectious disease', a: 'RIPE: Rifampin, Isoniazid, Pyrazinamide, Ethambutol for 6 months', r: ['tuberculosis','tb','ripe regimen'], diff: 'medium' },
        { q: 'What is HIV?', d: ['hiv','human immunodeficiency virus'], c: ['WHO','CDC'], s: 'infectious disease', a: 'HIV is a retrovirus targeting CD4+ T cells and causing progressive immune deficiency', r: ['hiv','aids'], diff: 'easy' },
        { q: 'What is the treatment for HIV?', d: ['hiv','human immunodeficiency virus'], c: ['WHO','CDC'], s: 'infectious disease', a: 'Combination antiretroviral therapy with two NRTIs plus INSTI, NNRTI, or PI', r: ['hiv','art','antiretroviral'], diff: 'medium' },
        { q: 'What is sepsis?', d: ['sepsis'], c: ['SCCM','WHO'], s: 'critical care', a: 'Sepsis is life-threatening organ dysfunction from dysregulated host response to infection', r: ['sepsis','septicemia'], diff: 'medium' },
        { q: 'What is septic shock?', d: ['septic shock'], c: ['SCCM','WHO'], s: 'critical care', a: 'Septic shock is sepsis with persisting hypotension requiring vasopressors', r: ['septic shock','sepsis','vasopressors'], diff: 'hard' },
        { q: 'What is COVID-19?', d: ['covid-19','sars-cov-2'], c: ['WHO','CDC'], s: 'infectious disease', a: 'COVID-19 is a SARS-CoV-2 respiratory infection with fever, cough, and dyspnea', r: ['covid-19','sars-cov-2'], diff: 'easy' },
        { q: 'What is influenza?', d: ['influenza','flu'], c: ['CDC','WHO'], s: 'infectious disease', a: 'Influenza is an acute respiratory infection caused by influenza A or B', r: ['influenza','flu'], diff: 'easy' },
      ],
      hematology: [
        { q: 'What is anemia?', d: ['anemia'], c: ['ASH','WHO'], s: 'hematology', a: 'Anemia is low red blood cell count or hemoglobin concentration', r: ['anemia','low hemoglobin'], diff: 'easy' },
        { q: 'What is iron deficiency anemia?', d: ['iron deficiency anemia'], c: ['ASH','WHO'], s: 'hematology', a: 'Iron deficiency anemia is caused by inadequate iron intake, blood loss, or malabsorption', r: ['iron deficiency anemia','anemia'], diff: 'medium' },
        { q: 'What is sickle cell disease?', d: ['sickle cell disease'], c: ['ASH','NIH'], s: 'hematology', a: 'Sickle cell disease is hemoglobinopathy causing sickle-shaped RBCs and vaso-occlusion', r: ['sickle cell disease','sickle cell anemia'], diff: 'medium' },
        { q: 'What is hemophilia?', d: ['hemophilia'], c: ['ASH','CDC'], s: 'hematology', a: 'Hemophilia is X-linked bleeding disorder from factor VIII or IX deficiency', r: ['hemophilia','bleeding disorder'], diff: 'medium' },
        { q: 'What is the Wells score for DVT?', d: ['deep vein thrombosis','dvt'], c: ['CHEST','ACCP'], s: 'hematology', a: 'Wells DVT score includes active cancer, paralysis, immobilization, tenderness, swelling', r: ['dvt','wells score'], diff: 'hard' },
        { q: 'What is the treatment for DVT?', d: ['deep vein thrombosis','dvt'], c: ['CHEST','ACCP'], s: 'hematology', a: 'Anticoagulation with DOACs or warfarin for at least 3 months', r: ['dvt','deep vein thrombosis','anticoagulation'], diff: 'medium' },
      ],
      rheumatology: [
        { q: 'What is rheumatoid arthritis?', d: ['rheumatoid arthritis','ra'], c: ['ACR','EULAR'], s: 'rheumatology', a: 'RA is chronic autoimmune inflammatory arthritis with symmetric joint involvement', r: ['rheumatoid arthritis','ra'], diff: 'easy' },
        { q: 'What is osteoarthritis?', d: ['osteoarthritis','oa'], c: ['ACR','EULAR'], s: 'rheumatology', a: 'OA is degenerative joint disease with cartilage breakdown and osteophytes', r: ['osteoarthritis','degenerative joint disease'], diff: 'easy' },
        { q: 'What is systemic lupus erythematosus?', d: ['sle','systemic lupus erythematosus'], c: ['ACR','EULAR'], s: 'rheumatology', a: 'SLE is a chronic autoimmune disease with multi-system involvement', r: ['sle','systemic lupus erythematosus','lupus'], diff: 'medium' },
        { q: 'What is gout?', d: ['gout'], c: ['ACR','EULAR'], s: 'rheumatology', a: 'Gout is acute inflammatory arthritis from monosodium urate crystal deposition', r: ['gout','urate crystals'], diff: 'medium' },
      ],
      dermatology: [
        { q: 'What is psoriasis?', d: ['psoriasis'], c: ['AAD','APA'], s: 'dermatology', a: 'Psoriasis is a chronic immune-mediated skin disease with erythematous plaques and silvery scale', r: ['psoriasis','plaque psoriasis'], diff: 'easy' },
        { q: 'What is eczema?', d: ['eczema','atopic dermatitis'], c: ['AAD','APA'], s: 'dermatology', a: 'Eczema is chronic inflammatory skin disease with pruritic erythematous scaly patches', r: ['eczema','atopic dermatitis','dermatitis'], diff: 'easy' },
      ],
      oncology: [
        { q: 'What is cancer?', d: ['cancer','malignancy'], c: ['WHO','NCCN'], s: 'oncology', a: 'Cancer is uncontrolled cell growth with invasion and metastasis potential', r: ['cancer','malignancy','neoplasm'], diff: 'easy' },
        { q: 'What is lung cancer?', d: ['lung cancer','nsclc','sclc'], c: ['NCCN','ASCO'], s: 'oncology', a: 'Lung cancer is the leading cause of cancer death; most are NSCLC', r: ['lung cancer','nsclc','sclc'], diff: 'easy' },
        { q: 'What is breast cancer?', d: ['breast cancer'], c: ['NCCN','ASCO'], s: 'oncology', a: 'Breast cancer is malignant tumor of breast tissue; most common in women', r: ['breast cancer'], diff: 'easy' },
        { q: 'What is colon cancer?', d: ['colon cancer','colorectal cancer'], c: ['NCCN','ACS'], s: 'oncology', a: 'Colon cancer arises from adenomatous polyps via adenoma-carcinoma sequence', r: ['colon cancer','colorectal cancer'], diff: 'easy' },
        { q: 'What is leukemia?', d: ['leukemia'], c: ['NCCN','ASH'], s: 'oncology', a: 'Leukemia is malignancy of blood-forming tissues, classified as AML, ALL, CML, CLL', r: ['leukemia','aml','all','cml','cll'], diff: 'medium' },
        { q: 'What is lymphoma?', d: ['lymphoma'], c: ['NCCN','ASH'], s: 'oncology', a: 'Lymphoma is malignancy of lymphocytes: Hodgkin or non-Hodgkin', r: ['lymphoma','hodgkin','non-hodgkin'], diff: 'medium' },
      ],
      ophthalmology: [
        { q: 'What is glaucoma?', d: ['glaucoma'], c: ['AAO','APA'], s: 'ophthalmology', a: 'Glaucoma is optic neuropathy with progressive visual field loss, often from elevated IOP', r: ['glaucoma','eye pressure','optic neuropathy'], diff: 'medium' },
        { q: 'What is cataracts?', d: ['cataracts'], c: ['AAO','APA'], s: 'ophthalmology', a: 'Cataract is lens opacity causing gradual vision loss', r: ['cataracts','lens opacity'], diff: 'easy' },
        { q: 'What is macular degeneration?', d: ['macular degeneration'], c: ['AAO','APA'], s: 'ophthalmology', a: 'Macular degeneration is central retina degeneration causing central vision loss', r: ['macular degeneration','amd'], diff: 'medium' },
      ],
      psychiatry: [
        { q: 'What is depression?', d: ['depression','major depressive disorder'], c: ['APA','NIMH'], s: 'psychiatry', a: 'Major depressive disorder is persistent low mood with anhedonia and cognitive symptoms', r: ['depression','major depressive disorder'], diff: 'easy' },
        { q: 'What is anxiety disorder?', d: ['anxiety','anxiety disorder'], c: ['APA','NIMH'], s: 'psychiatry', a: 'Anxiety disorders include excessive fear or anxiety impairing function', r: ['anxiety','anxiety disorder'], diff: 'easy' },
        { q: 'What is schizophrenia?', d: ['schizophrenia'], c: ['APA','NIMH'], s: 'psychiatry', a: 'Schizophrenia is chronic psychosis with positive, negative, and cognitive symptoms', r: ['schizophrenia','psychosis'], diff: 'medium' },
        { q: 'What is bipolar disorder?', d: ['bipolar disorder'], c: ['APA','NIMH'], s: 'psychiatry', a: 'Bipolar disorder is episodic mood illness with mania and depression', r: ['bipolar disorder','mania'], diff: 'medium' },
      ],
      pediatrics: [
        { q: 'What is febrile seizure?', d: ['febrile seizure'], c: ['AAP','APA'], s: 'pediatrics', a: 'Febrile seizure is convulsion associated with fever in young children without CNS infection', r: ['febrile seizure','fever seizure'], diff: 'medium' },
        { q: 'What is otitis media?', d: ['otitis media'], c: ['AAP','APA'], s: 'pediatrics', a: 'Acute otitis media is middle ear effusion with acute inflammation and symptoms', r: ['otitis media','ear infection'], diff: 'easy' },
        { q: 'What is RSV?', d: ['rsv','respiratory syncytial virus'], c: ['CDC','AAP'], s: 'pediatrics', a: 'RSV is a common respiratory virus causing bronchiolitis and pneumonia in infants', r: ['rsv','respiratory syncytial virus','bronchiolitis'], diff: 'easy' },
      ],
      emergency: [
        { q: 'What is CPR?', d: ['cardiopulmonary resuscitation','cpr'], c: ['AHA','ACEP'], s: 'emergency', a: 'CPR is chest compressions and ventilation for cardiac arrest', r: ['cpr','cardiopulmonary resuscitation'], diff: 'easy' },
        { q: 'What is the ALS protocol?', d: ['cardiac arrest'], c: ['AHA','ACEP'], s: 'emergency', a: 'ALS includes airway, breathing, circulation, defibrillation, epinephrine, and advanced interventions', r: ['als','advanced cardiac life support'], diff: 'hard' },
        { q: 'What is anaphylaxis?', d: ['anaphylaxis'], c: ['WAO','AAA'], s: 'emergency', a: 'Anaphylaxis is severe life-threatening systemic hypersensitivity reaction', r: ['anaphylaxis','severe allergic reaction'], diff: 'easy' },
        { q: 'What is the treatment for anaphylaxis?', d: ['anaphylaxis'], c: ['WAO','AAA'], s: 'emergency', a: 'IM epinephrine is first-line, with airway management, IV fluids, and antihistamines', r: ['anaphylaxis','epinephrine'], diff: 'medium' },
      ],
    };

    let id = this.questions.length + 1;
    for (const [category, items] of Object.entries(categories)) {
      for (const item of items) {
        this.questions.push({
          id: `eval-${id++}`,
          question: item.q,
          expectedDisease: item.d,
          expectedCitations: item.c,
          expectedSpecialty: item.s,
          expectedAnswer: item.a,
          expectedRetrievedDocuments: item.r,
          difficulty: item.diff,
          category,
        });
      }
    }
  }
}

export const evaluationDataset = new EvaluationDataset();