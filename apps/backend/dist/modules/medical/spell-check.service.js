"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellCheckService = exports.SpellCheckService = void 0;
function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++)
        dp[i][0] = i;
    for (let j = 0; j <= n; j++)
        dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[m][n];
}
class SpellCheckService {
    constructor() {
        this.commonMisspellings = new Map([
            ['dabetes', 'diabetes'],
            ['diabeties', 'diabetes'],
            ['diabetis', 'diabetes'],
            ['diabetees', 'diabetes'],
            ['diabetus', 'diabetes'],
            ['dialbetes', 'diabetes'],
            ['diebetes', 'diabetes'],
            ['hypertenion', 'hypertension'],
            ['hypertenison', 'hypertension'],
            ['hypertenssion', 'hypertension'],
            ['astma', 'asthma'],
            ['asthama', 'asthma'],
            ['pneumonia', 'pneumonia'],
            ['pnemonia', 'pneumonia'],
            ['tuberclosis', 'tuberculosis'],
            ['tuburculosis', 'tuberculosis'],
            ['tuburclosis', 'tuberculosis'],
            ['maleria', 'malaria'],
            ['cancer', 'cancer'],
            ['canser', 'cancer'],
            ['seizure', 'seizure'],
            ['epilepsey', 'epilepsy'],
            ['epilepsi', 'epilepsy'],
            ['migrane', 'migraine'],
            ['migrain', 'migraine'],
            ['cholestrol', 'cholesterol'],
            ['hemogoblin', 'hemoglobin'],
            ['hemaglobin', 'hemoglobin'],
            ['hemmorhage', 'hemorrhage'],
            ['hemorage', 'hemorrhage'],
            ['diareha', 'diarrhea'],
            ['diarhea', 'diarrhea'],
            ['diarroea', 'diarrhea'],
            ['vometing', 'vomiting'],
            ['vomitting', 'vomiting'],
            ['headake', 'headache'],
            ['headachs', 'headache'],
            ['stomache', 'stomach'],
            ['stomach ache', 'stomach ache'],
            ['dizzness', 'dizziness'],
            ['diziness', 'dizziness'],
            ['unconsious', 'unconscious'],
            ['unconcious', 'unconscious'],
            ['medacine', 'medicine'],
            ['medecine', 'medicine'],
            ['surjery', 'surgery'],
            ['sergery', 'surgery'],
            ['pateint', 'patient'],
            ['patiant', 'patient'],
            ['medication', 'medication'],
            ['mediction', 'medication'],
            ['treatment', 'treatment'],
            ['tretment', 'treatment'],
            ['infaction', 'infection'],
            ['infetion', 'infection'],
            ['inflamation', 'inflammation'],
            ['inflamation', 'inflammation'],
            ['alletgy', 'allergy'],
            ['alergy', 'allergy'],
            ['pneumona', 'pneumonia'],
            ['neomnia', 'pneumonia'],
            ['cirusis', 'cirrhosis'],
            ['sirosis', 'cirrhosis'],
            ['hepatites', 'hepatitis'],
            ['hepatits', 'hepatitis'],
            ['appendicitus', 'appendicitis'],
            ['appendicites', 'appendicitis'],
            ['meningites', 'meningitis'],
            ['menengitis', 'meningitis'],
            ['artheritis', 'arthritis'],
            ['arthrits', 'arthritis'],
            ['artritis', 'arthritis'],
            ['osteoperosis', 'osteoporosis'],
            ['osteoporsis', 'osteoporosis'],
            ['anurism', 'aneurysm'],
            ['anerysm', 'aneurysm'],
            ['thyrod', 'thyroid'],
            ['thyriod', 'thyroid'],
            ['prostrate', 'prostate'],
            ['prostat', 'prostate'],
            ['sypilis', 'syphilis'],
            ['syphillis', 'syphilis'],
            ['gonorhea', 'gonorrhea'],
            ['gonorrhoea', 'gonorrhea'],
            ['clamedia', 'chlamydia'],
            ['clamidia', 'chlamydia'],
            ['urtacaria', 'urticaria'],
            ['urtacria', 'urticaria'],
            ['exema', 'eczema'],
            ['eksema', 'eczema'],
            ['psoraisis', 'psoriasis'],
            ['sorisis', 'psoriasis'],
            ['depresion', 'depression'],
            ['anxity', 'anxiety'],
            ['anxiaty', 'anxiety'],
            ['insomina', 'insomnia'],
            ['insomnea', 'insomnia'],
            ['schizofrenia', 'schizophrenia'],
            ['schitzophrenia', 'schizophrenia'],
            ['fractuer', 'fracture'],
            ['fractur', 'fracture'],
            ['diasysis', 'dialysis'],
            ['dialasis', 'dialysis'],
            ['chemotherepy', 'chemotherapy'],
            ['chemo', 'chemotherapy'],
            ['radiotherepy', 'radiotherapy'],
            ['radiaton', 'radiation'],
            ['imunotherapy', 'immunotherapy'],
            ['cortizon', 'cortisone'],
            ['nitrogliserin', 'nitroglycerin'],
            ['nitroglicerin', 'nitroglycerin'],
            ['acetominophen', 'acetaminophen'],
            ['asprin', 'aspirin'],
            ['ibeprophen', 'ibuprofen'],
            ['ibuprofin', 'ibuprofen'],
            ['metformine', 'metformin'],
            ['metformn', 'metformin'],
            ['atorvastatine', 'atorvastatin'],
            ['rosuvastatine', 'rosuvastatin'],
            ['omperazole', 'omeprazole'],
            ['omeprazol', 'omeprazole'],
            ['pantoprazol', 'pantoprazole'],
            ['pentoprazole', 'pantoprazole'],
            ['amoxacillin', 'amoxicillin'],
            ['amoxycillin', 'amoxicillin'],
            ['penicilin', 'penicillin'],
            ['penicillan', 'penicillin'],
            ['ciphlexin', 'cephalexin'],
            ['ciproflaxacin', 'ciprofloxacin'],
            ['cipro', 'ciprofloxacin'],
            ['azithromicin', 'azithromycin'],
            ['azythromycin', 'azithromycin'],
            ['doxycyline', 'doxycycline'],
            ['prednison', 'prednisone'],
            ['prednisolon', 'prednisolone'],
            ['ventoline', 'ventolin'],
            ['albuterol', 'albuterol'],
            ['salbutamol', 'salbutamol'],
            ['warfarin', 'warfarin'],
            ['coumadin', 'coumadin'],
            ['plavix', 'plavix'],
            ['clopidogrel', 'clopidogrel'],
            ['lasix', 'furosemide'],
            ['lisinopril', 'lisinopril'],
            ['norvasc', 'amlodipine'],
            ['lipitor', 'atorvastatin'],
            ['crestor', 'rosuvastatin'],
            ['simvastatine', 'simvastatin'],
            ['atorvastatin', 'atorvastatin'],
        ]);
        this.dictionary = this.buildDictionary();
    }
    buildDictionary() {
        const terms = new Set();
        const synonymTerms = [
            'hypertension', 'high blood pressure', 'htn', 'high bp', 'elevated blood pressure',
            'arterial hypertension', 'systemic hypertension', 'heart attack', 'myocardial infarction',
            'mi', 'acute coronary syndrome', 'coronary thrombosis', 'stroke', 'cerebrovascular accident',
            'cva', 'brain attack', 'cerebral vascular accident', 'cerebrovascular insult',
            'brain infarction', 'high blood sugar', 'diabetes mellitus', 'diabetes', 'hyperglycemia',
            'high glucose', 'elevated blood glucose', 'blood pressure', 'bp', 'asthma',
            'bronchial asthma', 'reactive airway disease', 'asthma attack', 'bronchial hyperreactivity',
            'copd', 'chronic obstructive pulmonary disease', 'chronic bronchitis', 'emphysema',
            'malaria', 'paludism', 'malarial fever', 'plasmodium infection', 'tuberculosis', 'tb',
            'consumption', 'pulmonary tuberculosis', 'hiv', 'human immunodeficiency virus', 'aids',
            'acquired immunodeficiency syndrome', 'heart failure', 'congestive heart failure', 'chf',
            'cardiac failure', 'heart dysfunction', 'cancer', 'malignancy', 'malignant tumor',
            'neoplasm', 'carcinoma', 'pneumonia', 'lung infection', 'pulmonary infection',
            'lower respiratory tract infection', 'ckd', 'chronic kidney disease', 'kidney failure',
            'renal failure', 'renal insufficiency', 'hypercholesterolemia', 'high cholesterol',
            'elevated cholesterol', 'cad', 'coronary artery disease', 'coronary heart disease', 'chd',
            'gerd', 'gastroesophageal reflux disease', 'acid reflux', 'reflux', 'ibd',
            'inflammatory bowel disease', 'crohn disease', 'ulcerative colitis', 'ibs',
            'irritable bowel syndrome', 'spastic colon', 'uti', 'urinary tract infection',
            'bladder infection', 'uri', 'upper respiratory infection', 'common cold', 'ards',
            'acute respiratory distress syndrome', 'respiratory failure', 'pe', 'pulmonary embolism',
            'blood clot in lung', 'dvt', 'deep vein thrombosis', 'blood clot in leg', 'tia',
            'transient ischemic attack', 'mini stroke', 'lupus', 'systemic lupus erythematosus', 'sle',
            'alzheimer', 'alzheimer disease', 'dementia', "alzheimer's disease", 'parkinson',
            'parkinson disease', "parkinson's disease", 'epilepsy', 'seizure disorder',
            'convulsive disorder', 'migraine', 'migraine headache', 'hemicrania', 'psoriasis',
            'psoriasis vulgaris', 'plaque psoriasis', 'eczema', 'atopic dermatitis', 'dermatitis',
            'gout', 'gouty arthritis', 'podagra', 'rheumatoid arthritis', 'ra', 'rheumatoid disease',
            'osteoarthritis', 'oa', 'degenerative joint disease', 'djd', 'hepatitis',
            'hepatitis infection', 'liver inflammation', 'cirrhosis', 'liver cirrhosis',
            'hepatic cirrhosis', 'pancreatitis', 'pancreatic inflammation', 'appendicitis',
            'appendix inflammation', 'acute appendicitis', 'meningitis', 'meningeal inflammation',
            'tumor', 'tumour', 'mass', 'anemia', 'anaemia', 'low hemoglobin', 'low red blood cells',
            'lipitor', 'atorvastatin', 'statin', 'cholesterol medication', 'glucotrol', 'glipizide',
            'sulfonylurea', 'diabetes medication', 'glucophage', 'metformin', 'biguanide',
            'norvasc', 'amlodipine', 'calcium channel blocker', 'blood pressure medication',
            'prilosec', 'omeprazole', 'proton pump inhibitor', 'prednisone', 'prednisolone',
            'corticosteroid', 'ventolin', 'albuterol', 'salbutamol', 'bronchodilator', 'coumadin',
            'warfarin', 'anticoagulant', 'plavix', 'clopidogrel', 'antiplatelet', 'xarelto',
            'rivaroxaban', 'eliquis', 'apixaban', 'lasix', 'furosemide', 'diuretic', 'diamox',
            'acetazolamide', 'carbonic anhydrase inhibitor', 'labour', 'labor', 'childbirth',
            'delivery', 'parturition', 'lisinopril', 'ace inhibitor',
            'tachycardia', 'fast heart rate', 'rapid heart rate', 'sinus tachycardia',
            'bradycardia', 'slow heart rate', 'bradyarrhythmia', 'hypotension', 'low blood pressure',
            'low bp', 'hypotensive', 'hypoglycemia', 'low blood sugar', 'low glucose',
            'dyspnea', 'shortness of breath', 'breathlessness', 'respiratory distress',
            'edema', 'swelling', 'fluid retention', 'hydrops', 'haemorrhage', 'hemorrhage',
            'bleeding', 'blood loss', 'diarrhoea', 'diarrhea', 'loose stools',
            'frequent bowel movements', 'fracture', 'fx', 'broken bone', 'bone break',
            'biopsy', 'tissue sampling', 'specimen collection', 'histological examination',
            'catheter', 'iv line', 'venous catheter', 'arterial line', 'stent', 'vascular stent',
            'cardiac stent', 'coronary stent', 'bypass', 'cabg', 'coronary artery bypass',
            'heart bypass', 'hysterectomy', 'uterus removal', 'surgical removal of uterus',
            'cholecystectomy', 'gallbladder removal', 'gall bladder surgery', 'appendectomy',
            'appendix removal', 'appendicectomy', 'tonsillectomy', 'tonsil removal',
            'colostomy', 'stoma creation', 'bowel diversion', 'intestinal stoma',
            'dialysis', 'renal replacement therapy', 'hemodialysis', 'peritoneal dialysis',
            'chemotherapy', 'chemo', 'cytotoxic therapy', 'cancer drug therapy',
            'radiotherapy', 'radiation therapy', 'rt', 'radiation treatment',
            'immunotherapy', 'immune therapy', 'biological therapy', 'cancer immunotherapy',
            'inhaler', 'puffer', 'asthma inhaler', 'breath-activated inhaler',
            'nebuliser', 'nebulizer', 'inhalation therapy', 'aerosol therapy',
            'bp monitor', 'blood pressure monitoring', 'sphygmomanometer', 'bp cuff',
            'ecg', 'ekg', 'electrocardiogram', 'heart tracing',
            'mri', 'magnetic resonance imaging', 'mr scan', 'magnetic resonance scan',
            'ct scan', 'cat scan', 'computed tomography', 'ct imaging',
            'ultrasound', 'sonography', 'ultrasonography', 'us scan',
            'xray', 'x-ray', 'radiograph', 'plain film',
            'type 1 diabetes', 'type 2 diabetes', 'type 1 diabetes mellitus',
            'type 2 diabetes mellitus', 'insulin-dependent diabetes mellitus',
            'non-insulin-dependent diabetes mellitus',
        ];
        for (const term of synonymTerms) {
            const words = term.split(/\s+/);
            for (const word of words) {
                if (word.length > 2) {
                    terms.add(word.toLowerCase());
                }
            }
        }
        const commonTerms = [
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
            'inflammation', 'redness', 'warmth', 'tenderness',
            'coughing', 'sneezing', 'runny nose', 'stuffy nose', 'postnasal drip',
            'hoarseness', 'voice change', 'difficulty swallowing', 'dysphagia',
            'heartburn', 'indigestion', 'bloating', 'gas', 'constipation',
            'frequent urination', 'painful urination', 'difficulty urinating',
            'irregular heartbeat', 'fast heartbeat', 'slow heartbeat',
            'fainting', 'syncope', 'lightheadedness', 'vertigo',
            'memory loss', 'agitation', 'restlessness',
            'shaking',
        ];
        for (const term of commonTerms) {
            const words = term.split(/\s+/);
            for (const word of words) {
                if (word.length > 2) {
                    terms.add(word.toLowerCase());
                }
            }
        }
        return terms;
    }
    check(query) {
        const normalized = query.toLowerCase().trim();
        const words = normalized.split(/\s+/);
        const corrections = [];
        const correctedWords = [];
        for (const word of words) {
            if (word.length <= 2) {
                correctedWords.push(word);
                continue;
            }
            if (this.dictionary.has(word)) {
                correctedWords.push(word);
                continue;
            }
            const knownMisspelling = this.commonMisspellings.get(word);
            if (knownMisspelling) {
                corrections.push({ original: word, corrected: knownMisspelling, distance: 0 });
                correctedWords.push(knownMisspelling);
                continue;
            }
            const bestMatch = this.findClosestMatch(word);
            if (bestMatch) {
                corrections.push({ original: word, corrected: bestMatch.word, distance: bestMatch.distance });
                correctedWords.push(bestMatch.word);
            }
            else {
                correctedWords.push(word);
            }
        }
        const correctedQuery = correctedWords.join(' ');
        return {
            originalQuery: normalized,
            correctedQuery,
            corrections,
        };
    }
    findClosestMatch(word) {
        const minLen = Math.max(3, word.length - 2);
        const maxLen = word.length + 2;
        let best = null;
        for (const dictWord of this.dictionary) {
            if (dictWord.length < minLen || dictWord.length > maxLen) {
                continue;
            }
            if (dictWord === word) {
                return null;
            }
            const dist = levenshteinDistance(word, dictWord);
            const maxAllowedDist = word.length <= 4 ? 1 : 2;
            if (dist <= maxAllowedDist) {
                if (!best || dist < best.distance) {
                    best = { word: dictWord, distance: dist };
                }
            }
        }
        return best;
    }
}
exports.SpellCheckService = SpellCheckService;
exports.spellCheckService = new SpellCheckService();
//# sourceMappingURL=spell-check.service.js.map