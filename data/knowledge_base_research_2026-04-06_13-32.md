# Knowledge Base Research — AI Agent Data Sources

Created: 2026-04-06 13:32

---

## What the AI Agent Needs

The agent's knowledge base serves 3 purposes:

1. **RAG Knowledge** — Medical context for the LLM (via Pinecone vector DB)
2. **Rule Engine Data** — Structured rules for risk scoring (thresholds, symptom mappings)
3. **Training/Validation Data** — Datasets to test and validate triage accuracy

---

## 1. Clinical Guidelines (RAG Knowledge Base)

The core medical knowledge the agent retrieves during conversations.

### ADA Standards of Care 2026

- **What**: The definitive clinical practice guidelines for diabetes care — diagnosis criteria, screening protocols, treatment goals, classification
- **Use**: Primary source for RAG. Chunk and embed into Pinecone for retrieval during triage.
- **Where to find**:
  - Official: https://professional.diabetes.org/standards-of-care
  - Full 2026 publication: https://diabetesjournals.org/care/article/49/Supplement_1/S6/163930/Summary-of-Revisions-Standards-of-Care-in-Diabetes
  - Summary: https://www.guidelinecentral.com/guideline/14119/
  - Overview: https://diatribe.org/diabetes-management/your-guide-2026-ada-standards-care

### Key Screening Criteria (from ADA 2026)

- Fasting Plasma Glucose (FPG): >= 126 mg/dL → diabetes
- 2-hour Plasma Glucose (OGTT): >= 200 mg/dL → diabetes
- HbA1c: >= 6.5% → diabetes
- Random glucose >= 200 mg/dL + classic symptoms → diabetes
- Prediabetes: FPG 100-125 mg/dL, HbA1c 5.7-6.4%

### Diabetes Emergency Protocols

- **What**: DKA, HHS, and hypoglycemia recognition criteria and triage rules
- **Use**: Feed into both RAG (for context) and Rule Engine (for emergency detection guardrail)
- **Where to find**:
  - Diabetic emergencies in urgent care: https://www.jucm.com/diabetic-emergencies-in-the-urgent-care-setting/
  - DKA consensus report: https://diabetesjournals.org/care/article/47/8/1257/156808/Hyperglycemic-Crises-in-Adults-With-Diabetes-A
  - DKA StatPearls (NIH): https://www.ncbi.nlm.nih.gov/books/NBK560723/
  - Hyperglycemic crises (NIH): https://www.ncbi.nlm.nih.gov/books/NBK279052/
  - Saudi MOH diabetes emergency guidelines (PDF): https://www.moh.gov.sa/Documents/Diabetes-Emergencies.pdf

### Emergency Thresholds to Extract

| Condition | Criteria | Triage Level |
|-----------|----------|-------------|
| DKA | Blood glucose > 250 mg/dL + pH < 7.3 + bicarbonate < 15 mEq/L + ketones | RED |
| HHS | Blood glucose > 600 mg/dL + altered mental status | RED |
| Severe Hypoglycemia | Blood glucose < 50 mg/dL | RED |
| Hypoglycemia | Blood glucose < 60 mg/dL | RED |
| Symptomatic hyperglycemia | Blood glucose > 300 mg/dL + symptoms | RED |
| Moderate symptoms | Polyuria + polydipsia + fatigue, recent onset | YELLOW |
| Mild/chronic symptoms | Mild fatigue, known diabetic, stable | GREEN |

---

## 2. Symptom-Disease Mapping Datasets (Rule Engine + Validation)

### Symptom-Disease Dataset (Hugging Face)

- **What**: Mapping of symptoms to diseases including diabetes-related conditions
- **Use**: Build symptom → risk mapping rules. Validate agent's symptom extraction accuracy.
- **Where**: https://huggingface.co/datasets/dux-tecblic/symptom-disease-dataset
- **Format**: CSV/structured, can be filtered for diabetes-relevant entries

### Pima Indians Diabetes Dataset (Kaggle/UCI)

- **What**: 768 patient records with 8 diagnostic features (glucose, BMI, insulin, age, etc.) + diabetes outcome
- **Use**: Validate risk scoring model. Understand feature importance for diabetes prediction.
- **Where**: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database
- **Features**: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age
- **Limitation**: Only Pima Indian females 21+. Use for validation, not as sole training data.

### Diabetes Health Indicators Dataset

- **What**: Healthcare statistics + lifestyle survey data with 35 features including demographics, lab results, and survey responses
- **Use**: Broader risk factor understanding. Supplement rule engine with lifestyle-based scoring.
- **Where**: Available on Kaggle (CDC BRFSS survey data)

### Medical Question-Answering Datasets (Hugging Face)

- **What**: Medical Q&A pairs covering various conditions
- **Use**: Test and evaluate the agent's conversational accuracy
- **Where**: https://huggingface.co/datasets/Malikeh1375/medical-question-answering-datasets

---

## 3. Medical Knowledge for RAG Embeddings

Documents to chunk, embed, and store in Pinecone for retrieval.

### Sources to Embed

| Source | Content | Priority |
|--------|---------|----------|
| ADA Standards of Care 2026 | Full clinical guidelines | HIGH |
| DKA/HHS/Hypoglycemia protocols | Emergency recognition & response | HIGH |
| WHO Diabetes Fact Sheets | General diabetes overview, types, complications | MEDIUM |
| CDC Diabetes Prevention Program | Lifestyle intervention, prevention tips | MEDIUM |
| Patient education materials (ADA) | Plain-language diabetes awareness content | MEDIUM |
| Drug interaction guides | Common diabetes medications & side effects | LOW (Phase 2) |

### Where to Get Patient Education Content

- ADA Patient Resources: https://diabetes.org/
- CDC Diabetes: https://www.cdc.gov/diabetes/
- WHO Diabetes: https://www.who.int/health-topics/diabetes
- NIH NIDDK: https://www.niddk.nih.gov/health-information/diabetes

---

## 4. Diabetes-Specific Symptom List (For Agent's Extraction)

The `extract_symptoms` tool needs to recognize these:

### Primary Diabetes Symptoms
- Polyuria (frequent urination)
- Polydipsia (excessive thirst)
- Polyphagia (excessive hunger)
- Unexplained weight loss
- Fatigue / lethargy
- Blurred vision
- Slow-healing wounds/sores
- Frequent infections
- Numbness/tingling in hands/feet
- Dry skin / itching

### Emergency Symptoms (Trigger RED immediately)
- Fruity breath odor (DKA indicator)
- Nausea/vomiting + high blood sugar
- Confusion / altered mental status
- Rapid/deep breathing (Kussmaul breathing)
- Loss of consciousness
- Seizures
- Chest pain + diabetes symptoms
- Blood glucose self-reported > 300 mg/dL
- Blood glucose self-reported < 60 mg/dL

### Risk Amplifiers (Increase severity score)
- Age > 60
- Known diabetes diagnosis + new symptoms
- Medication non-adherence
- Multiple symptoms simultaneously
- Symptom duration > 2 weeks without improvement
- Family history of diabetes complications
- Pregnancy + diabetes symptoms (gestational risk)

---

## 5. Rule Engine Data Structure

How to organize the data for the `calculate_risk_score` tool:

```
/data
  /rules
    symptom_risk_mapping.json     ← symptom → severity weight
    emergency_keywords.json       ← trigger words for RED override
    threshold_rules.json          ← numeric thresholds (glucose, etc.)
    risk_amplifiers.json          ← factors that increase score
  /knowledge
    ada_guidelines/               ← chunked ADA 2026 content for RAG
    emergency_protocols/          ← DKA, HHS, hypoglycemia docs
    patient_education/            ← plain-language content for responses
  /validation
    pima_diabetes.csv             ← Pima dataset for testing
    symptom_disease_mapping.csv   ← symptom-disease pairs for validation
```

---

## 6. Data Collection Action Items

| # | Action | Source | Priority |
|---|--------|--------|----------|
| 1 | Download ADA 2026 Standards of Care (relevant chapters) | professional.diabetes.org | HIGH |
| 2 | Extract emergency thresholds into `threshold_rules.json` | NIH/ADA emergency protocols | HIGH |
| 3 | Build `symptom_risk_mapping.json` from symptom list above | Manual + ADA guidelines | HIGH |
| 4 | Build `emergency_keywords.json` from emergency symptoms list | Manual | HIGH |
| 5 | Download Pima diabetes dataset for validation | Kaggle | MEDIUM |
| 6 | Download symptom-disease dataset from Hugging Face | Hugging Face | MEDIUM |
| 7 | Collect patient education content (CDC, WHO, ADA) | Public sources | MEDIUM |
| 8 | Chunk and prepare documents for Pinecone embedding | All knowledge sources | MEDIUM |
| 9 | Build `risk_amplifiers.json` from risk amplifier list | Manual + guidelines | MEDIUM |

---

## Sources

- [ADA Standards of Care 2026](https://professional.diabetes.org/standards-of-care)
- [ADA 2026 Summary of Revisions](https://diabetesjournals.org/care/article/49/Supplement_1/S6/163930/Summary-of-Revisions-Standards-of-Care-in-Diabetes)
- [ADA 2026 Diagnosis & Classification](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes)
- [Guide to 2026 ADA Standards](https://diatribe.org/diabetes-management/your-guide-2026-ada-standards-care)
- [Diabetic Emergencies in Urgent Care](https://www.jucm.com/diabetic-emergencies-in-the-urgent-care-setting/)
- [DKA Consensus Report — Diabetes Care](https://diabetesjournals.org/care/article/47/8/1257/156808/Hyperglycemic-Crises-in-Adults-With-Diabetes-A)
- [DKA StatPearls — NIH](https://www.ncbi.nlm.nih.gov/books/NBK560723/)
- [Hyperglycemic Crises — NIH](https://www.ncbi.nlm.nih.gov/books/NBK279052/)
- [LLM Clinical Decision Support — Nature](https://www.nature.com/articles/s41746-025-01684-1)
- [AI in Diabetes Care — Endocrine Practice](https://www.endocrinepractice.org/article/S1530-891X(25)00966-8/abstract)
- [Pima Indians Diabetes Dataset — Kaggle](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database)
- [Symptom-Disease Dataset — Hugging Face](https://huggingface.co/datasets/dux-tecblic/symptom-disease-dataset)
- [Medical QA Dataset — Hugging Face](https://huggingface.co/datasets/Malikeh1375/medical-question-answering-datasets)
- [Awesome Medical Dataset — GitHub](https://github.com/openmedlab/Awesome-Medical-Dataset)
- [Saudi MOH Diabetes Emergency Guidelines](https://www.moh.gov.sa/Documents/Diabetes-Emergencies.pdf)
