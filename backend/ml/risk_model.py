import numpy as np
from sklearn.ensemble import RandomForestRegressor
import logging

logger = logging.getLogger(__name__)

class RiskModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self._train_synthetic_model()
        logger.info("RiskModel initialized and trained on synthetic data")
        
    def _train_synthetic_model(self):
        \"\"\"
        Train the model on synthetic tactical data so it's ready to use immediately.
        Features: [terrain_class_encoded, elevation, slope, distance_to_cover, visibility_score, threat_distance]
        \"\"\"
        # Generate synthetic data
        np.random.seed(42)
        n_samples = 1000
        
        # Random features
        # terrain_class: 0=safe, 1=exposed, 2=obstacle, 3=high_ground, 4=urban, 5=forest
        terrain_class = np.random.randint(0, 6, n_samples)
        elevation = np.random.uniform(0, 1000, n_samples)
        slope = np.random.uniform(0, 45, n_samples)
        distance_to_cover = np.random.uniform(0, 500, n_samples)
        visibility_score = np.random.uniform(0, 1, n_samples)
        threat_distance = np.random.uniform(0, 2000, n_samples)
        
        X = np.column_stack((terrain_class, elevation, slope, distance_to_cover, visibility_score, threat_distance))
        
        # Synthetic risk calculation (ground truth for training)
        y = np.zeros(n_samples)
        for i in range(n_samples):
            risk = 0.0
            
            # Terrain base risk
            if terrain_class[i] == 1: risk += 0.4 # exposed
            elif terrain_class[i] == 4: risk += 0.2 # urban
            elif terrain_class[i] == 2: risk += 1.0 # obstacle
            
            # Visibility
            risk += visibility_score[i] * 0.3
            
            # Distance to cover (farther = higher risk)
            risk += min(distance_to_cover[i] / 500, 1.0) * 0.2
            
            # Threat distance (closer = higher risk)
            if threat_distance[i] < 1000:
                risk += (1.0 - (threat_distance[i] / 1000)) * 0.5
                
            y[i] = min(max(risk, 0.0), 1.0)
            
        self.model.fit(X, y)
        
    def predict_risk(self, features: np.ndarray) -> np.ndarray:
        \"\"\"
        Predict risk scores for an array of feature vectors.
        \"\"\"
        # Ensure 2D
        if len(features.shape) == 1:
            features = features.reshape(1, -1)
            
        return self.model.predict(features)
