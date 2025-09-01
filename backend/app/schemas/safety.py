
from pydantic import BaseModel

class SafetyFactors(BaseModel):
    lighting: int
    footfall: int
    hazards: int
    proximity_to_help: int

class SafetyScore(BaseModel):
    score: int
    factors: SafetyFactors
