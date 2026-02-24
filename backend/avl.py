"""
AVL Tree Implementation for Arabic Roots Storage
A self-balancing binary search tree for efficient root management
Each node stores validated derived words with their frequencies
"""

from typing import Optional, List, Tuple, Dict


class AVLNode:
    """Node in the AVL Tree"""
    
    def __init__(self, root: str):
        self.root = root  # Arabic root (e.g., "كتب")
        self.left: Optional[AVLNode] = None
        self.right: Optional[AVLNode] = None
        self.height: int = 1
        # Dictionary storing validated words and their frequency
        # Format: {"كاتب": {"template": "فَاعِل", "frequency": 5}, ...}
        self.derived_words: Dict[str, Dict[str, any]] = {}
    
    def add_derived_word(self, word: str, template: str) -> None:
        """Add or increment frequency of a derived word"""
        if word in self.derived_words:
            self.derived_words[word]["frequency"] += 1
        else:
            self.derived_words[word] = {
                "template": template,
                "frequency": 1
            }
    
    def get_derived_words(self) -> Dict[str, Dict[str, any]]:
        """Get all derived words with their metadata"""
        return self.derived_words
    
    def get_word_frequency(self, word: str) -> int:
        """Get frequency of a specific word"""
        return self.derived_words.get(word, {}).get("frequency", 0)


class AVLTree:
    """Self-balancing Binary Search Tree for Arabic roots"""
    
    def __init__(self):
        self.root: Optional[AVLNode] = None
        self.size: int = 0
    
    def _get_height(self, node: Optional[AVLNode]) -> int:
        """Get height of a node"""
        return node.height if node else 0
    
    def _get_balance_factor(self, node: Optional[AVLNode]) -> int:
        """Get balance factor of a node"""
        if not node:
            return 0
        return self._get_height(node.left) - self._get_height(node.right)
    
    def _rotate_right(self, node: AVLNode) -> AVLNode:
        """Right rotation"""
        left_child = node.left
        node.left = left_child.right
        left_child.right = node
        
        # Update heights
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
        left_child.height = 1 + max(self._get_height(left_child.left), self._get_height(left_child.right))
        
        return left_child
    
    def _rotate_left(self, node: AVLNode) -> AVLNode:
        """Left rotation"""
        right_child = node.right
        node.right = right_child.left
        right_child.left = node
        
        # Update heights
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
        right_child.height = 1 + max(self._get_height(right_child.left), self._get_height(right_child.right))
        
        return right_child
    
    def insert(self, root: str) -> Tuple[bool, str]:
        """
        Insert a root into the AVL tree
        Returns: (success, message)
        """
        old_size = self.size
        self.root = self._insert_recursive(self.root, root)
        
        if self.size > old_size:
            return True, f"Root '{root}' inserted successfully"
        else:
            return False, f"Root '{root}' already exists"
    
    def _insert_recursive(self, node: Optional[AVLNode], root: str) -> AVLNode:
        """Recursive insertion with balancing"""
        # Base case: create new node
        if not node:
            self.size += 1
            return AVLNode(root)
        
        # Standard BST insertion
        if root < node.root:
            node.left = self._insert_recursive(node.left, root)
        elif root > node.root:
            node.right = self._insert_recursive(node.right, root)
        else:
            # Root already exists - just return without modifying
            return node
        
        # Update height
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
        
        # Get balance factor
        balance_factor = self._get_balance_factor(node)
        
        # Left-Left case
        if balance_factor > 1 and root < node.left.root:
            return self._rotate_right(node)
        
        # Right-Right case
        if balance_factor < -1 and root > node.right.root:
            return self._rotate_left(node)
        
        # Left-Right case
        if balance_factor > 1 and root > node.left.root:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        
        # Right-Left case
        if balance_factor < -1 and root < node.right.root:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)
        
        return node
    
    def search(self, root: str) -> bool:
        """Search for a root in the tree"""
        return self._search_recursive(self.root, root)
    
    def _search_recursive(self, node: Optional[AVLNode], root: str) -> bool:
        """Recursive search"""
        if not node:
            return False
        
        if root == node.root:
            return True
        elif root < node.root:
            return self._search_recursive(node.left, root)
        else:
            return self._search_recursive(node.right, root)
    
    def _get_node(self, node: Optional[AVLNode], root: str) -> Optional[AVLNode]:
        """Get the actual node for a root"""
        if not node:
            return None
        
        if root == node.root:
            return node
        elif root < node.root:
            return self._get_node(node.left, root)
        else:
            return self._get_node(node.right, root)
    
    def get_node(self, root: str) -> Optional[AVLNode]:
        """Get the node for a specific root"""
        return self._get_node(self.root, root)
    
    def add_validated_word(self, root: str, word: str, template: str) -> Tuple[bool, str]:
        """Add a validated word to a root's derived words list"""
        node = self.get_node(root)
        if not node:
            return False, f"Root '{root}' not found in the tree"
        
        node.add_derived_word(word, template)
        return True, f"Word '{word}' added to root '{root}'"
    
    def get_derived_words(self, root: str) -> Optional[Dict[str, Dict[str, any]]]:
        """Get all derived words for a specific root"""
        node = self.get_node(root)
        if not node:
            return None
        return node.get_derived_words()
    
    def in_order_traversal(self) -> List[str]:
        """
        In-order traversal of the AVL tree (sorted)
        Returns: List of roots in alphabetical order
        """
        result = []
        self._in_order_recursive(self.root, result)
        return result
    
    def _in_order_recursive(self, node: Optional[AVLNode], result: List[str]):
        """Recursive in-order traversal"""
        if not node:
            return
        
        self._in_order_recursive(node.left, result)
        result.append(node.root)
        self._in_order_recursive(node.right, result)
    
    def get_all_roots(self) -> List[str]:
        """Get all roots in sorted order"""
        return self.in_order_traversal()
    
    def get_all_roots_with_words(self) -> List[dict]:
        """Get all roots with their derived words"""
        result = []
        self._in_order_with_words(self.root, result)
        return result
    
    def _in_order_with_words(self, node: Optional[AVLNode], result: List[dict]):
        """In-order traversal to collect roots with their derived words"""
        if not node:
            return
        
        self._in_order_with_words(node.left, result)
        result.append({
            "root": node.root,
            "derived_words": node.derived_words
        })
        self._in_order_with_words(node.right, result)
    
    def get_size(self) -> int:
        """Get number of unique roots in the tree"""
        return self.size
    
    def get_height(self) -> int:
        """Get height of the tree"""
        return self._get_height(self.root)
    
    def delete(self, root: str) -> Tuple[bool, str]:
        """
        Delete a root from the AVL tree
        Returns: (success, message)
        """
        if not self.search(root):
            return False, f"Root '{root}' not found"
        
        old_size = self.size
        self.root = self._delete_recursive(self.root, root)
        
        if self.size < old_size:
            return True, f"Root '{root}' deleted successfully"
        else:
            return False, f"Failed to delete root '{root}'"
    
    def _delete_recursive(self, node: Optional[AVLNode], root: str) -> Optional[AVLNode]:
        """Recursive deletion with balancing"""
        if not node:
            return None
        
        # Find the node to delete
        if root < node.root:
            node.left = self._delete_recursive(node.left, root)
        elif root > node.root:
            node.right = self._delete_recursive(node.right, root)
        else:
            # Node found - perform deletion
            self.size -= 1
            
            # Case 1: Node with only one child or no child
            if not node.left:
                return node.right
            elif not node.right:
                return node.left
            
            # Case 2: Node with two children
            # Get the inorder successor (smallest in the right subtree)
            min_larger_node = self._get_min_node(node.right)
            node.root = min_larger_node.root
            node.derived_words = min_larger_node.derived_words  # Preserve derived words
            node.right = self._delete_recursive(node.right, min_larger_node.root)
            self.size += 1  # Adjust because we moved the node, not deleted
        
        # Update height and balance
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
        balance = self._get_balance_factor(node)
        
        # Rebalance if needed
        # Left Heavy
        if balance > 1:
            if self._get_balance_factor(node.left) >= 0:
                return self._rotate_right(node)
            else:
                node.left = self._rotate_left(node.left)
                return self._rotate_right(node)
        
        # Right Heavy
        if balance < -1:
            if self._get_balance_factor(node.right) <= 0:
                return self._rotate_left(node)
            else:
                node.right = self._rotate_right(node.right)
                return self._rotate_left(node)
        
        return node
    
    def _get_min_node(self, node: AVLNode) -> AVLNode:
        """Get node with minimum value in subtree"""
        current = node
        while current.left:
            current = current.left
        return current
    
    def update(self, old_root: str, new_root: str) -> Tuple[bool, str]:
        """
        Update a root in the AVL tree (delete old, insert new) while preserving derived words
        Returns: (success, message)
        """
        if len(new_root) != 3:
            return False, "New root must be exactly 3 characters"
        
        if not self.search(old_root):
            return False, f"Root '{old_root}' not found"
        
        if self.search(new_root) and old_root != new_root:
            return False, f"Root '{new_root}' already exists"
        
        if old_root == new_root:
            return False, "New root is the same as old root"
        
        # Get derived words from old root before deletion
        old_node = self.get_node(old_root)
        derived_words_backup = old_node.derived_words.copy() if old_node else {}
        
        # Delete old root and insert new one
        success, _ = self.delete(old_root)
        if success:
            self.insert(new_root)
            # Restore derived words to new node
            new_node = self.get_node(new_root)
            if new_node:
                new_node.derived_words = derived_words_backup
            return True, f"Root updated from '{old_root}' to '{new_root}'"
        else:
            return False, f"Failed to update root"
