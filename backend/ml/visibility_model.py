class VisibilityModel:
    @staticmethod
    def compute_visibility_score(terrain_class: str, elevation: float, cover_distance: float) -> float:
        \"\"\"
        Rules-based model to compute base visibility exposure score [0.0 - 1.0]
        Higher score = more exposed.
        \"\"\"
        score = 0.5 # Default medium visibility
        
        if terrain_class == 'exposed' or terrain_class == 'road':
            score = 1.0
        elif terrain_class == 'forest' or terrain_class == 'vegetation':
            score = 0.1
        elif terrain_class == 'urban' or terrain_class == 'building':
            score = 0.3
        elif terrain_class == 'safe':
            score = 0.2
            
        # Modify based on distance to cover
        # If we're exposed but cover is very close, reduce risk slightly
        if score > 0.5 and cover_distance < 10:
            score -= 0.2
            
        # Elevation: higher elevation generally means more visibility (to others and from others)
        # Simplified: if on a hill, you're more exposed
        if terrain_class == 'high_ground' or terrain_class == 'hill':
            score = 0.8
            
        return max(0.0, min(1.0, score))
