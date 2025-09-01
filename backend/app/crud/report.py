
from typing import List
from sqlalchemy.orm import Session
from app.models.report import Report
from app.schemas.report import ReportCreate

def create_report(db: Session, *, obj_in: ReportCreate) -> Report:
    db_obj = Report(
        lat=obj_in.lat,
        lon=obj_in.lon,
        hazard_type=obj_in.hazard_type,
        description=obj_in.description,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_reports_near_location(
    db: Session, *, lat: float, lon: float, radius: int = 500
) -> List[Report]:
    """
    Gets a list of reports near a given location.
    This is a simple implementation that uses a square bounding box.
    A more accurate implementation would use a circular radius.
    """
    lat_diff = radius / 111000  # Approximate conversion from meters to degrees
    lon_diff = radius / (111000 * abs(lat) ** 0.5) # cos(lat) is a better approximation

    return (
        db.query(Report)
        .filter(
            Report.lat >= lat - lat_diff,
            Report.lat <= lat + lat_diff,
            Report.lon >= lon - lon_diff,
            Report.lon <= lon + lon_diff,
        )
        .all()
    )
