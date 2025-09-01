from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import (
    DataSourceCreate,
    DataSourceUpdate,
    DataSourceResponse,
    DataIngestionRequest,
    DataIngestionResponse
)
from app.models import DataSource as DBDataSource
from typing import List
import requests
from datetime import datetime
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simulated data sources (in a real implementation, these would be configurable)
DATA_SOURCES = {
    "viirs": {
        "name": "VIIRS Black Marble",
        "provider": "NASA",
        "endpoint": "https://worldview.earthdata.nasa.gov/api",
        "api_key_required": True
    },
    "osm": {
        "name": "OpenStreetMap",
        "provider": "OpenStreetMap Foundation",
        "endpoint": "https://api.openstreetmap.org/api/0.6",
        "api_key_required": False
    },
    "mappls": {
        "name": "Mappls SDK",
        "provider": "Mappls",
        "endpoint": "https://apis.mappls.com/advancedmaps/v1",
        "api_key_required": True
    },
    "imd": {
        "name": "India Meteorological Department",
        "provider": "IMD",
        "endpoint": "https://mausam.imd.gov.in/api",
        "api_key_required": True
    }
}

@router.post("/sources/", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_data_source(source: DataSourceCreate, db: Session = Depends(get_db)):
    """Create a new data source configuration."""
    try:
        db_source = DBDataSource(
            name=source.name,
            provider=source.provider,
            source_type=source.source_type,
            endpoint_url=source.endpoint_url,
            api_key_required=source.api_key_required,
            reliability_score=source.reliability_score,
            average_response_time=source.average_response_time,
            uptime_percentage=source.uptime_percentage,
            rate_limit_requests=source.rate_limit_requests,
            rate_limit_window=source.rate_limit_window,
            geographic_coverage=source.geographic_coverage,
            update_frequency=source.update_frequency,
            data_types=str(source.data_types),  # Convert list to string for storage
            status=source.status
        )
        
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        
        # Convert data_types back to list for response
        response_data = db_source.to_dict()
        response_data['data_types'] = eval(response_data['data_types'])  # Convert string back to list
        
        return DataSourceResponse(**response_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating data source: {str(e)}"
        )

@router.get("/sources/", response_model=List[DataSourceResponse])
def list_data_sources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all configured data sources."""
    try:
        sources = db.query(DBDataSource).offset(skip).limit(limit).all()
        response_sources = []
        
        for source in sources:
            source_data = source.to_dict()
            # Convert data_types string back to list
            if source_data['data_types']:
                source_data['data_types'] = eval(source_data['data_types'])
            response_sources.append(DataSourceResponse(**source_data))
            
        return response_sources
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving data sources: {str(e)}"
        )

@router.get("/sources/{source_id}", response_model=DataSourceResponse)
def get_data_source(source_id: int, db: Session = Depends(get_db)):
    """Get a specific data source by ID."""
    try:
        db_source = db.query(DBDataSource).filter(DBDataSource.id == source_id).first()
        if not db_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data source not found"
            )
            
        source_data = db_source.to_dict()
        # Convert data_types string back to list
        if source_data['data_types']:
            source_data['data_types'] = eval(source_data['data_types'])
            
        return DataSourceResponse(**source_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving data source: {str(e)}"
        )

@router.put("/sources/{source_id}", response_model=DataSourceResponse)
def update_data_source(source_id: int, source: DataSourceUpdate, db: Session = Depends(get_db)):
    """Update a specific data source."""
    try:
        db_source = db.query(DBDataSource).filter(DBDataSource.id == source_id).first()
        if not db_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data source not found"
            )
            
        # Update fields
        for field, value in source.dict(exclude_unset=True).items():
            if field == 'data_types' and value is not None:
                setattr(db_source, field, str(value))  # Convert list to string for storage
            elif value is not None:
                setattr(db_source, field, value)
                
        db_source.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_source)
        
        # Convert data_types back to list for response
        response_data = db_source.to_dict()
        if response_data['data_types']:
            response_data['data_types'] = eval(response_data['data_types'])
            
        return DataSourceResponse(**response_data)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating data source: {str(e)}"
        )

@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_data_source(source_id: int, db: Session = Depends(get_db)):
    """Delete a specific data source."""
    try:
        db_source = db.query(DBDataSource).filter(DBDataSource.id == source_id).first()
        if not db_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data source not found"
            )
            
        db.delete(db_source)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting data source: {str(e)}"
        )

@router.post("/ingest/", response_model=DataIngestionResponse)
def ingest_data(request: DataIngestionRequest, db: Session = Depends(get_db)):
    """
    Ingest data from a specified source.
    
    This endpoint simulates data ingestion. In a real implementation, this would:
    1. Connect to the data source
    2. Fetch data based on the request parameters
    3. Validate and process the data
    4. Store in the appropriate database tables
    """
    try:
        logger.info(f"Starting data ingestion for source: {request.source_name}")
        
        # Check if source exists in our configuration
        if request.source_name not in DATA_SOURCES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown data source: {request.source_name}"
            )
            
        source_config = DATA_SOURCES[request.source_name]
        
        # In a real implementation, we would:
        # 1. Authenticate with the source if required
        # 2. Fetch data using the source's API
        # 3. Process and validate the data
        # 4. Store in the database
        
        # For this simulation, we'll just log the request
        logger.info(f"Ingesting data from {source_config['name']} ({source_config['provider']})")
        logger.info(f"Endpoint: {source_config['endpoint']}")
        logger.info(f"Data types: {request.data_types}")
        logger.info(f"Region: {request.region}")
        
        # Simulate processing time
        import time
        time.sleep(2)
        
        # Return success response
        return DataIngestionResponse(
            success=True,
            message=f"Successfully ingested data from {source_config['name']}",
            records_processed=1000,  # Simulated number
            source_name=request.source_name,
            timestamp=datetime.utcnow()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during data ingestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during data ingestion: {str(e)}"
        )

@router.post("/ingest/{source_name}/trigger")
def trigger_ingestion(source_name: str, db: Session = Depends(get_db)):
    """
    Trigger manual ingestion for a specific data source.
    
    This endpoint simulates triggering data ingestion for a source.
    """
    try:
        # Check if source exists
        db_source = db.query(DBDataSource).filter(DBDataSource.name == source_name).first()
        if not db_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source '{source_name}' not found"
            )
            
        # Update last sync timestamp
        db_source.last_sync_at = datetime.utcnow()
        db_source.next_sync_at = datetime.utcnow()  # In a real system, this would be calculated
        db.commit()
        
        # In a real implementation, this would trigger the actual data ingestion process
        # For now, we'll just log it
        logger.info(f"Triggered ingestion for {source_name}")
        
        return {
            "message": f"Ingestion triggered for {source_name}",
            "source": source_name,
            "triggered_at": datetime.utcnow()
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error triggering ingestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering ingestion: {str(e)}"
        )