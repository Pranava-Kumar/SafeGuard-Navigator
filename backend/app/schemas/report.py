
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.report import HazardType

class ReportBase(BaseModel):
    lat: float
    lon: float
    hazard_type: HazardType
    description: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportInDBBase(ReportBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Report(ReportInDBBase):
    pass
