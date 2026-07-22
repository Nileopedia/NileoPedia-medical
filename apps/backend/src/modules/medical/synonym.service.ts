export interface SynonymExpansion {
  originalQuery: string;
  expandedQuery: string;
  matchedSynonym: string | null;
  synonyms: string[];
}

export class MedicalSynonymService {
  private readonly synonymMap: Map<string, string[]> = new Map([
    ['hypertension', ['high blood pressure', 'htn', 'high bp', 'elevated blood pressure', 'arterial hypertension', 'systemic hypertension']],
    ['htn', ['hypertension', 'high blood pressure', 'high bp', 'elevated blood pressure']],
    ['high blood pressure', ['hypertension', 'htn', 'elevated blood pressure', 'high bp']],
    ['high bp', ['hypertension', 'htn', 'high blood pressure']],
    ['elevated blood pressure', ['hypertension', 'high blood pressure', 'htn']],
    ['arterial hypertension', ['hypertension', 'high blood pressure']],
    ['systemic hypertension', ['hypertension', 'high blood pressure']],
    ['heart attack', ['myocardial infarction', 'mi', 'cardiac arrest', 'acute coronary syndrome', 'coronary thrombosis']],
    ['myocardial infarction', ['heart attack', 'mi', 'acute coronary syndrome', 'coronary thrombosis']],
    ['mi', ['myocardial infarction', 'heart attack', 'acute coronary syndrome']],
    ['acute coronary syndrome', ['myocardial infarction', 'heart attack', 'mi', 'acs']],
    ['coronary thrombosis', ['myocardial infarction', 'heart attack', 'mi']],
    ['stroke', ['cerebrovascular accident', 'cva', 'brain attack', 'cerebral vascular accident', 'cerebrovascular insult', 'brain infarction']],
    ['cva', ['stroke', 'cerebrovascular accident', 'brain attack']],
    ['cerebrovascular accident', ['stroke', 'cva', 'brain attack']],
    ['cerebral vascular accident', ['stroke', 'cva', 'cerebrovascular accident']],
    ['cerebrovascular insult', ['stroke', 'cerebrovascular accident']],
    ['brain attack', ['stroke', 'cerebrovascular accident', 'cva']],
    ['brain infarction', ['stroke', 'cerebrovascular accident']],
    ['high blood sugar', ['diabetes mellitus', 'diabetes', 'hyperglycemia', 'high glucose', 'elevated blood glucose']],
    ['diabetes mellitus', ['diabetes', 'high blood sugar', 'hyperglycemia', 'high glucose', 'elevated blood glucose']],
    ['diabetes', ['diabetes mellitus', 'high blood sugar', 'hyperglycemia', 'high glucose']],
    ['hyperglycemia', ['high blood sugar', 'diabetes mellitus', 'diabetes', 'elevated blood glucose']],
    ['high glucose', ['high blood sugar', 'diabetes mellitus', 'diabetes', 'hyperglycemia']],
    ['elevated blood glucose', ['high blood sugar', 'diabetes mellitus', 'diabetes', 'hyperglycemia']],
    ['blood pressure', ['hypertension', 'high blood pressure', 'htn', 'bp']],
    ['bp', ['blood pressure', 'hypertension', 'high blood pressure']],
    ['asthma', ['bronchial asthma', 'reactive airway disease', 'asthma attack', 'bronchial hyperreactivity']],
    ['bronchial asthma', ['asthma', 'reactive airway disease']],
    ['reactive airway disease', ['asthma', 'bronchial asthma']],
    ['asthma attack', ['asthma', 'bronchial asthma']],
    ['copd', ['chronic obstructive pulmonary disease', 'copd']],
    ['chronic obstructive pulmonary disease', ['copd', 'chronic bronchitis', 'emphysema']],
    ['chronic bronchitis', ['copd', 'chronic obstructive pulmonary disease']],
    ['emphysema', ['copd', 'chronic obstructive pulmonary disease']],
    ['malaria', ['paludism', 'malarial fever', 'plasmodium infection']],
    ['tuberculosis', ['tb', 'consumption', 'pulmonary tuberculosis']],
    ['tb', ['tuberculosis', 'consumption', 'pulmonary tuberculosis']],
    ['hiv', ['human immunodeficiency virus', 'aids', 'acquired immunodeficiency syndrome']],
    ['aids', ['hiv', 'human immunodeficiency virus', 'acquired immunodeficiency syndrome']],
    ['heart failure', ['congestive heart failure', 'chf', 'cardiac failure', 'heart dysfunction']],
    ['chf', ['heart failure', 'congestive heart failure', 'cardiac failure']],
    ['congestive heart failure', ['heart failure', 'chf', 'cardiac failure']],
    ['cancer', ['malignancy', 'malignant tumor', 'neoplasm', 'carcinoma']],
    ['pneumonia', ['lung infection', 'pulmonary infection', 'lower respiratory tract infection']],
    ['ckd', ['chronic kidney disease', 'kidney failure', 'renal failure', 'renal insufficiency']],
    ['chronic kidney disease', ['ckd', 'kidney failure', 'renal failure']],
    ['kidney failure', ['renal failure', 'ckd', 'chronic kidney disease']],
    ['renal failure', ['kidney failure', 'ckd', 'chronic kidney disease']],
    ['myocardial infarction', ['heart attack', 'mi']],
    ['acute coronary syndrome', ['myocardial infarction', 'heart attack', 'mi']],
    ['cerebrovascular accident', ['stroke', 'cva', 'brain attack']],
    ['brain attack', ['stroke', 'cerebrovascular accident', 'cva']],
    ['cardiac arrest', ['heart attack', 'myocardial infarction', 'sudden cardiac death']],
    ['sudden cardiac death', ['cardiac arrest', 'heart attack', 'myocardial infarction']],
    ['hyperglycemia', ['high blood sugar', 'diabetes mellitus', 'diabetes']],
    ['hypercholesterolemia', ['high cholesterol', 'elevated cholesterol']],
    ['high cholesterol', ['hypercholesterolemia', 'elevated cholesterol']],
    ['cad', ['coronary artery disease', 'coronary heart disease', 'chd']],
    ['coronary artery disease', ['cad', 'coronary heart disease', 'chd']],
    ['gerd', ['gastroesophageal reflux disease', 'acid reflux', 'reflux']],
    ['gastroesophageal reflux disease', ['gerd', 'acid reflux', 'reflux']],
    ['ibd', ['inflammatory bowel disease', 'crohn disease', 'ulcerative colitis']],
    ['inflammatory bowel disease', ['ibd', 'crohn disease', 'ulcerative colitis']],
    ['ibs', ['irritable bowel syndrome', 'spastic colon']],
    ['irritable bowel syndrome', ['ibs', 'spastic colon']],
    ['uti', ['urinary tract infection', 'bladder infection']],
    ['urinary tract infection', ['uti', 'bladder infection']],
    ['uri', ['upper respiratory infection', 'common cold']],
    ['upper respiratory infection', ['uri', 'common cold']],
    ['ards', ['acute respiratory distress syndrome', 'respiratory failure']],
    ['acute respiratory distress syndrome', ['ards', 'respiratory failure']],
    ['pe', ['pulmonary embolism', 'blood clot in lung']],
    ['pulmonary embolism', ['pe', 'blood clot in lung']],
    ['dvt', ['deep vein thrombosis', 'blood clot in leg']],
    ['deep vein thrombosis', ['dvt', 'blood clot in leg']],
    ['tia', ['transient ischemic attack', 'mini stroke']],
    ['transient ischemic attack', ['tia', 'mini stroke']],
    ['lupus', ['systemic lupus erythematosus', 'sle']],
    ['systemic lupus erythematosus', ['lupus', 'sle']],
    ['alzheimer', ['alzheimer disease', 'dementia', "alzheimer's disease"]],
    ["alzheimer's disease", ['alzheimer', 'alzheimer disease', 'dementia']],
    ['parkinson', ['parkinson disease', "parkinson's disease"]],
    ["parkinson's disease", ['parkinson', 'parkinson disease']],
    ['epilepsy', ['seizure disorder', 'convulsive disorder']],
    ['migraine', ['migraine headache', 'hemicrania']],
    ['psoriasis', ['psoriasis vulgaris', 'plaque psoriasis']],
    ['eczema', ['atopic dermatitis', 'dermatitis']],
    ['atopic dermatitis', ['eczema', 'dermatitis']],
    ['gout', ['gouty arthritis', 'podagra']],
    ['rheumatoid arthritis', ['ra', 'rheumatoid disease']],
    ['ra', ['rheumatoid arthritis', 'rheumatoid disease']],
    ['osteoarthritis', ['oa', 'degenerative joint disease', 'djd']],
    ['oa', ['osteoarthritis', 'degenerative joint disease']],
    ['hepatitis', ['hepatitis infection', 'liver inflammation']],
    ['cirrhosis', ['liver cirrhosis', 'hepatic cirrhosis']],
    ['pancreatitis', ['pancreatic inflammation']],
    ['appendicitis', ['appendix inflammation', 'acute appendicitis']],
    ['meningitis', ['meningeal inflammation']],
    ['tumour', ['tumor', 'neoplasm']],
    ['tumor', ['tumour', 'neoplasm', 'mass']],
    ['anaemia', ['anemia', 'low hemoglobin']],
    ['anemia', ['anaemia', 'low hemoglobin']],
    ['lipitor', ['atorvastatin', 'statin']],
    ['atorvastatin', ['lipitor', 'statin']],
    ['glucotrol', ['glipizide', 'antidiabetic']],
    ['glipizide', ['glucotrol', 'antidiabetic']],
    ['glucophage', ['metformin', 'antidiabetic']],
    ['metformin', ['glucophage', 'antidiabetic']],
    ['norvasc', ['amlodipine', 'calcium channel blocker']],
    ['amlodipine', ['norvasc', 'calcium channel blocker']],
    ['prilosec', ['omeprazole', 'proton pump inhibitor']],
    ['omeprazole', ['prilosec', 'proton pump inhibitor']],
    ['prednisone', ['prednisolone', 'corticosteroid']],
    ['ventolin', ['albuterol', 'salbutamol', 'bronchodilator']],
    ['salbutamol', ['ventolin', 'albuterol', 'bronchodilator']],
    ['albuterol', ['salbutamol', 'ventolin', 'bronchodilator']],
    ['coumadin', ['warfarin', 'anticoagulant']],
    ['warfarin', ['coumadin', 'anticoagulant']],
    ['plavix', ['clopidogrel', 'antiplatelet']],
    ['clopidogrel', ['plavix', 'antiplatelet']],
    ['xarelto', ['rivaroxaban', 'anticoagulant']],
    ['rivaroxaban', ['xarelto', 'anticoagulant']],
    ['eliquis', ['apixaban', 'anticoagulant']],
    ['apixaban', ['eliquis', 'anticoagulant']],
    ['lasix', ['furosemide', 'diuretic']],
    ['furosemide', ['lasix', 'diuretic']],
    ['dyazide', ['triamterene', 'diuretic']],
    ['diamox', ['acetazolamide', 'carbonic anhydrase inhibitor']],
    ['lasix', ['furosemide', 'loop diuretic']],
    ['tumour', ['tumor', 'neoplasm', 'growth', 'mass']],
    ['tumor', ['tumour', 'neoplasm', 'growth', 'mass']],
    ['labour', ['labor', 'childbirth', 'delivery', 'parturition']],
    ['labor', ['labour', 'childbirth', 'delivery', 'parturition']],
    ['anaemia', ['anemia', 'low hemoglobin', 'low red blood cells']],
    ['anemia', ['anaemia', 'low hemoglobin', 'low red blood cells']],
    ['lipitor', ['atorvastatin', 'statin', 'cholesterol medication']],
    ['atorvastatin', ['lipitor', 'statin', 'cholesterol medication']],
    ['glipizide', ['glucotrol', 'sulfonylurea', 'diabetes medication']],
    ['glucotrol', ['glipizide', 'sulfonylurea', 'diabetes medication']],
    ['metformin', ['glucophage', 'biguanide', 'diabetes medication']],
    ['glucophage', ['metformin', 'biguanide', 'diabetes medication']],
    ['lisinopril', ['prilosec', 'ace inhibitor', 'blood pressure medication']],
    ['prilosec', ['lisinopril', 'ace inhibitor', 'blood pressure medication']],
    ['amlodipine', ['norvasc', 'calcium channel blocker', 'blood pressure medication']],
    ['norvasc', ['amlodipine', 'calcium channel blocker', 'blood pressure medication']],
    ['lupus', ['sle', 'systemic lupus erythematosus', 'autoimmune disease']],
    ['systemic lupus erythematosus', ['sle', 'lupus', 'autoimmune disease']],
    ['alzheimer', ['alzheimer disease', 'dementia', 'neurodegenerative disease']],
    ['alzheimer disease', ['alzheimer', 'dementia', 'neurodegenerative disease']],
    ['parkinson', ['parkinson disease', 'parkinsonism', 'neurodegenerative disease']],
    ['parkinson disease', ['parkinson', 'parkinsonism', 'neurodegenerative disease']],
    ['epilepsy', ['seizure disorder', 'epileptic disorder', 'neurological condition']],
    ['migraine', ['migraine headache', 'cephalalgia', 'headache disorder']],
    ['psoriasis', ['psoriatic disease', 'skin condition', 'autoimmune skin disease']],
    ['eczema', ['atopic dermatitis', 'dermatitis', 'skin inflammation']],
    ['gout', ['gouty arthritis', 'crystal arthropathy', 'inflammatory arthritis']],
    ['rheumatoid arthritis', ['ra', 'autoimmune arthritis', 'inflammatory joint disease']],
    ['ra', ['rheumatoid arthritis', 'autoimmune arthritis', 'inflammatory joint disease']],
    ['osteoarthritis', ['oa', 'degenerative joint disease', 'wear and tear arthritis']],
    ['oa', ['osteoarthritis', 'degenerative joint disease', 'wear and tear arthritis']],
    ['hepatitis', ['liver inflammation', 'hepatic inflammation', 'viral hepatitis']],
    ['cirrhosis', ['liver cirrhosis', 'hepatic cirrhosis', 'end-stage liver disease']],
    ['pancreatitis', ['pancreatic inflammation', 'pancreatic disorder']],
    ['appendicitis', ['appendix inflammation', 'acute appendicitis', 'appendiceal inflammation']],
    ['meningitis', ['meningeal inflammation', 'brain inflammation', 'spinal inflammation']],
    ['tachycardia', ['fast heart rate', 'rapid heart rate', 'sinus tachycardia']],
    ['bradycardia', ['slow heart rate', 'bradyarrhythmia']],
    ['hypotension', ['low blood pressure', 'low bp', 'hypotensive']],
    ['hypoglycemia', ['low blood sugar', 'low glucose', 'hypoglycaemic']],
    ['hyperglycemia', ['high blood sugar', 'high glucose', 'hyperglycaemic']],
    ['dyspnea', ['shortness of breath', 'breathlessness', 'respiratory distress']],
    ['edema', ['swelling', 'fluid retention', 'hydrops']],
    ['haemorrhage', ['hemorrhage', 'bleeding', 'blood loss']],
    ['haematemesis', ['hematemesis', 'vomiting blood', 'blood vomiting']],
    ['melena', ['black stool', 'tarry stool', 'gi bleeding']],
    ['diarrhoea', ['diarrhea', 'loose stools', 'frequent bowel movements']],
    ['fracture', ['fx', 'broken bone', 'bone break']],
    ['fx', ['fracture', 'broken bone', 'bone break']],
    ['biopsy', ['tissue sampling', 'specimen collection', 'histological examination']],
    ['catheter', ['iv line', 'venous catheter', 'arterial line']],
    ['stent', ['vascular stent', 'cardiac stent', 'coronary stent']],
    ['bypass', ['cabg', 'coronary artery bypass', 'heart bypass']],
    ['cabg', ['bypass', 'coronary artery bypass', 'heart bypass']],
    ['hysterectomy', ['uterus removal', 'surgical removal of uterus']],
    ['cholecystectomy', ['gallbladder removal', 'gall bladder surgery']],
    ['appendectomy', ['appendix removal', 'appendicectomy']],
    ['tonsillectomy', ['tonsil removal', 'adenotonsillectomy']],
    ['biopsy', ['tissue sampling', 'histological examination', 'specimen collection']],
    ['colostomy', ['stoma creation', 'bowel diversion', 'intestinal stoma']],
    ['dialysis', ['renal replacement therapy', 'hemodialysis', 'peritoneal dialysis']],
    ['chemotherapy', ['chemo', 'cytotoxic therapy', 'cancer drug therapy']],
    ['chemo', ['chemotherapy', 'cytotoxic therapy', 'cancer drug therapy']],
    ['radiotherapy', ['radiation therapy', 'rt', 'radiation treatment']],
    ['rt', ['radiotherapy', 'radiation therapy', 'radiation treatment']],
    ['immunotherapy', ['immune therapy', 'biological therapy', 'cancer immunotherapy']],
    ['inhaler', ['puffer', 'asthma inhaler', 'breath-activated inhaler']],
    ['puffer', ['inhaler', 'asthma inhaler', 'breath-activated inhaler']],
    ['nebuliser', ['nebulizer', 'inhalation therapy', 'aerosol therapy']],
    ['nebulizer', ['nebuliser', 'inhalation therapy', 'aerosol therapy']],
    ['bp monitor', ['blood pressure monitoring', 'sphygmomanometer', 'bp cuff']],
    ['sphygmomanometer', ['bp monitor', 'blood pressure cuff', 'bp machine']],
    ['ecg', ['ekg', 'electrocardiogram', 'heart tracing']],
    ['ekg', ['ecg', 'electrocardiogram', 'heart tracing']],
    ['mri', ['magnetic resonance imaging', 'mr scan', 'magnetic resonance scan']],
    ['ct scan', ['cat scan', 'computed tomography', 'ct imaging']],
    ['cat scan', ['ct scan', 'computed tomography', 'ct imaging']],
    ['ultrasound', ['sonography', 'ultrasonography', 'us scan']],
    ['xray', ['x-ray', 'radiograph', 'plain film']],
    ['x-ray', ['xray', 'radiograph', 'plain film']],
  ]);

  private readonly commonTerms = new Set<string>([
    'pain', 'ache', 'fever', 'cough', 'fatigue', 'weakness', 'nausea', 'vomiting',
    'diarrhea', 'headache', 'dizziness', 'swelling', 'rash', 'bleeding', 'infection',
    'symptoms', 'diagnosis', 'treatment', 'medication', 'disease', 'patient', 'doctor',
    'hospital', 'clinic', 'surgery', 'test', 'exam', 'screening', 'prevention',
    'cause', 'risk', 'factor', 'sign', 'syndrome', 'disorder', 'condition', 'illness',
    'acute', 'chronic', 'severe', 'mild', 'moderate', 'prognosis', 'complication',
    'side effect', 'allergy', 'reaction', 'dose', 'therapy', 'drug', 'medicine',
    'chest pain', 'shortness of breath', 'difficulty breathing', 'palpitations',
    'numbness', 'tingling', 'confusion', 'seizure', 'paralysis', 'tremor', 'stiffness',
    'joint pain', 'muscle pain', 'weight loss', 'weight gain', 'appetite loss',
    'insomnia', 'anxiety', 'depression', 'sore throat', 'congestion', 'wheezing',
    'blood in urine', 'blood in stool', 'abdominal pain', 'back pain', 'neck pain',
    'shoulder pain', 'knee pain', 'hip pain', 'foot pain', 'hand pain', 'leg pain',
    'arm pain', 'jaw pain', 'tooth pain', 'ear pain', 'eye pain', 'throat pain',
    'skin rash', 'itching', 'hives', 'blisters', 'ulcers', 'sores', 'lesions',
    'swelling', 'edema', 'inflammation', 'redness', 'warmth', 'tenderness',
    'coughing', 'sneezing', 'runny nose', 'stuffy nose', 'postnasal drip',
    'hoarseness', 'voice change', 'difficulty swallowing', 'dysphagia',
    'heartburn', 'indigestion', 'bloating', 'gas', 'constipation',
    'frequent urination', 'painful urination', 'difficulty urinating',
    'irregular heartbeat', 'fast heartbeat', 'slow heartbeat',
    'fainting', 'syncope', 'lightheadedness', 'vertigo', 'dizziness',
    'memory loss', 'confusion', 'disorientation', 'agitation', 'restlessness',
    'tremors', 'shaking', 'weakness', 'paralysis', 'numbness', 'tingling',
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
