"""
Hash Table Implementation with Collision Handling
Uses polynomial rolling hash function for efficient pattern storage
"""

from typing import List, Optional, Tuple


class HashEntry:
    """Entry in the hash table with collision handling (chaining)"""
    
    def __init__(self, template: str, hash_value: int):
        self.template = template
        self.hash_value = hash_value
        self.next: Optional[HashEntry] = None


class HashTable:
    """Hash Table with polynomial rolling hash and chaining for collision handling"""
    
    def __init__(self, initial_size: int = 101):
        """Initialize hash table with prime size for better distribution"""
        self.size = initial_size
        self.table: List[Optional[HashEntry]] = [None] * initial_size
        self.count = 0
        self.prime = 31  # Prime for polynomial rolling hash
        self.mod = 10**9 + 7  # Modulo for large numbers
    
    def _polynomial_hash(self, template: str) -> int:
        """
        Polynomial rolling hash function
        Hash = (p1*31^(k-1) + p2*31^(k-2) + ... + pk) mod MOD
        where p_i is the Unicode value of the character at position i
        """
        hash_value = 0
        for char in template:
            hash_value = (hash_value * self.prime + ord(char)) % self.mod
        return hash_value % self.size
    
    def put(self, template: str) -> Tuple[bool, str]:
        """
        Insert a pattern in the hash table
        Returns: (success, message)
        """
        # Check if pattern already exists
        if self.exists(template):
            return False, f"Pattern '{template}' already exists"
        
        hash_index = self._polynomial_hash(template)
        hash_value = self._compute_full_hash(template)
        
        # Insert new pattern at the beginning (O(1) time)
        new_entry = HashEntry(template, hash_value)
        new_entry.next = self.table[hash_index]
        self.table[hash_index] = new_entry
        self.count += 1
        
        return True, f"Pattern '{template}' inserted successfully"
    
    def get(self, template: str) -> bool:
        """Check if template exists in hash table"""
        return self.exists(template)
    
    def get_all_patterns(self) -> List[str]:
        """
        Get all patterns in the hash table
        Returns: List of template strings
        """
        patterns = []
        
        for bucket in self.table:
            current = bucket
            while current:
                patterns.append(current.template)
                current = current.next
        
        # Sort patterns for consistent ordering
        patterns.sort()
        return patterns
    
    def delete(self, template: str) -> Tuple[bool, str]:
        """Delete a pattern from the hash table"""
        hash_index = self._polynomial_hash(template)
        
        current = self.table[hash_index]
        prev = None
        
        while current:
            if current.template == template:
                if prev:
                    prev.next = current.next
                else:
                    self.table[hash_index] = current.next
                
                self.count -= 1
                return True, f"Pattern '{template}' deleted successfully"
            
            prev = current
            current = current.next
        
        return False, f"Pattern '{template}' not found"
    
    def get_size(self) -> int:
        """Get number of patterns in the hash table"""
        return self.count
    
    def get_load_factor(self) -> float:
        """Get load factor (count / table size)"""
        return self.count / self.size if self.size > 0 else 0
    
    def _compute_full_hash(self, template: str) -> int:
        """Compute full hash value for debugging/display"""
        return self._polynomial_hash(template)
    
    def exists(self, template: str) -> bool:
        """Check if pattern exists"""
        hash_index = self._polynomial_hash(template)
        
        current = self.table[hash_index]
        while current:
            if current.template == template:
                return True
            current = current.next
        
        return False
    
    def update(self, old_template: str, new_template: str) -> Tuple[bool, str]:
        """
        Update a pattern (change template)
        Returns: (success, message)
        """
        # Check if old pattern exists
        if not self.exists(old_template):
            return False, f"Pattern '{old_template}' not found"
        
        # Check if new template already exists
        if old_template != new_template and self.exists(new_template):
            return False, f"Pattern '{new_template}' already exists"
        
        # Delete old pattern and insert new one
        success, _ = self.delete(old_template)
        if success:
            self.put(new_template)
            return True, f"Pattern updated from '{old_template}' to '{new_template}'"
        else:
            return False, f"Failed to update pattern"

    def get_table_structure(self) -> dict:
        """Return full hash table bucket structure for visualization"""
        buckets = []
        non_empty_buckets = 0
        collisions = 0

        for index, bucket in enumerate(self.table):
            chain = []
            current = bucket

            while current:
                chain.append({
                    "template": current.template,
                    "hash_value": current.hash_value,
                })
                current = current.next

            if chain:
                non_empty_buckets += 1
                if len(chain) > 1:
                    collisions += len(chain) - 1

            buckets.append({
                "index": index,
                "count": len(chain),
                "chain": chain,
            })

        return {
            "size": self.size,
            "count": self.count,
            "load_factor": self.get_load_factor(),
            "non_empty_buckets": non_empty_buckets,
            "collisions": collisions,
            "buckets": buckets,
        }
