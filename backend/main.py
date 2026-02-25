"""
FastAPI Backend for Arabic Morphological Search Engine
Exposes endpoints for root management, pattern management, and morphological operations
"""

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

from avl import AVLTree
from hashtable import HashTable
from morphology import MorphologicalEngine


# Initialize FastAPI app
app = FastAPI(
    title="Arabic Morphological Search Engine",
    description="A full-stack application for Arabic morphological analysis",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data structures
avl_tree = AVLTree()
hash_table = HashTable()

# File paths for persistence
DATA_DIR = "data"
ROOTS_FILE = os.path.join(DATA_DIR, "roots.json")
PATTERNS_FILE = os.path.join(DATA_DIR, "patterns.json")

# Ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)


# Pydantic models
class RootRequest(BaseModel):
    root: str


class RootUpdateRequest(BaseModel):
    old_root: str
    new_root: str


class PatternRequest(BaseModel):
    template: str


class PatternUpdateRequest(BaseModel):
    old_template: str
    new_template: str


class GeneratorRequest(BaseModel):
    root: str
    template: str


class GeneratorMultiRequest(BaseModel):
    root: str
    templates: List[str]


class ValidatorRequest(BaseModel):
    word: str
    root: str


class StatsResponse(BaseModel):
    total_roots: int
    total_patterns: int
    avl_height: int
    hash_load_factor: float


# ==================== Utility Functions ====================

def is_arabic_text(text: str) -> bool:
    """Check if text contains only Arabic letters"""
    if not text:
        return False
    
    # Arabic Unicode ranges:
    # Basic Arabic: U+0600 to U+06FF
    # Arabic Supplement: U+0750 to U+077F
    # Arabic Extended-A: U+08A0 to U+08FF
    for char in text:
        code = ord(char)
        if not ((0x0600 <= code <= 0x06FF) or 
                (0x0750 <= code <= 0x077F) or 
                (0x08A0 <= code <= 0x08FF)):
            return False
    return True


def save_data():
    """Save roots and patterns to JSON files"""
    try:
        # Save roots with derived words
        roots_with_words = avl_tree.get_all_roots_with_words()
        with open(ROOTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(roots_with_words, f, ensure_ascii=False, indent=2)
        
        # Save patterns
        patterns = hash_table.get_all_patterns()
        with open(PATTERNS_FILE, 'w', encoding='utf-8') as f:
            json.dump(patterns, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")


def load_data():
    """Load roots and patterns from JSON files"""
    try:
        # Load roots with derived words
        if os.path.exists(ROOTS_FILE):
            with open(ROOTS_FILE, 'r', encoding='utf-8') as f:
                roots_data = json.load(f)
                
                # Handle both old format (list of strings) and new format (list of dicts)
                if isinstance(roots_data, list) and len(roots_data) > 0:
                    if isinstance(roots_data[0], str):
                        # Old format: just root strings
                        for root in roots_data:
                            avl_tree.insert(root)
                    elif isinstance(roots_data[0], dict):
                        # New format: root with derived words
                        for root_obj in roots_data:
                            root = root_obj.get("root")
                            if root:
                                avl_tree.insert(root)
                                # Load derived words
                                node = avl_tree.get_node(root)
                                if node and "derived_words" in root_obj:
                                    node.derived_words = root_obj["derived_words"]
        
        # Load patterns
        if os.path.exists(PATTERNS_FILE):
            with open(PATTERNS_FILE, 'r', encoding='utf-8') as f:
                patterns = json.load(f)
                for template in patterns:
                    hash_table.put(template)
    except Exception as e:
        print(f"Error loading data: {e}")


# Load data on startup
load_data()


# ==================== Dashboard/Stats Endpoints ====================

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get dashboard statistics"""
    return StatsResponse(
        total_roots=avl_tree.get_size(),
        total_patterns=hash_table.get_size(),
        avl_height=avl_tree.get_height(),
        hash_load_factor=hash_table.get_load_factor()
    )


# ==================== Root Management Endpoints ====================

@app.post("/api/roots/add")
async def add_root(request: RootRequest):
    """Add a new root to the AVL tree"""
    if not request.root or len(request.root) != 3:
        return {
            "success": False,
            "message": "Root must be exactly 3 characters (trilateral)"
        }
    
    if not is_arabic_text(request.root):
        return {
            "success": False,
            "message": "Root must contain only Arabic letters"
        }
    
    success, message = avl_tree.insert(request.root)
    save_data()
    
    return {
        "success": success,
        "message": message,
        "total_roots": avl_tree.get_size()
    }


@app.post("/api/roots/upload")
async def upload_roots(file: UploadFile = File(...)):
    """Upload a text file with roots (one root per line)"""
    try:
        # Read the uploaded file
        contents = await file.read()
        text = contents.decode('utf-8')
        
        # Parse roots from file (one per line)
        lines = text.strip().split('\n')
        roots = [line.strip() for line in lines if line.strip()]
        
        # Validate and insert roots
        added_count = 0
        skipped_count = 0
        errors = []
        
        for root in roots:
            if len(root) != 3:
                skipped_count += 1
                errors.append(f"Skipped '{root}': must be exactly 3 characters")
                continue
            
            if not is_arabic_text(root):
                skipped_count += 1
                errors.append(f"Skipped '{root}': must contain only Arabic letters")
                continue
            
            success, message = avl_tree.insert(root)
            if success:
                added_count += 1
            else:
                skipped_count += 1
                errors.append(f"Skipped '{root}': {message}")
        
        # Save to JSON
        save_data()
        
        return {
            "success": True,
            "message": f"Successfully added {added_count} roots",
            "added_count": added_count,
            "skipped_count": skipped_count,
            "errors": errors[:10],  # Return first 10 errors
            "total_roots": avl_tree.get_size()
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing file: {str(e)}"
        }


@app.get("/api/roots/all")
async def get_all_roots():
    """Get all roots in sorted order (in-order traversal of AVL tree)"""
    roots = avl_tree.get_all_roots()
    return {
        "roots": roots,
        "count": len(roots)
    }


@app.get("/api/roots/tree")
async def get_roots_tree():
    """Get full AVL tree structure for graphical visualization"""
    return {
        "success": True,
        "tree": avl_tree.get_tree_structure(),
        "height": avl_tree.get_height(),
        "count": avl_tree.get_size()
    }


@app.get("/api/roots/search/{root}")
async def search_root(root: str):
    """Search for a specific root"""
    exists = avl_tree.search(root)
    return {
        "root": root,
        "exists": exists
    }


@app.delete("/api/roots/{root}")
async def delete_root(root: str):
    """Delete a root from the AVL tree"""
    success, message = avl_tree.delete(root)
    
    if success:
        save_data()
    
    return {
        "success": success,
        "message": message,
        "total_roots": avl_tree.get_size()
    }


@app.put("/api/roots/update")
async def update_root(request: RootUpdateRequest):
    """Update a root in the AVL tree"""
    if not request.new_root or len(request.new_root) != 3:
        return {
            "success": False,
            "message": "New root must be exactly 3 characters (trilateral)"
        }
    
    if not is_arabic_text(request.new_root):
        return {
            "success": False,
            "message": "New root must contain only Arabic letters"
        }
    
    success, message = avl_tree.update(request.old_root, request.new_root)
    
    if success:
        save_data()
    
    return {
        "success": success,
        "message": message,
        "total_roots": avl_tree.get_size()
    }


@app.get("/api/roots/{root}/words")
async def get_root_derived_words(root: str):
    """Get all derived words for a specific root"""
    if not avl_tree.search(root):
        return {
            "success": False,
            "message": f"Root '{root}' not found",
            "derived_words": {}
        }
    
    derived_words = avl_tree.get_derived_words(root)
    if derived_words is None:
        derived_words = {}
    
    return {
        "success": True,
        "root": root,
        "derived_words": derived_words,
        "count": len(derived_words)
    }


# ==================== Pattern Management Endpoints ====================

@app.post("/api/patterns/add")
async def add_pattern(request: PatternRequest):
    """Add a new pattern to the hash table"""
    if not request.template:
        return {
            "success": False,
            "message": "Template is required"
        }
    
    success, message = hash_table.put(request.template)
    save_data()
    
    return {
        "success": success,
        "message": message,
        "total_patterns": hash_table.get_size()
    }


@app.get("/api/patterns/all")
async def get_all_patterns():
    """Get all patterns from the hash table"""
    patterns = hash_table.get_all_patterns()
    return {
        "patterns": patterns,
        "count": len(patterns)
    }


@app.get("/api/patterns/table")
async def get_patterns_table():
    """Get full hash table bucket structure for graphical visualization"""
    return {
        "success": True,
        "table": hash_table.get_table_structure()
    }


@app.get("/api/patterns/{template}")
async def get_pattern(template: str):
    """Check if a specific pattern exists"""
    exists = hash_table.exists(template)
    return {
        "template": template,
        "exists": exists
    }


@app.delete("/api/patterns/{template}")
async def delete_pattern(template: str):
    """Delete a pattern from the hash table"""
    success, message = hash_table.delete(template)
    save_data()
    
    return {
        "success": success,
        "message": message,
        "total_patterns": hash_table.get_size()
    }


@app.put("/api/patterns/update")
async def update_pattern(request: PatternUpdateRequest):
    """Update a pattern in the hash table"""
    if not request.new_template:
        return {
            "success": False,
            "message": "New template is required"
        }
    
    success, message = hash_table.update(
        request.old_template,
        request.new_template
    )
    
    if success:
        save_data()
    
    return {
        "success": success,
        "message": message,
        "total_patterns": hash_table.get_size()
    }


# ==================== Morphological Generator Endpoint ====================

@app.post("/api/generator/generate")
async def generate_word(request: GeneratorRequest):
    """Generate a word from a root and pattern"""
    if len(request.root) != 3:
        return {
            "success": False,
            "message": "Root must be exactly 3 characters",
            "word": None
        }
    
    # Check if root exists
    if not avl_tree.search(request.root):
        return {
            "success": False,
            "message": f"Root '{request.root}' not found in the database",
            "word": None
        }
    
    # Check if pattern exists
    if not hash_table.exists(request.template):
        return {
            "success": False,
            "message": f"Template '{request.template}' not found in the database",
            "word": None
        }
    
    # Generate the word
    generated_word = MorphologicalEngine.apply_root_to_pattern(request.root, request.template)

    if generated_word:
        avl_tree.add_validated_word(request.root, generated_word, request.template)
        save_data()
    
    return {
        "success": True,
        "message": "Word generated successfully",
        "root": request.root,
        "template": request.template,
        "word": generated_word
    }


@app.post("/api/generator/generate-multiple")
async def generate_multiple(request: GeneratorMultiRequest):
    """Generate words from a root and a list of templates"""
    if len(request.root) != 3:
        return {
            "success": False,
            "message": "Root must be exactly 3 characters",
            "derivatives": []
        }

    if not request.templates:
        return {
            "success": False,
            "message": "At least one template is required",
            "derivatives": []
        }

    # Check if root exists
    if not avl_tree.search(request.root):
        return {
            "success": False,
            "message": f"Root '{request.root}' not found in the database",
            "derivatives": []
        }

    derivatives = []
    skipped = []

    for template in request.templates:
        if not hash_table.exists(template):
            skipped.append(template)
            continue

        generated_word = MorphologicalEngine.apply_root_to_pattern(request.root, template)
        if generated_word:
            derivatives.append({
                "template": template,
                "generated_word": generated_word
            })
            avl_tree.add_validated_word(request.root, generated_word, template)

    if derivatives:
        save_data()

    return {
        "success": True,
        "root": request.root,
        "derivatives": derivatives,
        "count": len(derivatives),
        "skipped": skipped
    }


@app.post("/api/generator/derivatives")
async def generate_derivatives(request: RootRequest):
    """Generate all derivatives of a root"""
    if len(request.root) != 3:
        return {
            "success": False,
            "message": "Root must be exactly 3 characters",
            "derivatives": []
        }
    
    # Check if root exists
    if not avl_tree.search(request.root):
        return {
            "success": False,
            "message": f"Root '{request.root}' not found in the database",
            "derivatives": []
        }
    
    # Generate all derivatives
    all_patterns = hash_table.get_all_patterns()
    derivatives = MorphologicalEngine.generate_derivatives(request.root, all_patterns)

    if derivatives:
        for deriv in derivatives:
            template = deriv.get("template")
            word = deriv.get("generated_word")
            if template and word:
                avl_tree.add_validated_word(request.root, word, template)
        save_data()
    
    return {
        "success": True,
        "root": request.root,
        "derivatives": derivatives,
        "count": len(derivatives)
    }


# ==================== Morphological Validator Endpoint ====================

@app.post("/api/validator/validate")
async def validate_word(request: ValidatorRequest):
    """Validate if a word can be derived from a root"""
    if len(request.root) != 3:
        return {
            "success": False,
            "is_valid": False,
            "message": "Root must be exactly 3 characters",
            "pattern_used": None
        }
    
    # Check if root exists
    if not avl_tree.search(request.root):
        return {
            "success": False,
            "is_valid": False,
            "message": f"Root '{request.root}' not found in the database",
            "template_used": None
        }
    
    # Validate the word
    all_patterns = hash_table.get_all_patterns()
    is_valid, template_used = MorphologicalEngine.validate_word(request.word, request.root, all_patterns)
    
    # Store validated word if verification succeeds
    if is_valid and template_used:
        avl_tree.add_validated_word(request.root, request.word, template_used)
        save_data()  # Persist the validated word
    
    return {
        "success": True,
        "word": request.word,
        "root": request.root,
        "is_valid": is_valid,
        "template_used": template_used,
        "message": f"Word '{request.word}' is {'valid' if is_valid else 'not valid'} for root '{request.root}'"
    }


# ==================== Health Check ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "roots": avl_tree.get_size(),
        "patterns": hash_table.get_size()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
