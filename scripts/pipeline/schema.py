from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Tuple

class Point(BaseModel):
    x: float
    y: float

class CanvasSpec(BaseModel):
    width: int
    height: int

class BaseCharacter(BaseModel):
    characterId: str
    name: Optional[str] = None
    canvas: CanvasSpec
    anchors: Dict[str, Point]
    assetPath: Optional[str] = None

class GarmentComponent(BaseModel):
    assetId: str
    name: Optional[str] = None
    characterId: str
    garmentType: str
    componentType: str  # "front_panel", "rear_panel", "pants", "collar", "accessories"
    canvasWidth: int
    canvasHeight: int
    renderOrder: int
    anchorReferences: List[str]
    colorVariants: List[str]
    alphaAvailable: bool
    isOptional: bool = False
    defaultColor: Optional[str] = "#A62B2B"
    validationStatus: str = "pending"
    filePath: Optional[str] = None

class ModularGarment(BaseModel):
    garmentId: str
    name: str
    characterId: str
    garmentType: str
    dynasty: str
    gender: str = "nu"
    description: str
    historicalFact: str
    canvas: CanvasSpec
    components: List[GarmentComponent]

class ValidationReport(BaseModel):
    assetId: str
    isValid: bool
    status: str  # "approved", "retry", "review_required"
    dimensionsMatch: bool
    hasAlpha: bool
    emptyImage: bool
    diagnostics: List[str]
    boundingBox: Optional[List[int]] = None
    nonEmptyPixelCount: Optional[int] = None
