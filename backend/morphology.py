"""
Morphological Generator and Validator
Implements the morphological generation and validation logic with comprehensive Arabic phonological rules
"""

from typing import Tuple, Optional, List


class MorphologicalEngine:
    """Handles morphological generation and validation"""
    
    # Weak radicals
    WEAK_LETTERS = ['و', 'ي']
    
    # Emphatic consonants
    EMPHATIC = ['ص', 'ض', 'ط', 'ظ']
    
    # Dental consonants
    DENTAL = ['د', 'ذ', 'ز']
    
    # Labial consonants
    LABIAL = ['ب', 'م']
    
    @staticmethod
    def is_weak_root(root: str) -> tuple:
        """
        Detect weak root type
        Returns: (type, position) where type is:
            'assimilated' - C1 weak (و/ي)
            'hollow' - C2 weak (و/ي)
            'defective' - C3 weak (و/ي)
            'doubled' - C2 == C3
            'sound' - no weakness
        """
        if len(root) != 3:
            return ('sound', None)
        
        if root[0] in MorphologicalEngine.WEAK_LETTERS:
            return ('assimilated', 0)
        if root[1] in MorphologicalEngine.WEAK_LETTERS:
            return ('hollow', 1)
        if root[2] in MorphologicalEngine.WEAK_LETTERS:
            return ('defective', 2)
        if root[1] == root[2]:
            return ('doubled', (1, 2))
        
        return ('sound', None)
    
    @staticmethod
    def apply_form8_assimilation(word: str, root: str) -> str:
        """
        RULE A — Form VIII Assimilation (افتعل)
        
        A1: Emphatic Spread (ص ض ط ظ): ت → ط
        A2: Dental Idghām (د ذ ز): C1ت → C1ّ
        A3: ث case: ثت → ثّ
        A4: Default: no change
        """
        if len(root) != 3:
            return word
        
        c1 = root[0]
        
        # A1: Emphatic spread (ت → ط)
        if c1 in MorphologicalEngine.EMPHATIC:
            word = word.replace(c1 + 'ت', c1 + 'ط')
        
        # A2: Dental idghām (assimilation with shadda)
        elif c1 in MorphologicalEngine.DENTAL:
            word = word.replace(c1 + 'ت', c1 + 'ّ')
        
        # A3: ث case
        elif c1 == 'ث':
            word = word.replace('ثت', 'ثّ')
        
        # A4: Default - no change
        
        return word
    
    @staticmethod
    def apply_form7_assimilation(word: str, root: str) -> str:
        """
        RULE B — Form VII Assimilation (انفعل)
        
        If C1 ∈ {ب م}: ن → م
        
        Examples:
            انبعث → امبعث
            انبنى → امبنى
        """
        if len(root) != 3:
            return word
        
        c1 = root[0]
        
        # If C1 is labial, n → m
        if c1 in MorphologicalEngine.LABIAL:
            word = word.replace('ن' + c1, 'م' + c1)
        
        return word
    
    @staticmethod
    def apply_hollow_root_rules(word: str, root: str) -> str:
        """
        Handle hollow roots (C2 weak: و/ي)
        
        Rule: aC2 between vowels → long vowel
        Examples:
            قول → قال (qāla)
            بيع → باع (bāʿa)
        """
        if len(root) != 3:
            return word
        
        c1, c2, c3 = root[0], root[1], root[2]
        
        # If C2 is weak (و or ي)
        if c2 in MorphologicalEngine.WEAK_LETTERS:
            # Pattern: C1aC2aC3 → C1āC3
            # Replace weak radical with long ā
            if c2 == 'و':
                word = word.replace(c1 + 'َو', c1 + 'َا')
                word = word.replace(c1 + 'ُو', c1 + 'ُو')  # Keep ū
                word = word.replace(c1 + 'ِو', c1 + 'ِي')  # i+w→ī
            elif c2 == 'ي':
                word = word.replace(c1 + 'َي', c1 + 'َا')
                word = word.replace(c1 + 'ِي', c1 + 'ِي')  # Keep ī
                word = word.replace(c1 + 'ُي', c1 + 'ُو')  # u+y→ū
        
        return word
    
    @staticmethod
    def apply_defective_root_rules(word: str, root: str) -> str:
        """
        Handle defective roots (C3 weak: و/ي)
        
        Rule: Final weak radical → ā in past tense
        Examples:
            رمي → رمى
            دعو → دعا
        """
        if len(root) != 3:
            return word
        
        c3 = root[2]
        
        # If C3 is weak
        if c3 in MorphologicalEngine.WEAK_LETTERS:
            # Final weak → ى in many contexts
            if word.endswith(c3):
                word = word[:-1] + 'ى'
        
        return word
    
    @staticmethod
    def apply_phonological_rules(word: str, root: str, pattern: str) -> str:
        """
        Apply comprehensive Arabic phonological rules in correct order
        
        Rule Order (CRITICAL):
        1. Detect weak root type
        2. Apply weak root structural changes
        3. Apply Form VIII assimilation
        4. Apply Form VII assimilation
        5. Clean up gemination
        
        This implements the morphophonological derivation engine.
        """
        if len(root) != 3:
            return word
        
        # Step 1: Detect weakness
        weakness_type, position = MorphologicalEngine.is_weak_root(root)
        
        # Step 2: Apply weak root rules
        if weakness_type == 'hollow':
            word = MorphologicalEngine.apply_hollow_root_rules(word, root)
        elif weakness_type == 'defective':
            word = MorphologicalEngine.apply_defective_root_rules(word, root)
        
        # Step 3: Form VIII assimilation (افتعل)
        word = MorphologicalEngine.apply_form8_assimilation(word, root)
        
        # Step 4: Form VII assimilation (انفعل)
        word = MorphologicalEngine.apply_form7_assimilation(word, root)
        
        # Step 5: Clean up any double shaddas
        word = word.replace('ّّ', 'ّ')
        
        return word
    
    @staticmethod
    def apply_root_to_pattern(root: str, pattern: str) -> str:
        """
        Apply a root to a pattern to generate a word
        
        Supports pure Arabic morphological notation:
        - ف (Fa) = First root letter position
        - ع (Ayn) = Second root letter position
        - ل (Lam) = Third root letter position
        
        Also supports numeric markers: 1, 2, 3
        And legacy English: F, A, L
        
        Args:
            root: Trilateral root (e.g., "كتب")
            pattern: Pattern template in pure Arabic (e.g., "فَاعِل")
        
        Returns:
            Generated word with root applied to pattern
        
        Examples:
            root="كتب", pattern="فَاعِل" -> "كاتب" (writer)
            root="علم", pattern="فَاعِل" -> "عالم" (scholar)
            root="درس", pattern="مُفَاعِل" -> "مُدَارِس" (schools)
        """
        if len(root) != 3:
            return ""
        
        # Extract root letters
        fa = root[0]      # Position 1 - First letter
        ayn = root[1]     # Position 2 - Second letter
        lam = root[2]     # Position 3 - Third letter
        
        result = ""
        i = 0
        
        while i < len(pattern):
            char = pattern[i]
            
            # Arabic morphological notation (standard linguistic)
            if char == 'ف':      # Fa - First position
                result += fa
            elif char == 'ع':    # Ayn - Second position
                result += ayn
            elif char == 'ل':    # Lam - Third position
                result += lam
            # Numeric markers (1, 2, 3)
            elif char == '1':
                result += fa
            elif char == '2':
                result += ayn
            elif char == '3':
                result += lam
            # English legacy support (F, A, L)
            elif char == 'F':
                result += fa
            elif char == 'A':
                result += ayn
            elif char == 'L':
                result += lam
            # All other characters (diacritics, vowels, constants) pass through
            else:
                result += char
            
            i += 1
        
        # Apply phonological/morphophonological rules
        result = MorphologicalEngine.apply_phonological_rules(result, root, pattern)
        
        return result
    
    @staticmethod
    def validate_word(word: str, root: str, all_patterns: List[str]) -> Tuple[bool, Optional[str]]:
        """
        Validate if a word can be derived from a root using any available pattern
        
        Args:
            word: The word to validate
            root: The suspected root
            all_patterns: List of all available templates
        
        Returns:
            Tuple of (is_valid, template_used)
        """
        if len(root) != 3:
            return False, None
        
        # Brute force: try applying root to all patterns
        for template in all_patterns:
            generated_word = MorphologicalEngine.apply_root_to_pattern(root, template)
            
            if generated_word == word:
                return True, template
        
        return False, None
    
    @staticmethod
    def generate_derivatives(root: str, all_patterns: List[str]) -> List[dict]:
        """
        Generate all possible derivatives of a root using all available patterns
        
        Args:
            root: The root to generate derivatives for
            all_patterns: List of all available templates
        
        Returns:
            List of {template, generated_word} dictionaries
        """
        derivatives = []
        
        if len(root) != 3:
            return derivatives
        
        for template in all_patterns:
            generated_word = MorphologicalEngine.apply_root_to_pattern(root, template)
            
            if generated_word:
                derivatives.append({
                    "template": template,
                    "generated_word": generated_word
                })
        
        return derivatives
