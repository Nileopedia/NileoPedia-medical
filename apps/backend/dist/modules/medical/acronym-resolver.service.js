"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalAcronymResolver = exports.MedicalAcronymResolver = void 0;
class MedicalAcronymResolver {
    constructor() {
        this.acronyms = new Map([
            ['htn', { expansion: 'hypertension', category: 'disease', confidence: 0.95 }],
            ['hbp', { expansion: 'high blood pressure', category: 'disease', confidence: 0.95 }],
            ['mi', { expansion: 'myocardial infarction', category: 'disease', confidence: 0.98 }],
            ['cva', { expansion: 'cerebrovascular accident', category: 'disease', confidence: 0.95 }],
            ['tia', { expansion: 'transient ischemic attack', category: 'disease', confidence: 0.95 }],
            ['cad', { expansion: 'coronary artery disease', category: 'disease', confidence: 0.95 }],
            ['chf', { expansion: 'congestive heart failure', category: 'disease', confidence: 0.95 }],
            ['copd', { expansion: 'chronic obstructive pulmonary disease', category: 'disease', confidence: 0.95 }],
            ['dmi', { expansion: 'diabetes mellitus', category: 'disease', confidence: 0.9 }],
            ['t1dm', { expansion: 'type 1 diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['t2dm', { expansion: 'type 2 diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['dm', { expansion: 'diabetes mellitus', category: 'disease', confidence: 0.85 }],
            ['gerd', { expansion: 'gastroesophageal reflux disease', category: 'disease', confidence: 0.95 }],
            ['ibd', { expansion: 'inflammatory bowel disease', category: 'disease', confidence: 0.95 }],
            ['ibs', { expansion: 'irritable bowel syndrome', category: 'disease', confidence: 0.95 }],
            ['uti', { expansion: 'urinary tract infection', category: 'disease', confidence: 0.95 }],
            ['uri', { expansion: 'upper respiratory infection', category: 'disease', confidence: 0.95 }],
            ['ards', { expansion: 'acute respiratory distress syndrome', category: 'disease', confidence: 0.95 }],
            ['pe', { expansion: 'pulmonary embolism', category: 'disease', confidence: 0.9 }],
            ['dvt', { expansion: 'deep vein thrombosis', category: 'disease', confidence: 0.95 }],
            ['ckd', { expansion: 'chronic kidney disease', category: 'disease', confidence: 0.95 }],
            ['esrd', { expansion: 'end-stage renal disease', category: 'disease', confidence: 0.95 }],
            ['aki', { expansion: 'acute kidney injury', category: 'disease', confidence: 0.95 }],
            ['acs', { expansion: 'acute coronary syndrome', category: 'disease', confidence: 0.95 }],
            ['af', { expansion: 'atrial fibrillation', category: 'disease', confidence: 0.95 }],
            ['vte', { expansion: 'venous thromboembolism', category: 'disease', confidence: 0.9 }],
            ['pvd', { expansion: 'peripheral vascular disease', category: 'disease', confidence: 0.9 }],
            ['pad', { expansion: 'peripheral arterial disease', category: 'disease', confidence: 0.9 }],
            ['ptsd', { expansion: 'post-traumatic stress disorder', category: 'disease', confidence: 0.95 }],
            ['ocd', { expansion: 'obsessive-compulsive disorder', category: 'disease', confidence: 0.95 }],
            ['adhd', { expansion: 'attention deficit hyperactivity disorder', category: 'disease', confidence: 0.95 }],
            ['als', { expansion: 'amyotrophic lateral sclerosis', category: 'disease', confidence: 0.95 }],
            ['ms', { expansion: 'multiple sclerosis', category: 'disease', confidence: 0.9 }],
            ['ra', { expansion: 'rheumatoid arthritis', category: 'disease', confidence: 0.9 }],
            ['oa', { expansion: 'osteoarthritis', category: 'disease', confidence: 0.85 }],
            ['sle', { expansion: 'systemic lupus erythematosus', category: 'disease', confidence: 0.95 }],
            ['gbm', { expansion: 'glioblastoma', category: 'disease', confidence: 0.9 }],
            ['hcc', { expansion: 'hepatocellular carcinoma', category: 'disease', confidence: 0.95 }],
            ['nsclc', { expansion: 'non-small cell lung cancer', category: 'disease', confidence: 0.95 }],
            ['sclc', { expansion: 'small cell lung cancer', category: 'disease', confidence: 0.95 }],
            ['aml', { expansion: 'acute myeloid leukemia', category: 'disease', confidence: 0.95 }],
            ['all', { expansion: 'acute lymphoblastic leukemia', category: 'disease', confidence: 0.95 }],
            ['cll', { expansion: 'chronic lymphocytic leukemia', category: 'disease', confidence: 0.95 }],
            ['cml', { expansion: 'chronic myeloid leukemia', category: 'disease', confidence: 0.95 }],
            ['hiv', { expansion: 'human immunodeficiency virus', category: 'disease', confidence: 0.98 }],
            ['aids', { expansion: 'acquired immunodeficiency syndrome', category: 'disease', confidence: 0.98 }],
            ['tb', { expansion: 'tuberculosis', category: 'disease', confidence: 0.95 }],
            ['mrsa', { expansion: 'methicillin-resistant staphylococcus aureus', category: 'disease', confidence: 0.95 }],
            ['vzv', { expansion: 'varicella zoster virus', category: 'disease', confidence: 0.9 }],
            ['hsv', { expansion: 'herpes simplex virus', category: 'disease', confidence: 0.9 }],
            ['cmv', { expansion: 'cytomegalovirus', category: 'disease', confidence: 0.9 }],
            ['ebv', { expansion: 'epstein-barr virus', category: 'disease', confidence: 0.9 }],
            ['hbv', { expansion: 'hepatitis b virus', category: 'disease', confidence: 0.95 }],
            ['hcv', { expansion: 'hepatitis c virus', category: 'disease', confidence: 0.95 }],
            ['hep b', { expansion: 'hepatitis b', category: 'disease', confidence: 0.95 }],
            ['hep c', { expansion: 'hepatitis c', category: 'disease', confidence: 0.95 }],
            ['nafld', { expansion: 'non-alcoholic fatty liver disease', category: 'disease', confidence: 0.95 }],
            ['nash', { expansion: 'non-alcoholic steatohepatitis', category: 'disease', confidence: 0.95 }],
            ['alc', { expansion: 'alcoholic liver disease', category: 'disease', confidence: 0.95 }],
            ['pcos', { expansion: 'polycystic ovary syndrome', category: 'disease', confidence: 0.95 }],
            ['osahs', { expansion: 'obstructive sleep apnea hypopnea syndrome', category: 'disease', confidence: 0.9 }],
            ['osa', { expansion: 'obstructive sleep apnea', category: 'disease', confidence: 0.9 }],
            ['dm2', { expansion: 'type 2 diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['dm1', { expansion: 'type 1 diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['iddm', { expansion: 'insulin-dependent diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['niddm', { expansion: 'non-insulin-dependent diabetes mellitus', category: 'disease', confidence: 0.95 }],
            ['bp', { expansion: 'blood pressure', category: 'anatomy', confidence: 0.9 }],
            ['hr', { expansion: 'heart rate', category: 'anatomy', confidence: 0.9 }],
            ['rr', { expansion: 'respiratory rate', category: 'anatomy', confidence: 0.9 }],
            ['spo2', { expansion: 'oxygen saturation', category: 'anatomy', confidence: 0.9 }],
            ['o2 sat', { expansion: 'oxygen saturation', category: 'anatomy', confidence: 0.9 }],
            ['bmi', { expansion: 'body mass index', category: 'anatomy', confidence: 0.95 }],
            ['wbc', { expansion: 'white blood cell', category: 'anatomy', confidence: 0.9 }],
            ['rbc', { expansion: 'red blood cell', category: 'anatomy', confidence: 0.9 }],
            ['hgb', { expansion: 'hemoglobin', category: 'anatomy', confidence: 0.9 }],
            ['hct', { expansion: 'hematocrit', category: 'anatomy', confidence: 0.9 }],
            ['plt', { expansion: 'platelet', category: 'anatomy', confidence: 0.9 }],
            ['cr', { expansion: 'creatinine', category: 'anatomy', confidence: 0.9 }],
            ['bun', { expansion: 'blood urea nitrogen', category: 'anatomy', confidence: 0.9 }],
            ['alt', { expansion: 'alanine transaminase', category: 'anatomy', confidence: 0.9 }],
            ['ast', { expansion: 'aspartate transaminase', category: 'anatomy', confidence: 0.9 }],
            ['alp', { expansion: 'alkaline phosphatase', category: 'anatomy', confidence: 0.9 }],
            ['tsh', { expansion: 'thyroid stimulating hormone', category: 'anatomy', confidence: 0.9 }],
            ['ft4', { expansion: 'free thyroxine', category: 'anatomy', confidence: 0.9 }],
            ['hba1c', { expansion: 'hemoglobin a1c', category: 'anatomy', confidence: 0.95 }],
            ['a1c', { expansion: 'hemoglobin a1c', category: 'anatomy', confidence: 0.95 }],
            ['ldl', { expansion: 'low density lipoprotein', category: 'anatomy', confidence: 0.9 }],
            ['hdl', { expansion: 'high density lipoprotein', category: 'anatomy', confidence: 0.9 }],
            ['tg', { expansion: 'triglycerides', category: 'anatomy', confidence: 0.9 }],
            ['inr', { expansion: 'international normalized ratio', category: 'anatomy', confidence: 0.95 }],
            ['ptt', { expansion: 'partial thromboplastin time', category: 'anatomy', confidence: 0.9 }],
            ['pt', { expansion: 'prothrombin time', category: 'anatomy', confidence: 0.9 }],
            ['ekg', { expansion: 'electrocardiogram', category: 'procedure', confidence: 0.95 }],
            ['ecg', { expansion: 'electrocardiogram', category: 'procedure', confidence: 0.95 }],
            ['mri', { expansion: 'magnetic resonance imaging', category: 'procedure', confidence: 0.95 }],
            ['ct', { expansion: 'computed tomography', category: 'procedure', confidence: 0.9 }],
            ['cat scan', { expansion: 'computed tomography', category: 'procedure', confidence: 0.95 }],
            ['us', { expansion: 'ultrasound', category: 'procedure', confidence: 0.85 }],
            ['ultrasound', { expansion: 'ultrasound', category: 'procedure', confidence: 1.0 }],
            ['xray', { expansion: 'x-ray', category: 'procedure', confidence: 0.9 }],
            ['x-ray', { expansion: 'x-ray', category: 'procedure', confidence: 1.0 }],
            ['bp monitor', { expansion: 'blood pressure monitoring', category: 'procedure', confidence: 0.9 }],
            ['cbc', { expansion: 'complete blood count', category: 'procedure', confidence: 0.95 }],
            ['bmp', { expansion: 'basic metabolic panel', category: 'procedure', confidence: 0.9 }],
            ['cmp', { expansion: 'comprehensive metabolic panel', category: 'procedure', confidence: 0.9 }],
            ['lfp', { expansion: 'liver function panel', category: 'procedure', confidence: 0.85 }],
            ['lft', { expansion: 'liver function test', category: 'procedure', confidence: 0.85 }],
            ['ua', { expansion: 'urinalysis', category: 'procedure', confidence: 0.85 }],
            ['csf', { expansion: 'cerebrospinal fluid', category: 'anatomy', confidence: 0.9 }],
            ['iv', { expansion: 'intravenous', category: 'procedure', confidence: 0.95 }],
            ['im', { expansion: 'intramuscular', category: 'procedure', confidence: 0.95 }],
            ['sc', { expansion: 'subcutaneous', category: 'procedure', confidence: 0.95 }],
            ['po', { expansion: 'by mouth', category: 'procedure', confidence: 0.9 }],
            ['prn', { expansion: 'as needed', category: 'general', confidence: 0.9 }],
            ['bid', { expansion: 'twice daily', category: 'general', confidence: 0.9 }],
            ['tid', { expansion: 'three times daily', category: 'general', confidence: 0.9 }],
            ['qid', { expansion: 'four times daily', category: 'general', confidence: 0.9 }],
            ['qd', { expansion: 'once daily', category: 'general', confidence: 0.9 }],
            ['qod', { expansion: 'every other day', category: 'general', confidence: 0.9 }],
            ['stat', { expansion: 'immediately', category: 'general', confidence: 0.9 }],
            ['dx', { expansion: 'diagnosis', category: 'general', confidence: 0.95 }],
            ['tx', { expansion: 'treatment', category: 'general', confidence: 0.9 }],
            ['rx', { expansion: 'prescription', category: 'general', confidence: 0.9 }],
            ['sx', { expansion: 'symptoms', category: 'general', confidence: 0.9 }],
            ['fx', { expansion: 'fracture', category: 'disease', confidence: 0.9 }],
            ['hx', { expansion: 'history', category: 'general', confidence: 0.9 }],
            ['f/u', { expansion: 'follow up', category: 'general', confidence: 0.85 }],
            ['ytd', { expansion: 'yesterday', category: 'general', confidence: 0.5 }],
            ['wc', { expansion: 'wheelchair', category: 'general', confidence: 0.7 }],
            ['npo', { expansion: 'nothing by mouth', category: 'general', confidence: 0.95 }],
            ['dnr', { expansion: 'do not resuscitate', category: 'general', confidence: 0.95 }],
            ['cpr', { expansion: 'cardiopulmonary resuscitation', category: 'procedure', confidence: 0.95 }],
            ['abg', { expansion: 'arterial blood gas', category: 'procedure', confidence: 0.9 }],
            ['bmp', { expansion: 'basic metabolic panel', category: 'procedure', confidence: 0.9 }],
            ['cmp', { expansion: 'comprehensive metabolic panel', category: 'procedure', confidence: 0.9 }],
            ['pe', { expansion: 'physical examination', category: 'procedure', confidence: 0.85 }],
            ['hpi', { expansion: 'history of present illness', category: 'general', confidence: 0.9 }],
            ['pmh', { expansion: 'past medical history', category: 'general', confidence: 0.95 }],
            ['fh', { expansion: 'family history', category: 'general', confidence: 0.9 }],
            ['sh', { expansion: 'social history', category: 'general', confidence: 0.9 }],
            ['ros', { expansion: 'review of systems', category: 'general', confidence: 0.9 }],
            ['loc', { expansion: 'level of consciousness', category: 'anatomy', confidence: 0.85 }],
            ['gcs', { expansion: 'glascow coma scale', category: 'procedure', confidence: 0.9 }],
            ['apache', { expansion: 'acute physiology and chronic health evaluation', category: 'procedure', confidence: 0.85 }],
            ['sofa', { expansion: 'sequential organ failure assessment', category: 'procedure', confidence: 0.85 }],
        ]);
    }
    resolve(term) {
        const normalized = term.toLowerCase().trim();
        const resolved = this.acronyms.get(normalized);
        if (resolved) {
            return {
                original: normalized,
                expanded: resolved.expansion,
                confidence: resolved.confidence,
                category: resolved.category,
            };
        }
        return null;
    }
    resolveAll(query) {
        const terms = query.toLowerCase().split(/\s+/);
        const resolved = [];
        const expandedTerms = [];
        let expandedQuery = query;
        for (const term of terms) {
            const cleanTerm = term.replace(/[^a-z0-9]/g, '');
            const resolution = this.resolve(cleanTerm);
            if (resolution && resolution.confidence >= 0.8) {
                resolved.push(resolution);
                if (!expandedTerms.includes(resolution.expanded)) {
                    expandedTerms.push(resolution.expanded);
                }
            }
        }
        if (resolved.length > 0) {
            const expansionText = expandedTerms.join(' ');
            expandedQuery = `${query} ${expansionText}`;
        }
        return {
            acronyms: resolved,
            expandedTerms,
            originalQuery: query,
            expandedQuery: expandedQuery.trim(),
        };
    }
    getAcronymsByCategory(category) {
        const results = [];
        for (const [acronym, data] of this.acronyms.entries()) {
            if (data.category === category) {
                results.push({
                    acronym,
                    expansion: data.expansion,
                    confidence: data.confidence,
                });
            }
        }
        return results.sort((a, b) => b.confidence - a.confidence);
    }
    getAllAcronyms() {
        const results = [];
        for (const [acronym, data] of this.acronyms.entries()) {
            results.push({
                acronym,
                expansion: data.expansion,
                category: data.category,
                confidence: data.confidence,
            });
        }
        return results.sort((a, b) => b.confidence - a.confidence);
    }
}
exports.MedicalAcronymResolver = MedicalAcronymResolver;
exports.medicalAcronymResolver = new MedicalAcronymResolver();
//# sourceMappingURL=acronym-resolver.service.js.map