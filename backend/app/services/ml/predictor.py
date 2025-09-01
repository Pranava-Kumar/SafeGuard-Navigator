from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import joblib
from typing import Dict, Any, Tuple
import pandas as pd


class SafetyPredictor:
    """
    Predict safety incidents using machine learning models.
    
    This service implements:
    1. Incident forecasting (24-hour prediction)
    2. Anomaly detection for unusual safety patterns
    3. Seasonal modeling for festivals and events
    """
    
    def __init__(self):
        self.incident_model = None
        self.anomaly_model = None
        self.seasonal_model = None
        self.is_trained = False
    
    def train_incident_model(self, training_data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """
        Train the incident prediction model.
        
        Args:
            training_data: DataFrame with features and target variable
            target_column: Name of the target column (incident occurrence)
            
        Returns:
            Dictionary with model performance metrics
        """
        # Separate features and target
        X = training_data.drop(columns=[target_column])
        y = training_data[target_column]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.incident_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.incident_model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.incident_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        self.is_trained = True
        
        return {
            "model_type": "RandomForestClassifier",
            "accuracy": accuracy,
            "training_samples": len(X_train),
            "test_samples": len(X_test)
        }
    
    def predict_incident_probability(self, features: Dict[str, Any]) -> float:
        """
        Predict the probability of an incident occurring.
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Probability of incident (0-1)
        """
        if not self.is_trained or self.incident_model is None:
            raise ValueError("Model must be trained before making predictions")
        
        # Convert features to array
        feature_array = np.array(list(features.values())).reshape(1, -1)
        
        # Get prediction probability
        probability = self.incident_model.predict_proba(feature_array)[0][1]  # Probability of positive class
        
        return probability
    
    def detect_anomalies(self, data: pd.DataFrame, threshold: float = 0.1) -> pd.DataFrame:
        """
        Detect anomalies in safety data.
        
        Args:
            data: DataFrame with safety data
            threshold: Anomaly threshold (lower values = more sensitive)
            
        Returns:
            DataFrame with anomaly scores
        """
        # For this prototype, we'll use a simple statistical approach
        # In a real implementation, this might use Isolation Forest or other advanced methods
        
        # Calculate z-scores for each column
        z_scores = np.abs((data - data.mean()) / data.std())
        
        # Identify anomalies based on threshold
        anomalies = (z_scores > threshold).any(axis=1)
        
        # Create result dataframe
        result = data.copy()
        result['anomaly_score'] = z_scores.mean(axis=1)
        result['is_anomaly'] = anomalies
        
        return result
    
    def save_model(self, filepath: str):
        """
        Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        if not self.is_trained:
            raise ValueError("No model to save")
        
        model_data = {
            'incident_model': self.incident_model,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath: str):
        """
        Load a trained model from disk.
        
        Args:
            filepath: Path to the saved model
        """
        model_data = joblib.load(filepath)
        self.incident_model = model_data['incident_model']
        self.is_trained = model_data['is_trained']