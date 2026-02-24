# Architecture & Implementation Details

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Dashboard │ Roots │ Patterns │ Generator │ Validator  │ │
│  └────────────────────────────────────────────────────────┘ │
│                     ↓ (HTTP Requests)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Vite Dev Server (Port 5173)                 │ │
│  │      Tailwind CSS + RTL Support + Lucide Icons         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FastAPI Server (Port 8000)                │ │
│  │         CORS Enabled │ Swagger Docs at /docs           │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Core Data Structures (In-Memory)               │ │
│  │  ┌──────────────────┐      ┌──────────────────────┐   │ │
│  │  │    AVL Tree      │      │    Hash Table        │   │ │
│  │  │  (Self-Balancing)│      │  (Polynomial Hash)   │   │ │
│  │  │                  │      │                      │   │ │
│  │  │ - insert()       │      │ - put()              │   │ │
│  │  │ - search()       │      │ - get()              │   │ │
│  │  │ - traversal()    │      │ - delete()           │   │ │
│  │  │ - rotate_left()  │      │ - get_all()          │   │ │
│  │  │ - rotate_right() │      │ - exists()           │   │ │
│  │  └──────────────────┘      └──────────────────────┘   │ │
│  │              ↓                     ↓                    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │    Morphological Engine                          │  │ │
│  │  │  - apply_root_to_pattern()                       │  │ │
│  │  │  - validate_word()                               │  │ │
│  │  │  - generate_derivatives()                        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           JSON File Persistence                        │ │
│  │  - data/roots.json (Array of root strings)            │ │
│  │  - data/patterns.json (Array of pattern objects)      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Adding a Root
```
User Input (3 chars)
    ↓
React Form Component
    ↓
API POST /api/roots/add
    ↓
FastAPI Endpoint (add_root)
    ↓
AVLTree.insert()
    ├─ Create new node
    ├─ Calculate balance factor
    ├─ Perform rotations if needed
    └─ Update height
    ↓
save_data() → roots.json
    ↓
Response (success + count)
    ↓
Dashboard Update (stats refresh)
```

### 2. Generating a Word
```
User Selection (Root + Pattern)
    ↓
React Component
    ↓
API POST /api/generator/generate
    ↓
FastAPI Endpoint (generate_word)
    ├─ Verify root exists in AVL Tree
    ├─ Get pattern template from Hash Table
    └─ Call MorphologicalEngine
        ↓
        apply_root_to_pattern()
        ├─ Extract F, A, L from root
        ├─ Iterate pattern template
        ├─ Replace placeholders
        └─ Return generated word
    ↓
Response (word + metadata)
    ↓
Large Arabic Font Display
```

### 3. Validating a Word
```
User Input (Word + Suspected Root)
    ↓
React Form Component
    ↓
API POST /api/validator/validate
    ↓
FastAPI Endpoint (validate_word)
    ├─ Verify root exists in AVL Tree
    └─ Get all patterns from Hash Table
        ↓
        MorphologicalEngine.validate_word()
        ├─ Loop through all patterns
        ├─ For each pattern:
        │  ├─ apply_root_to_pattern()
        │  └─ Compare with input word
        ├─ If match found: return (True, pattern)
        └─ Else: return (False, None)
    ↓
Response (valid + pattern_used)
    ↓
Colored Result Display
```

---

## Key Algorithms

### AVL Tree Self-Balancing

**Insertion with Rotation:**

```python
# 1. Standard BST insertion
insert_node(node, value)

# 2. Update height
node.height = 1 + max(left_height, right_height)

# 3. Calculate balance factor
bf = height(left) - height(right)

# 4. Check balance and perform rotations
if bf > 1:      # Left heavy
    if bf(left) > 0:        # LL case
        rotate_right(node)
    else:                   # LR case
        rotate_left(left)
        rotate_right(node)
elif bf < -1:   # Right heavy
    if bf(right) < 0:       # RR case
        rotate_left(node)
    else:                   # RL case
        rotate_right(right)
        rotate_left(node)
```

**Rotation Example (Right Rotation):**

```
Before:         After:
    P             C
   / \           / \
  C   B  --->   A   P
 / \               / \
A   D             D   B
```

### Polynomial Rolling Hash

**Hash Function:**

```python
hash_value = 0
prime = 31
modulo = 10^9 + 7

for char in pattern_name:
    hash_value = (hash_value * prime + ord(char)) % modulo

final_hash = hash_value % table_size
```

**Example:**

```
Pattern: "فاعل"
- 'ف' (U+0641): hash = 0*31 + 1601 = 1601
- 'ا' (U+0627): hash = 1601*31 + 1575 = 51276
- 'ع' (U+0639): hash = 51276*31 + 1593 = 1589569
- 'ل' (U+0644): hash = 1589569*31 + 1644 = 49276883

final_hash = 49276883 % table_size
```

### Morphological Generation

**Pattern-to-Word Mapping:**

```
Root: "كتب" → [ك, ت, ب]
       F  A  L

Pattern: "FaA3iL"
├─ F → ك (first letter - Fa)
├─ a → a (literal char)
├─ A → ت (second letter - Ayn)
├─ 3 → ت (alternative notation for Ayn)
├─ i → i (literal char)
└─ L → ب (third letter - Lam)

Result: كاتب
```

---

## API Endpoint Specifications

### Root Management Endpoints

**POST /api/roots/add**
```json
Request:
{
  "root": "كتب"
}

Response:
{
  "success": true,
  "message": "Root 'كتب' inserted successfully",
  "total_roots": 5
}
```

**GET /api/roots/all**
```json
Response:
{
  "roots": ["درس", "علم", "كتب"],  // Sorted by AVL
  "count": 3
}
```

**GET /api/roots/search/{root}**
```json
Response:
{
  "root": "كتب",
  "exists": true
}
```

### Pattern Management Endpoints

**POST /api/patterns/add**
```json
Request:
{
  "pattern_name": "فاعل",
  "template": "FaA3iL"
}

Response:
{
  "success": true,
  "message": "Pattern 'فاعل' inserted successfully",
  "total_patterns": 4
}
```

**GET /api/patterns/all**
```json
Response:
{
  "patterns": [
    {"pattern_name": "فاعل", "template": "FaA3iL"},
    {"pattern_name": "مفعول", "template": "MaFAuL"}
  ],
  "count": 2
}
```

### Generator Endpoints

**POST /api/generator/generate**
```json
Request:
{
  "root": "كتب",
  "pattern_name": "فاعل"
}

Response:
{
  "success": true,
  "message": "Word generated successfully",
  "root": "كتب",
  "pattern_name": "فاعل",
  "template": "FaA3iL",
  "word": "كاتب"
}
```

**POST /api/generator/derivatives**
```json
Request:
{
  "root": "كتب"
}

Response:
{
  "success": true,
  "root": "كتب",
  "derivatives": [
    {
      "pattern_name": "فاعل",
      "template": "FaA3iL",
      "generated_word": "كاتب"
    }
  ],
  "count": 1
}
```

### Validator Endpoint

**POST /api/validator/validate**
```json
Request:
{
  "word": "كاتب",
  "root": "كتب"
}

Response:
{
  "success": true,
  "word": "كاتب",
  "root": "كتب",
  "is_valid": true,
  "pattern_used": "فاعل",
  "message": "Word 'كاتب' is valid for root 'كتب'"
}
```

---

## Component Hierarchy

```
App
├── Sidebar
│   └── Navigation Menu
├── Dashboard
│   ├── StatCard (4x)
│   ├── AVL Info Box
│   └── Hash Table Info Box
├── RootsManager
│   ├── Form (Input)
│   ├── Messages (Success/Error)
│   └── RootsList (Grid)
├── PatternsManager
│   ├── Form (2x Input)
│   ├── Messages
│   └── PatternsTable
├── MorphologicalGenerator
│   ├── ModeSelector
│   ├── Form (Selects)
│   ├── ResultCard (Large Arabic)
│   └── DerivativesList (Grid)
└── MorphologicalValidator
    ├── Form (Input + Select)
    ├── ResultCard (Valid/Invalid)
    └── PatternInfo
```

---

## State Management

### Backend State
- **AVL Tree**: Global instance, persists in `roots.json`
- **Hash Table**: Global instance, persists in `patterns.json`
- **Data Flow**: Load on startup, update in-memory, save to JSON on changes

### Frontend State
- **Active Tab**: Component state (which page to display)
- **Form Data**: Local component state (input fields)
- **Results**: Local component state (display after API call)
- **Real-time Stats**: Hook state (useDashboard - 2s refresh)

---

## Performance Optimizations

### Backend
1. **In-memory operations**: O(log n) for AVL, O(1) for Hash
2. **Minimal file I/O**: JSON save only on data changes
3. **No database overhead**: Direct data structure operations

### Frontend
1. **Component memoization**: Prevents unnecessary re-renders
2. **Debounced API calls**: Forms wait for user completion
3. **Lazy loading**: Components render on demand
4. **CSS optimization**: Tailwind purging in production

---

## Error Handling

### Backend Validation
```python
# Root validation
if not root or len(root) != 3:
    return {"success": False, "message": "Root must be exactly 3 characters"}

# Pattern validation
if not pattern_name or not template:
    return {"success": False, "message": "Pattern name and template required"}
```

### Frontend Error Display
```jsx
{error && (
  <div className="flex items-center gap-2 text-danger">
    <AlertCircle className="w-5 h-5" />
    <span>{error}</span>
  </div>
)}
```

---

## Testing Strategy

### Unit Tests
- `test_avl_tree()`: Insert, search, traversal, rotations
- `test_hash_table()`: Put, get, delete, all operations
- `test_morphology()`: Generation, validation
- `test_utf8_support()`: Arabic character handling

### Integration Tests
- Complete workflows: Add root → Add pattern → Generate → Validate
- API endpoint testing with sample data
- RTL rendering verification

### Performance Tests
- AVL insertion time: O(log n)
- Hash lookup time: O(1) average
- Morphological generation speed

---

## Security Considerations

### Current Implementation
- No authentication (academic project)
- Basic input validation
- CORS enabled for development
- UTF-8 safe string handling

### For Production
- Add JWT authentication
- Implement rate limiting
- Add SQL injection prevention
- Sanitize all user inputs
- Use HTTPS only
- Add request logging

---

## UTF-8 Arabic Character Handling

### Frontend
- All components use `className="arabic-text"` for Arabic
- Amiri font loaded from Google Fonts
- `dir="rtl"` set on HTML root
- Text direction CSS properties

### Backend
- All string operations use UTF-8 encoding
- `json.dump(..., ensure_ascii=False)` for proper JSON
- Unicode character codes handled correctly
- No ASCII assumptions

### Example
```python
root = "كتب"
for char in root:
    print(f"{char}: U+{ord(char):04X}")

# Output:
# ك: U+0643
# ت: U+062A
# ب: U+0628
```

---

## Deployment Considerations

### Backend Deployment
```bash
# Production server
gunicorn -w 4 -b 0.0.0.0:8000 main:app

# With environment variables
DATABASE_URL=... CORS_ORIGINS=... gunicorn main:app
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Output in dist/ directory
# Deploy to Vercel, Netlify, or any static host
```

### Docker Support
```dockerfile
# Backend Dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

---

## Future Enhancements

### Short-term
1. Add diacritics support
2. Implement pattern frequency analysis
3. Add root family grouping
4. Create pattern builder UI

### Medium-term
1. Support quadrilateral roots (4+ letters)
2. Add user authentication
3. Implement database backend (optional)
4. Create mobile app (React Native)

### Long-term
1. Machine learning for pattern prediction
2. Full Arabic NLP pipeline
3. Dictionary integration
4. Offline mode support

---

This architecture ensures:
✅ Clean separation of concerns
✅ Scalable component structure
✅ Efficient data structures
✅ Full RTL support
✅ Educational value
✅ Easy to extend and modify

