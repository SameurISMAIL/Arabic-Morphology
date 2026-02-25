# Deployment & Setup Guide

## 📦 Complete Project Checklist

### ✅ Backend Components
- [x] `avl.py` - AVL Tree with rotations and balancing
- [x] `hashtable.py` - Hash Table with polynomial rolling hash
- [x] `morphology.py` - Morphological engine (generation + validation)
- [x] `main.py` - FastAPI application with all endpoints
- [x] `requirements.txt` - Python dependencies
- [x] `.env` - Environment variables
- [x] `test_suite.py` - Comprehensive tests
- [x] `data/` - Auto-created directory for JSON persistence

### ✅ Frontend Components
- [x] `App.jsx` - Main application component
- [x] `components/Sidebar.jsx` - Navigation menu
- [x] `components/Dashboard.jsx` - Statistics and overview
- [x] `components/RootsManager.jsx` - Root management UI
- [x] `components/PatternsManager.jsx` - Pattern management UI
- [x] `components/MorphologicalGenerator.jsx` - Word generation
- [x] `components/MorphologicalValidator.jsx` - Word validation
- [x] `hooks/useDashboard.js` - Real-time stats hook
- [x] `services/api.js` - API client
- [x] `index.css` - Global styles + RTL support
- [x] `main.jsx` - React entry point
- [x] `index.html` - HTML template
- [x] `package.json` - Dependencies
- [x] `vite.config.js` - Vite configuration
- [x] `tailwind.config.js` - Tailwind CSS config
- [x] `postcss.config.js` - PostCSS config

### ✅ Documentation
- [x] `README.md` - Complete project documentation
- [x] `QUICKSTART.md` - Quick start guide
- [x] `ARCHITECTURE.md` - System architecture details
- [x] `DEPLOYMENT.md` - This file

---

## 🚀 Quick Start (Windows PowerShell)

### Setup Backend
```powershell
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the server
python -m uvicorn main:app --reload
```

**Result:** Backend running at http://localhost:8000

### Setup Frontend (New PowerShell Window)
```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

**Result:** Frontend running at http://localhost:5173

---

## 📝 What to Do First

### After Both Servers Are Running:

1. **Open the Application**
   - Navigate to http://localhost:5173
   - Should see the Arabic interface with RTL support

2. **Add Sample Data**
   - Go to "إدارة الجذور" (Roots Manager)
   - Add roots: كتب, درس, علم, ذهب
   - Go to "إدارة الأنماط" (Patterns Manager)
   - Add pattern: Name="فاعل", Template="FaA3iL"

3. **Generate a Word**
   - Go to "مولد الكلمات" (Generator)
   - Select root: كتب
   - Select pattern: فاعل
   - Click button → See: كاتب

4. **Validate a Word**
   - Go to "محقق الكلمات" (Validator)
   - Word: كاتب
   - Root: كتب
   - Result: Valid ✓

---

## 🔧 Troubleshooting

### Port 8000 Already in Use
```powershell
# Use a different port
python -m uvicorn main:app --reload --port 8001
```
Then update frontend API URL in `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8001/api';
```

### Port 5173 Already in Use
```powershell
npm run dev -- --port 5174
```

### Dependencies Not Installing
```powershell
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
npm cache clean --force
npm install
```

### CORS Errors
- Ensure backend is running on http://localhost:8000
- Check that frontend is making requests to correct URL
- Backend CORS is already configured for localhost

### Unicode/Arabic Characters Not Displaying
- Ensure UTF-8 encoding in all files
- Check that Amiri font is loaded (in index.html)
- Verify browser language settings include Arabic

---

## 📊 Testing the Application

### Run Backend Tests
```powershell
cd backend
python test_suite.py
```

This will:
- Test AVL Tree operations
- Test Hash Table operations
- Test morphological engine
- Verify UTF-8 support
- Run complete workflow

### Manual API Testing

#### Using curl
```powershell
# Add a root
curl -X POST http://localhost:8000/api/roots/add `
  -H "Content-Type: application/json" `
  -d '{\"root\": \"كتب\"}'

# Get all roots
curl http://localhost:8000/api/roots/all

# Generate word
curl -X POST http://localhost:8000/api/generator/generate `
  -H "Content-Type: application/json" `
  -d '{\"root\": \"كتب\", \"pattern_name\": \"فاعل\"}'
```

#### Using Swagger UI
1. Open http://localhost:8000/docs
2. Try out all endpoints interactively
3. See request/response examples

---

## 💾 Data Persistence

### Automatic Saving
- Data is automatically saved to JSON files on every change
- Files located in `backend/data/`

### Files Created
```
backend/data/
├── roots.json      # Array of root strings
└── patterns.json   # Array of pattern objects
```

### Manual Data Management

#### Export Data
```powershell
# Copy the data directory
Copy-Item -Path "backend/data" -Destination "backup" -Recurse
```

#### Restore Data
```powershell
# Copy backup back
Copy-Item -Path "backup/roots.json" -Destination "backend/data/"
Copy-Item -Path "backup/patterns.json" -Destination "backend/data/"
```

#### Clear All Data
```powershell
# Delete the data directory
Remove-Item -Path "backend/data" -Recurse

# Or just clear files
Remove-Item "backend/data/roots.json"
Remove-Item "backend/data/patterns.json"
```

---

## 🏗️ Production Deployment

### Backend Deployment

#### Using Gunicorn (Linux/macOS/WSL)
```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:8000 main:app

# With environment variables
DATABASE_URL=... gunicorn main:app
```

#### Using Docker
```dockerfile
# Dockerfile in backend/
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t arabic-morphology-backend .
docker run -p 8000:8000 arabic-morphology-backend
```

### Frontend Deployment

#### Build for Production
```powershell
cd frontend
npm run build
```

Output in `frontend/dist/` directory

#### Deploy to Vercel
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

#### Deploy to Netlify
```powershell
# Build
npm run build

# Deploy dist/ folder to Netlify
# Or connect GitHub repo for auto-deploy
```

#### Deploy to GitHub Pages
```powershell
# Update vite.config.js
# base: '/repo-name/'

npm run build
# Commit and push dist/ folder
```

### Environment Configuration

#### Backend (.env)
```env
BACKEND_URL=http://localhost:8000
DEBUG=False  # Set to False in production
DATABASE_URL=postgresql://...  # Optional
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.example.com/api
```

---

## 📈 Performance Tuning

### Backend Optimization
```python
# main.py
# Increase pool sizes for more concurrent requests
app.add_middleware(...)

# Enable response compression
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

### Frontend Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',  // Better compression
    sourcemap: false,   // Reduce bundle size
  }
})
```

### Database (Optional Future)
```python
# If adding database
# Use connection pooling
# Implement caching with Redis
# Add query optimization indexes
```

---

## 🔐 Security Checklist

### Current Implementation
- ✓ UTF-8 safe character handling
- ✓ Input validation on API endpoints
- ✓ CORS enabled (development only)
- ✓ Error handling without exposing internals

### For Production
- [ ] Add JWT authentication
- [ ] Enable HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Add request validation schemas
- [ ] Sanitize all user inputs
- [ ] Use environment variables for secrets
- [ ] Add request logging and monitoring
- [ ] Implement CSRF protection
- [ ] Set secure headers (CSP, X-Frame-Options, etc.)

---

## 📚 File Structure Summary

```
Algo Arabe/
│
├── README.md                  # Main documentation
├── QUICKSTART.md             # Quick setup guide
├── ARCHITECTURE.md           # System design details
├── DEPLOYMENT.md             # This file
├── .gitignore                # Git ignore rules
│
├── backend/
│   ├── main.py               # FastAPI app (8 endpoints groups)
│   ├── avl.py                # AVL Tree class
│   ├── hashtable.py          # Hash Table class
│   ├── morphology.py         # Morphological engine
│   ├── test_suite.py         # Comprehensive tests
│   ├── requirements.txt       # Python dependencies
│   ├── .env                  # Environment config
│   └── data/                 # JSON persistence (auto-created)
│       ├── roots.json
│       └── patterns.json
│
└── frontend/
    ├── package.json          # NPM dependencies
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind CSS config
    ├── postcss.config.js     # PostCSS config
    ├── index.html            # HTML template
    ├── .env                  # Frontend env vars
    │
    └── src/
        ├── main.jsx          # React entry
        ├── App.jsx           # App component
        ├── index.css         # Global styles + RTL
        │
        ├── components/       # UI Components
        │   ├── Dashboard.jsx
        │   ├── Sidebar.jsx
        │   ├── RootsManager.jsx
        │   ├── PatternsManager.jsx
        │   ├── MorphologicalGenerator.jsx
        │   └── MorphologicalValidator.jsx
        │
        ├── hooks/            # React hooks
        │   └── useDashboard.js
        │
        ├── services/         # API integration
        │   └── api.js
        │
        └── pages/            # (Optional for expansion)
```

---

## 🎓 For Academic Submission

### Demonstrate These Concepts

1. **AVL Tree Implementation**
   - Run: `python backend/test_suite.py`
   - Show: Insertion, rotation, balance factor
   - Explain: Self-balancing mechanism

2. **Hash Table with Collision Handling**
   - Show: Polynomial rolling hash
   - Demonstrate: Chaining for collisions
   - Explain: Load factor management

3. **Morphological Generation**
   - Show: Root → Pattern → Word mapping
   - Explain: Placeholder replacement logic
   - Demo: Generate multiple derivatives

4. **Morphological Validation**
   - Show: Brute-force pattern matching
   - Explain: Algorithm correctness
   - Demo: Valid and invalid words

5. **Full-Stack Architecture**
   - Show: API endpoint structure
   - Explain: Frontend-backend communication
   - Demo: Complete workflow

6. **RTL & Arabic Support**
   - Show: Interface in Arabic
   - Explain: UTF-8 character handling
   - Demo: Complex Arabic text rendering

---

## ✅ Verification Checklist

Before submission:

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] All 5 main pages load correctly
- [ ] Can add roots (3-character validation works)
- [ ] Can add patterns (template validation works)
- [ ] Can generate words (morphology engine works)
- [ ] Can validate words (pattern matching works)
- [ ] Dashboard shows real-time statistics
- [ ] All text is properly RTL-aligned
- [ ] Arabic fonts render correctly
- [ ] API documentation accessible at /docs
- [ ] Data persists after page reload
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Test suite runs successfully

---

## 🎉 Ready to Present!

Your application is now:

✅ **Algorithmically Sound**
- Custom AVL Tree with rotations
- Custom Hash Table with polynomial hash
- Correct morphological algorithms

✅ **Fully Featured**
- Complete CRUD for roots and patterns
- Word generation and validation
- Real-time statistics dashboard

✅ **Production-Ready**
- Error handling and validation
- Data persistence
- Clean API design

✅ **User-Friendly**
- Professional UI with Tailwind
- Full RTL support for Arabic
- Responsive mobile design
- Clear navigation

✅ **Well-Documented**
- README with complete overview
- QUICKSTART for setup
- ARCHITECTURE for deep dive
- Inline code comments

Good luck with your presentation! 🎓

---

## 📞 Support

For issues:
1. Check QUICKSTART.md troubleshooting section
2. Review ARCHITECTURE.md for design details
3. Run test_suite.py to verify components
4. Check browser console for frontend errors
5. Check terminal for backend errors

Happy coding! حظاً موفقاً! 🚀
