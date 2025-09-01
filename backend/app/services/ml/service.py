import pandas as pd
from sqlalchemy.orm import Session
from app.models import SafetyScore
from app.services.ml.predictor import SafetyPredictor
from typing import List, Dict, Any


class PredictionService:
    """
    Service for handling ML predictions in the SafeRoute application.
    
    This service integrates with the SafetyPredictor to provide:
    - Incident forecasting
    - Anomaly detection
    - Seasonal pattern analysis
    """
    
    def __init__(self):
        self.predictor = SafetyPredictor()
        self.model_registry = "app/services/ml/model_registry.json"
    
    def get_historical_safety_data(self, db: Session, days: int = 30) -> pd.DataFrame:
        """
        Retrieve historical safety data from the database.
        
        Args:
            db: Database session
            days: Number of days of historical data to retrieve
            
        Returns:
            DataFrame with historical safety data
        """
        # Calculate the date threshold
        from datetime import datetime, timedelta
        threshold_date = datetime.utcnow() - timedelta(days=days)
        
        # Query the database
        safety_scores = db.query(SafetyScore).filter(
            SafetyScore.timestamp >= threshold_date
        ).all()
        
        # Convert to DataFrame
        data = []
        for score in safety_scores:
            data.append({
                'latitude': score.latitude,
                'longitude': score.longitude,
                'lighting_score': score.lighting_score,
                'footfall_score': score.footfall_score,
                'hazard_score': score.hazard_score,
                'proximity_score': score.proximity_score,
                'overall_score': score.overall_score,
                'timestamp': score.timestamp,
                'time_of_day': score.time_of_day,
                'weather_condition': score.weather_condition
            })
        
        return pd.DataFrame(data)
    
    def train_incident_model(self, db: Session) -> Dict[str, Any]:
        """
        Train the incident prediction model using historical data.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with training results
        """
        # Get historical data
        data = self.get_historical_safety_data(db, days=90)
        
        # For this prototype, we'll simulate incident occurrence based on low safety scores
        # In a real implementation, this would come from actual incident reports
        data['incident_occurrence'] = (data['overall_score'] < 30).astype(int)
        
        # Select features for training
        feature_columns = [
            'lighting_score', 'footfall_score', 'hazard_score', 
            'proximity_score', 'overall_score'
        ]
        
        training_data = data[feature_columns + ['incident_occurrence']]
        
        # Train the model
        results = self.predictor.train_incident_model(
            training_data, 
            target_column='incident_occurrence'
        )
        
        # Save the model
        self.predictor.save_model("app/services/ml/models/incident_model.pkl")
        
        return results
    
    def forecast_incidents(self, db: Session, location_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Forecast incidents for a given location.
        
        Args:
            db: Database session
            location_data: Dictionary with location safety factors
            
        Returns:
            Dictionary with forecast results
        """
        try:
            # Get probability of incident
            probability = self.predictor.predict_incident_probability(location_data)
            
            # Determine risk level
            if probability > 0.7:
                risk_level = "high"
            elif probability > 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            return {
                "probability": probability,
                "risk_level": risk_level,
                "forecast_period": "24 hours",
                "confidence": 0.85  # Placeholder confidence score
            }
        except Exception as e:
            return {
                "error": f"Forecast failed: {str(e)}",
                "probability": None,
                "risk_level": None
            }
    
    def detect_safety_anomalies(self, db: Session) -> Dict[str, Any]:
        """
        Detect anomalies in safety patterns.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with anomaly detection results
        """
        # Get recent safety data
        data = self.get_historical_safety_data(db, days=7)
        
        # Select numerical columns for anomaly detection
        numerical_columns = [
            'lighting_score', 'footfall_score', 'hazard_score', 
            'proximity_score', 'overall_score'
        ]
        
        # Detect anomalies
        anomaly_data = data[numerical_columns]
        results = self.predictor.detect_anomalies(anomaly_data, threshold=2.0)
        
        # Count anomalies
        anomaly_count = results['is_anomaly'].sum()
        
        return {
            "anomaly_count": int(anomaly_count),
            "total_locations": len(results),
            "anomaly_percentage": float(anomaly_count / len(results) * 100),
            "timestamp": pd.Timestamp.now().isoformat()
        }