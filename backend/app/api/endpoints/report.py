
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.Report)
def create_report(
    *, 
    db: Session = Depends(deps.get_db),
    report_in: schemas.ReportCreate,
) -> models.Report:
    """
    Create new report.
    """
    report = crud.report.create_report(db, obj_in=report_in)
    return report
