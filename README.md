# Arabic Morphological Search Engine & Derivation Generator

محرك البحث الصرفي العربي ومولد المشتقات

## 📋 Project Overview

A comprehensive full-stack web application for Arabic morphological analysis, demonstrating advanced data structures and algorithms. The application manages Arabic roots and patterns to generate word derivatives and validate morphological relationships.

**Key Technologies:**
- **Frontend**: React 18 (Vite) + Tailwind CSS + RTL Support
- **Backend**: Python FastAPI
- **Data Structures**: Custom AVL Tree, Custom Hash Table (with Polynomial Rolling Hash)
- **Language Support**: Full UTF-8 Arabic Character Support

---

## 🎯 Core Features

### 1. **Dashboard**
- Real-time statistics of stored roots and patterns
- AVL Tree height visualization
- Hash table load factor monitoring
- Data structure efficiency metrics

### 2. **Root Management**
- **Add Roots**: Insert trilateral Arabic roots (3 characters)
- **View All**: Display roots in sorted order (AVL in-order traversal)
- **Data Structure**: Self-balancing AVL Tree with automatic rotation

**Algorithm Details:**
- Insert: O(log n) with automatic balancing
- Rotation Methods: Left rotation, Right rotation
- Balance Cases: LL, RR, LR, RL

### 3. **Pattern Management**
- **Add Patterns**: Define morphological patterns (e.g., "FaA3iL" for "فاعل")
- **Pattern Templates**: Use placeholders:
  - `F` = Fa (الفاء - first letter)
  - `A` = Ayn (العين - second letter)
  - `L` = Lam (اللام - third letter)
  - `3` = Ayn (alternative representation)
- **Data Structure**: Hash Table with polynomial rolling hash function

**Algorithm Details:**
- Collision Handling: Chaining (linked list)
- Hash Function: Polynomial rolling hash with prime multiplier (31)
- Load Factor: Monitored for performance
- Operations: O(1) average case

### 4. **Morphological Generator**
Generate Arabic words from roots and patterns

**Example:**
- Root: "كتب" (K-T-B)
- Pattern: "FaA3iL"
- Result: "كاتب" (writer)

**Modes:**
- **Single Generation**: Select root + pattern → Generate word
- **Bulk Generation**: Select root → Generate all derivatives using all patterns

### 5. **Morphological Validator**
Validate if a word can be derived from a given root

**Process:**
- Input: Word + Suspected Root
- Brute Force: Apply root to all available patterns
- Output: True/False + Pattern used (if valid)

**Example:**
- Word: "كاتب"
- Root: "كتب"
- Result: Valid ✓ (Pattern: "FaA3iL")

---

## 📁 Project Structure

```
Algo Arabe/
├── backend/
│   ├── main.py              # FastAPI application & endpoints
│   ├── avl.py               # AVL Tree implementation
│   ├── hashtable.py         # Hash Table with chaining
│   ├── morphology.py        # Morphological engine logic
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── data/                # JSON persistence (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx          # Stats & overview
│   │   │   ├── RootsManager.jsx       # Root management UI
│   │   │   ├── PatternsManager.jsx    # Pattern management UI
│   │   │   ├── MorphologicalGenerator.jsx
│   │   │   ├── MorphologicalValidator.jsx
│   │   │   └── Sidebar.jsx            # Navigation
│   │   ├── hooks/
│   │   │   └── useDashboard.js        # Dashboard data hook
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles (RTL support)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python -m uvicorn main:app --reload
   ```

   Server will start at: `http://localhost:8000`
   API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

---

## 📚 API Endpoints

### Dashboard
- `GET /api/stats` - Get statistics (roots count, patterns count, etc.)
- `GET /api/health` - Health check

### Root Management
- `POST /api/roots/add` - Add new root
- `GET /api/roots/all` - Get all roots (sorted)
- `GET /api/roots/search/{root}` - Search for specific root

### Pattern Management
- `POST /api/patterns/add` - Add new pattern
- `GET /api/patterns/all` - Get all patterns
- `GET /api/patterns/{pattern_name}` - Get specific pattern
- `DELETE /api/patterns/{pattern_name}` - Delete pattern

### Morphological Operations
- `POST /api/generator/generate` - Generate word from root + pattern
- `POST /api/generator/derivatives` - Generate all derivatives for a root
- `POST /api/validator/validate` - Validate word against root

---

## 🔐 Data Persistence

- **Format**: JSON files
- **Location**: `backend/data/`
- **Auto-save**: Data is saved after each operation
- **Auto-load**: Data is loaded on server startup

### Files:
- `roots.json` - All stored roots
- `patterns.json` - All stored patterns

---

## 🎨 UI/UX Features

### RTL (Right-to-Left) Support
- Full Arabic text support
- Proper text direction handling
- Tailwind CSS RTL utilities
- Amiri font for authentic Arabic typography

### Design
- Clean, academic but modern interface
- Responsive layout (mobile, tablet, desktop)
- Color-coded sections for different features
- Icon-based navigation
- Real-time statistics

### Components
- Form validation with error messages
- Success/failure notifications
- Loading states
- Sidebar navigation
- Mobile-friendly menu

---

## 🧮 Algorithm Details

### AVL Tree Implementation

**Operations:**
```python
# Insert with automatic balancing
avl_tree.insert("كتب")

# Search
found = avl_tree.search("كتب")

# Get all roots in order
roots = avl_tree.in_order_traversal()

# Get height
height = avl_tree.get_height()
```

**Balancing Rotations:**
- **Left Rotation**: When right subtree is heavy
- **Right Rotation**: When left subtree is heavy
- **Left-Right**: Left then right rotation
- **Right-Left**: Right then left rotation

**Time Complexity:**
- Insert: O(log n)
- Search: O(log n)
- Traversal: O(n)
- All operations: Self-balancing

### Hash Table Implementation

**Hash Function:**
```python
hash = (char1 * 31^(k-1) + char2 * 31^(k-2) + ... + char_k) % MOD
```

**Features:**
- Polynomial rolling hash
- Collision handling via chaining (linked lists)
- Dynamic insertion and deletion
- Load factor monitoring

**Time Complexity:**
- Insert: O(1) average, O(n) worst case
- Search: O(1) average, O(n) worst case
- Delete: O(1) average, O(n) worst case

---

## 🌐 Morphological Logic

### Word Generation Algorithm
1. Extract 3 letters from root: F (Fa), A (Ayn), L (Lam)
2. Iterate through pattern template
3. Replace placeholders (F, A, L) with root letters
4. Keep regular characters from pattern

**Example Process:**
```
Root: كتب → [ك, ت, ب]
Pattern: FaA3iL → F=ك, A=ت, L=ب
Template parsing:
  F → ك
  a → a
  A → ت
  3 → ت
  i → i
  L → ب
Result: كاتب
```

### Word Validation Algorithm
1. Get word and suspected root
2. Iterate through all available patterns
3. For each pattern, apply root and check if result matches word
4. If match found, return True + pattern used
5. If no matches, return False

**Complexity:** O(n*m)
- n = number of patterns
- m = pattern length

---

## 📋 Sample Data

### Roots
- كتب (K-T-B) - to write
- درس (D-R-S) - to study
- علم (A-L-M) - to know
- ذهب (DH-H-B) - to go

### Patterns
- FaA3iL - فاعل (active subject)
- MaFAuL - مفعول (passive object)
- FiAL - فعال (general form)
- FaALA - فعلة (one action)

### Generated Examples
- كتب + FaA3iL → كاتب (writer)
- درس + FaA3iL → دارس (student)
- علم + FaA3iL → عالم (scholar)

---

## 🔧 Development Notes

### Adding New Roots
- Must be exactly 3 characters (UTF-8 Arabic)
- Unique within AVL Tree
- Sorted on display via in-order traversal

### Adding New Patterns
- Pattern name: Human-readable label
- Template: F, A, L placeholders + regular characters
- Examples: "FaA3iL", "MaFAuL", "FiAL"

### Extending Functionality
- Add caching layer in Hash Table
- Implement pattern frequency analysis
- Add root family grouping
- Support quadrilateral roots (4+ letters)
- Add diacritics support

---

## ⚠️ Constraints & Design Decisions

✅ **Followed:**
- No SQL/NoSQL database for core logic
- Custom AVL Tree for roots
- Custom Hash Table for patterns
- UTF-8 Arabic character support
- In-memory storage with JSON persistence
- RTL text direction support

✅ **Implemented:**
- Full academic algorithms
- Self-balancing tree rotations
- Polynomial rolling hash
- Brute-force validation
- Real-time dashboard

---

## 📝 License

This is an academic project for algorithm demonstration.

---

## 👨‍💻 Development Info

**Stack:**
- Backend: FastAPI, Python 3.8+
- Frontend: React 18, Vite, Tailwind CSS
- Data Structures: AVL Tree, Hash Table with Chaining
- Language: Full RTL/Arabic support

**Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 📞 Support & Documentation

For detailed algorithm documentation, check:
- `backend/avl.py` - AVL Tree implementation details
- `backend/hashtable.py` - Hash Table implementation details
- `backend/morphology.py` - Morphological generation logic
- API documentation: `http://localhost:8000/docs` (Swagger UI)

---

**حظاً موفقاً!** 🎓

Good luck! This project demonstrates core computer science concepts with practical Arabic NLP applications.
