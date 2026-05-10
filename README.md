# 🏥 MediShield AI – AI-Assisted Medical Safety & Anonymous Learning Platform

MediShield AI is an AI-powered medical safety verification platform designed to reduce diagnostic errors, improve accountability, and enable continuous anonymous learning in healthcare systems.

The platform acts as an intelligent **AI second-opinion safety layer** that helps doctors verify diagnoses, medicines, and medical reports before final submission, reducing risks caused by human oversight.

---

# 🚀 Problem Statement

Medical misdiagnosis, prescription mistakes, and overlooked reports can lead to severe patient consequences.

Doctors often work under:

- High workload
- Time pressure
- Incomplete patient information
- Diagnostic uncertainty

MediShield AI introduces an **AI verification layer** that:

✅ Reviews doctor diagnosis notes  
✅ Reviews prescribed medicines  
✅ Extracts and analyzes uploaded medical reports  
✅ Flags potential inconsistencies  
✅ Generates risk alerts  
✅ Encourages anonymous medical learning

---

# ✨ Features

## 👨‍⚕️ Doctor Authentication System

Secure doctor registration and login using:

- Hospital ID
- Email
- Password authentication

### Authentication Flow

1. Hospital provides unique doctor ID
2. Doctor registers using hospital ID
3. Secure login system
4. Protected dashboard access

---

## 🩺 AI-Powered Medical Report Verification

Doctors can submit reports that include:

### 1. Doctor Diagnosis & Notes

The doctor enters:

- Diagnosis reasoning
- Observations
- Suspected condition
- Treatment plan
- Medical notes

This information is sent to the AI engine for medical verification.

---

### 2. Medicine Given

Doctors enter prescribed medicines.

The AI evaluates:

- Medication relevance
- Prescription consistency
- Possible mismatches with diagnosis
- Risk indicators

---

### 3. Uploaded Medical Files

Doctors can upload:

- PDF reports
- Medical documents
- Scans
- Lab reports
- Test results

The system:

1. Extracts text from uploaded medical files
2. Converts reports into readable text
3. Sends extracted content to AI
4. Performs diagnosis consistency verification

---

## 🤖 AI Safety Verification

The AI analyzes:

- Doctor diagnosis notes
- Medicines prescribed
- Uploaded medical report text

The platform checks for:

- Diagnostic inconsistencies
- Medicine mismatch
- Missing information
- Potential risks
- Medical confidence level

---

## 🚨 AI Risk Alerts

The system generates intelligent alerts for:

- High-risk diagnosis
- Prescription conflicts
- Missing report information
- Suspicious inconsistencies
- Critical medical concerns

Doctors receive immediate warnings before final report submission.

---

## 📊 Dashboard Analytics

Interactive dashboard for:

- Reports submitted
- AI alerts
- Verification history
- Medical safety insights
- Report tracking

---

## 🔒 Privacy & Anonymous Learning

To encourage safer healthcare systems:

- Reports can be anonymized
- Learning insights are privacy-safe
- Patterns help improve medical decision-making
- Patient identities remain protected

Without exposing sensitive patient information.

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Multer (File Upload)

## AI Layer

- LLM-powered medical verification
- Diagnosis consistency analysis
- Prescription validation
- Medical report analysis

## File Processing

- OCR/Text Extraction
- PDF Parsing
- Medical document preprocessing

---

# 📂 Project Structure

```txt
MediShield-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .env
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/medishield-ai.git
cd medishield-ai
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 3. Install Backend Dependencies

```bash
cd backend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside `backend/`

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GROQ_API_KEY=your_api_key
```

---

# ▶️ Running the Project

## Start Backend

```bash
cd backend
npm run dev
```

If `dev` script is unavailable:

```bash
node server.js
```

---

## Start Frontend

```bash
cd frontend
npm run dev
```

---

# 🌐 Application Workflow

## Step 1: Doctor Login

Doctor logs into the platform using:

- Hospital ID
- Email
- Password

---

## Step 2: Submit Report

Doctor enters:

### Diagnosis & Notes

Medical observations and suspected condition.

### Medicine Given

Prescribed medicine list.

### Upload Medical File

Medical report or document upload.

---

## Step 3: AI Analysis

The system:

1. Converts uploaded medical files into text
2. Sends:
   - Doctor diagnosis
   - Medicine details
   - Extracted medical report text

To the AI verification engine.

---

## Step 4: Verification Result

AI generates:

- Risk level
- Diagnosis confidence
- Prescription validation
- Medical warning alerts
- Safety recommendations

---

## Step 5: Dashboard Monitoring

Doctors can monitor:

- Verification history
- Alerts
- Submitted reports
- Safety insights

---

# 🧠 Future Improvements

- Multi-AI model verification
- Hospital admin dashboard
- Doctor performance analytics
- Explainable AI recommendations
- Voice-to-text diagnosis entry
- Multi-language support
- Real-time emergency alerts
- Medical knowledge graph integration

---

# 🏆 Why MediShield AI?

### ✅ Patient Safety

Reduce avoidable medical errors before they happen.

### ✅ Doctor Support

Assist doctors with an intelligent second-opinion system.

### ✅ Anonymous Learning

Enable healthcare systems to learn safely without blame culture.

### ✅ Scalable Healthcare AI

Deployable in hospitals, clinics, and telemedicine systems.

---

# 📸 Screenshots

Add screenshots here.

### Login Page

```txt
/screenshots/login.png
```

### Submit Report Page

```txt
/screenshots/submit-report.png
```

### Dashboard

```txt
/screenshots/dashboard.png
```

### AI Alerts

```txt
/screenshots/alerts.png
```

---

# 👥 Contributors

- Your Name
- Team Members

---

# 📜 License

This project is built for educational, research, and hackathon purposes.

---

# 💡 Vision

### **"Safer Diagnoses. Smarter Decisions. Better Healthcare."**

MediShield AI aims to become the intelligent medical safety layer that helps doctors reduce risk, improve accountability, and deliver better patient outcomes.
