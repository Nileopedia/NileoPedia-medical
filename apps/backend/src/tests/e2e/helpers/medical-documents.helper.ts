import { PrismaClient, IngestionStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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

const MEDICAL_DOCUMENTS: MedicalDocumentFixture[] = [
  {
    topic: 'Hypertension',
    specialty: 'cardiology',
    title: 'Hypertension Clinical Guidelines 2024',
    content: `
# Hypertension: Clinical Practice Guidelines

## Abstract
Hypertension, or high blood pressure, is a chronic medical condition characterized by persistently elevated arterial blood pressure. This guideline provides evidence-based recommendations for the diagnosis, treatment, and management of hypertension in adults.

## Introduction
Hypertension affects approximately 1.13 billion people worldwide. Blood pressure is measured in millimeters of mercury (mmHg) and is recorded as two numbers: systolic pressure over diastolic pressure. Normal blood pressure is defined as less than 120/80 mmHg.

## Symptoms
Most people with hypertension are asymptomatic. When symptoms occur, they may include:
- Headaches, particularly in the morning
- Dizziness or lightheadedness
- Blurred vision
- Shortness of breath
- Chest pain
- Palpitations

## Diagnosis
Diagnosis requires multiple blood pressure measurements on separate occasions. Ambulatory blood pressure monitoring or home blood pressure monitoring may be used for confirmation. The diagnostic threshold is BP >= 130/80 mmHg according to current ACC/AHA guidelines.

## Treatment
Lifestyle modifications are first-line for all patients:
- Dietary changes (DASH diet)
- Regular physical activity
- Weight reduction
- Alcohol moderation
- Smoking cessation

Pharmacological treatment includes:
- Thiazide diuretics
- ACE inhibitors
- ARBs
- Calcium channel blockers
- Beta-blockers

## Medications
First-line antihypertensive medications:
- Lisinopril (ACE inhibitor) - 10-40 mg daily
- Amlodipine (Calcium channel blocker) - 5-10 mg daily
- Hydrochlorothiazide (Thiazide diuretic) - 12.5-25 mg daily
- Metoprolol (Beta-blocker) - 50-200 mg daily
- Losartan (ARB) - 50-100 mg daily

## Complications
Uncontrolled hypertension can lead to:
- Myocardial infarction
- Heart failure
- Stroke
- Chronic kidney disease
- Aortic aneurysm
- Peripheral artery disease
- Visual loss

## Prevention
Prevention strategies include:
- Maintaining healthy weight
- Regular exercise (150 minutes/week)
- Low-sodium diet (< 2,300 mg/day)
- Limiting alcohol consumption
- Managing stress
- Regular health screenings

## ICD-10 Codes
- I10: Essential hypertension
- I11: Hypertensive heart disease
- I12: Hypertensive CKD
- I13: Hypertensive heart and CKD
- I15: Secondary hypertension

## SNOMED Codes
- 38341003: Hypertension
- 59621000: Essential hypertension
- 12350007: Hypertensive heart disease
- 441811008: Hypertensive chronic kidney disease

## Keywords
hypertension, high blood pressure, HTN, antihypertensive, cardiovascular, stroke prevention, DASH diet, ACE inhibitor, ARB, calcium channel blocker

## References
1. Whelton PK, et al. 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. J Am Coll Cardiol. 2018;71(13):e127-e248.
2. Williams B, et al. 2018 ESC/ESH Guidelines for the management of arterial hypertension. Eur Heart J. 2018;39(33):3021-3104.
3. NICE Guideline NG136: Hypertension in adults: diagnosis and management. 2019.
    `,
    fileType: 'txt',
    expectedDisease: 'hypertension',
    expectedSymptoms: ['headaches', 'dizziness', 'blurred vision', 'shortness of breath', 'chest pain', 'palpitations'],
    expectedTreatments: ['dietary changes', 'physical activity', 'weight reduction', 'ACE inhibitors', 'ARBs', 'calcium channel blockers', 'beta-blockers'],
    expectedDiagnosis: ['blood pressure measurement', 'ambulatory blood pressure monitoring', 'home blood pressure monitoring'],
    expectedMedications: ['lisinopril', 'amlodipine', 'hydrochlorothiazide', 'metoprolol', 'losartan'],
    expectedSpecialty: 'cardiology',
  },
  {
    topic: 'Diabetes',
    specialty: 'endocrinology',
    title: 'Type 2 Diabetes Mellitus Management Guidelines',
    content: `
# Type 2 Diabetes Mellitus: Comprehensive Management Guidelines

## Abstract
Type 2 diabetes mellitus (T2DM) is a metabolic disorder characterized by hyperglycemia resulting from insulin resistance and relative insulin deficiency. This guideline covers diagnosis, treatment, and prevention of complications.

## Symptoms
- Polyuria (frequent urination)
- Polydipsia (excessive thirst)
- Polyphagia (increased hunger)
- Unexplained weight loss
- Fatigue
- Blurred vision
- Slow wound healing
- Recurrent infections

## Diagnosis
Diagnostic criteria (ADA 2024):
- Fasting plasma glucose >= 126 mg/dL
- 2-hour plasma glucose >= 200 mg/dL during OGTT
- HbA1c >= 6.5%
- Random plasma glucose >= 200 mg/dL with classic symptoms

## Treatment
Treatment goals:
- HbA1c < 7% for most adults
- Blood pressure < 140/90 mmHg
- LDL cholesterol < 100 mg/dL

First-line therapy:
- Metformin (unless contraindicated)
- Lifestyle modification
- Weight management

Second-line therapy:
- SGLT2 inhibitors
- GLP-1 receptor agonists
- DPP-4 inhibitors
- Sulfonylureas
- Insulin

## Medications
Common antidiabetic medications:
- Metformin - 500-2000 mg daily
- Glipizide (Sulfonylurea) - 5-20 mg daily
- Sitagliptin (DPP-4 inhibitor) - 25-100 mg daily
- Empagliflozin (SGLT2 inhibitor) - 10-25 mg daily
- Liraglutide (GLP-1 agonist) - 0.6-1.8 mg daily
- Insulin glargine - 10-40 units daily

## Complications
- Diabetic retinopathy
- Diabetic nephropathy
- Diabetic neuropathy
- Cardiovascular disease
- Stroke
- Lower extremity amputations
- Diabetic ketoacidosis (DKA)

## Prevention
- Maintain healthy weight
- Regular physical activity
- Balanced diet
- Avoid tobacco use
- Regular screening for at-risk individuals

## ICD-10 Codes
- E11.9: Type 2 diabetes mellitus without complications
- E11.65: Type 2 diabetes with hyperglycemia
- E11.21: Type 2 diabetes with diabetic nephropathy
- E11.42: Type 2 diabetes with diabetic neuropathy

## SNOMED Codes
- 44054006: Type 2 diabetes mellitus
- 422034002: Diabetic retinopathy
- 420493001: Diabetic nephropathy
- 49049000: Diabetic neuropathy

## Keywords
diabetes mellitus, type 2 diabetes, T2DM, hyperglycemia, insulin resistance, metformin, HbA1c, hypoglycemia, diabetic complications, GLP-1 agonist, SGLT2 inhibitor

## References
1. American Diabetes Association. Standards of Medical Care in Diabetes-2024. Diabetes Care. 2024;47(Suppl 1):S1-S321.
2. Davies MJ, et al. Management of Type 2 Diabetes: BSE Position Statement. Diabet Med. 2023.
    `,
    fileType: 'txt',
    expectedDisease: 'diabetes mellitus',
    expectedSymptoms: ['polyuria', 'polydipsia', 'polyphagia', 'weight loss', 'fatigue', 'blurred vision'],
    expectedTreatments: ['metformin', 'lifestyle modification', 'weight management', 'SGLT2 inhibitors', 'GLP-1 agonists'],
    expectedDiagnosis: ['fasting plasma glucose', 'OGTT', 'HbA1c', 'random plasma glucose'],
    expectedMedications: ['metformin', 'glipizide', 'sitagliptin', 'empagliflozin', 'liraglutide', 'insulin'],
    expectedSpecialty: 'endocrinology',
  },
];

export async function createTestDocument(fixture: MedicalDocumentFixture, userId: string): Promise<any> {
  const uploadDir = path.join(process.cwd(), 'tests', 'e2e', 'fixtures');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `e2e-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fixture.fileType}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, fixture.content);

  const fileUrl = `/tests/e2e/fixtures/${fileName}`;
  const fileSize = fs.statSync(filePath).size;

  const document = await prisma.medicalDocument.create({
    data: {
      title: fixture.title,
      description: `${fixture.topic} clinical guidelines`,
      fileName,
      fileUrl,
      fileType: `text/${fixture.fileType}`,
      fileSize,
      specialty: fixture.specialty,
      documentType: 'GUIDELINE',
      source: 'E2E Test Medical Guidelines',
      publicationYear: 2024,
      uploadedById: userId,
      ingestionStatus: IngestionStatus.COMPLETED,
    },
  });

  return document;
}

export async function cleanupTestDocuments(): Promise<void> {
  const fixtureDir = path.join(process.cwd(), 'tests', 'e2e', 'fixtures');
  if (fs.existsSync(fixtureDir)) {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
}

export { MEDICAL_DOCUMENTS };
