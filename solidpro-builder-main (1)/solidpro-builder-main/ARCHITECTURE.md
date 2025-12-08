# PDF Storage Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface                              │
│                      (ResumeForm.tsx)                               │
└────────────┬────────────────────────────────────┬───────────────────┘
             │                                    │
             │ 1. Click "Generate PDF"            │ 4. Click "Save Resume"
             │                                    │
             ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│   generatePdf()         │          │  handleSaveResume()     │
│                         │          │                         │
│  - Validates form       │          │  - Calls saveResume()   │
│  - Calls pdfUtils       │          │  - Passes pdfUrl        │
└────────┬────────────────┘          └────────┬────────────────┘
         │                                    │
         │ 2. Generate & Upload               │ 5. Save to DB
         │                                    │
         ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│  generateResumePdf()    │          │   saveResume()          │
│  (pdfUtils.ts)          │          │   (resumeService.ts)    │
│                         │          │                         │
│  - Creates PDF          │          │  - Inserts resume data  │
│  - Returns blob         │          │  - Includes pdf_url     │
│  - Downloads for user   │          │  - Returns resume ID    │
└────────┬────────────────┘          └────────┬────────────────┘
         │                                    │
         │ 3. Upload blob                     │ 6. Database write
         │                                    │
         ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│ uploadPdfToStorage()    │          │   Supabase Database     │
│ (storageService.ts)     │          │                         │
│                         │          │  resumes table:         │
│  - Uploads to bucket    │          │  - id                   │
│  - Returns public URL   │          │  - full_name            │
└────────┬────────────────┘          │  - email                │
         │                           │  - ...                  │
         │                           │  - pdf_url ✨ NEW       │
         ▼                           └─────────────────────────┘
┌─────────────────────────┐
│  Supabase Storage       │
│                         │
│  resume-pdfs bucket:    │
│  - timestamp_file.pdf   │
│  - Public read access   │
└─────────────────────────┘
```

## Data Flow

### 1. PDF Generation Flow
```
User fills form
    ↓
Clicks "Generate PDF"
    ↓
ResumeForm.generatePdf()
    ↓
pdfUtils.generateResumePdf()
    ↓
html2pdf.js creates PDF
    ↓
Returns { blob, filename }
    ↓
Downloads to user's computer
```

### 2. Storage Upload Flow
```
PDF blob received
    ↓
storageService.uploadPdfToStorage()
    ↓
Creates unique filename
    ↓
Uploads to Supabase Storage
    ↓
Returns public URL
    ↓
Stores in component state (lastGeneratedPdfUrl)
    ↓
Shows success message
```

### 3. Database Save Flow
```
User clicks "Save Resume"
    ↓
ResumeForm.handleSaveResume()
    ↓
resumeService.saveResume(data, pdfUrl)
    ↓
Transforms data to DB format
    ↓
Adds pdf_url to payload
    ↓
Inserts into Supabase
    ↓
Returns resume ID
    ↓
Shows success message
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                     ResumeForm Component                     │
│                                                              │
│  State:                                                      │
│  - resumeData: ResumeData                                   │
│  - lastGeneratedPdfUrl: string | null  ✨ NEW              │
│  - isGenerating: boolean                                    │
│  - isSaving: boolean                                        │
│                                                              │
│  Methods:                                                    │
│  - generatePdf() ✨ UPDATED                                │
│  - handleSaveResume() ✨ UPDATED                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   pdfUtils.ts   │  │storageService.ts│  │resumeService.ts │
│                 │  │                 │  │                 │
│ generateResume  │  │ uploadPdfTo     │  │ saveResume()    │
│ Pdf() ✨ NEW    │  │ Storage() ✨NEW │  │ ✨ UPDATED      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Supabase API   │
                    │                 │
                    │  - Storage      │
                    │  - Database     │
                    └─────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      resumes table                          │
├─────────────────────────────────────────────────────────────┤
│ id                UUID PRIMARY KEY                          │
│ created_at        TIMESTAMPTZ                               │
│ updated_at        TIMESTAMPTZ                               │
│ full_name         TEXT NOT NULL                             │
│ email             TEXT NOT NULL                             │
│ phone             TEXT                                      │
│ linkedin          TEXT                                      │
│ location          TEXT                                      │
│ summary           TEXT                                      │
│ skills            TEXT[]                                    │
│ work_experience   JSONB                                     │
│ projects          JSONB                                     │
│ education         JSONB                                     │
│ certifications    JSONB                                     │
│ pdf_url           TEXT  ✨ NEW COLUMN                       │
└─────────────────────────────────────────────────────────────┘
```

## Storage Structure

```
Supabase Storage
│
└── resume-pdfs (bucket)
    │
    ├── 1733649600000_John_Doe_Resume.pdf
    ├── 1733649700000_Jane_Smith_Resume.pdf
    │
    └── {resumeId}/ (optional organization)
        ├── 1733649800000_Resume_v1.pdf
        └── 1733649900000_Resume_v2.pdf
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Storage Policies                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Public Read:                                               │
│  ✓ Anyone can view/download PDFs                           │
│  ✓ Good for sharing resumes publicly                       │
│                                                             │
│  Authenticated Upload:                                      │
│  ✓ Only logged-in users can upload                         │
│  ✓ Prevents anonymous spam                                 │
│                                                             │
│  Authenticated Update/Delete:                               │
│  ✓ Only logged-in users can modify                         │
│  ✓ Prevents unauthorized changes                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
PDF Generation
    ↓
Try to generate
    ├─ Success → Continue to upload
    └─ Error → Show error toast, stop process
         ↓
Upload to Storage
    ├─ Success → Save URL to state, show success
    └─ Error → Show warning, PDF still downloaded
         ↓
Save to Database
    ├─ Success → Show success, return resume ID
    └─ Error → Show error, data not saved
```

## State Management

```
Component State Flow:

Initial State:
- lastGeneratedPdfUrl: null
- isGenerating: false
- isSaving: false

After PDF Generation:
- lastGeneratedPdfUrl: "https://...storage.../file.pdf"
- isGenerating: false
- isSaving: false

After Save:
- lastGeneratedPdfUrl: "https://...storage.../file.pdf"
- isGenerating: false
- isSaving: false
- Resume saved with PDF URL in database
```

## API Calls Timeline

```
Time  │ Action                    │ API Call
──────┼───────────────────────────┼─────────────────────────────
0ms   │ User clicks Generate PDF  │ None
100ms │ Generating PDF locally    │ None (client-side)
2000ms│ PDF generated             │ None
2100ms│ Upload to storage         │ POST /storage/v1/object/resume-pdfs
3000ms│ Upload complete           │ Response: { publicUrl }
3100ms│ Update state              │ None
      │                           │
Later │ User clicks Save Resume   │ None
+100ms│ Save to database          │ POST /rest/v1/resumes
+500ms│ Save complete             │ Response: { id, ...data }
+600ms│ Show success              │ None
```
