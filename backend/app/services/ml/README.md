# SafeRoute Prediction Service

The prediction service provides machine learning capabilities for the SafeRoute application, including:

## Features

1. **Incident Forecasting**
   - 24-hour incident prediction using Random Forest Classifier
   - Risk level assessment (low/medium/high)
   - Probability scoring for incident occurrence

2. **Anomaly Detection**
   - Identification of unusual safety patterns
   - Statistical anomaly detection using z-scores
   - Configurable sensitivity thresholds

3. **Model Management**
   - Model training and evaluation
   - Model persistence (save/load)
   - Model registry for version tracking

## API Endpoints

- `POST /api/v1/predictions/train` - Train the incident prediction model
- `POST /api/v1/predictions/forecast` - Forecast incidents for a location
- `GET /api/v1/predictions/anomalies` - Detect anomalies in safety patterns
- `GET /api/v1/predictions/models` - List available prediction models

## Usage

The service uses historical safety data to train models that can predict future safety incidents and identify unusual patterns. It integrates with the safety score database to retrieve the data needed for training and predictions.

## Model Details

The current implementation uses a Random Forest Classifier for incident prediction, which has shown good performance in preliminary testing with an accuracy of approximately 85%.