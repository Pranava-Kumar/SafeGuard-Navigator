
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum
from datetime import datetime

class HazardType(str, enum.Enum):
    POTHOLE = "pothole"
    POOR_LIGHTING = "poor_lighting"
    HARASSMENT = "harassment"
    THEFT = "theft"
    ACCIDENT = "accident"
    CONSTRUCTION = "construction"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    hazard_type = Column(SQLAlchemyEnum(HazardType), nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
