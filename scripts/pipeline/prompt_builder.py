from schema import BaseCharacter, GarmentComponent

def build_generation_prompt(character: BaseCharacter, component: GarmentComponent, description: str) -> str:
    """
    Builds a strict prompt for generating a garment component.
    """
    base_prompt = (
        f"Create an anime-style Vietnamese {component.garmentType} garment asset. "
        f"Generate ONLY the {component.componentType}. "
        f"Design details: {description}. "
        f"Use the canonical base character {character.characterId} as the anatomical and compositional reference. "
        f"Preserve the character's front-facing standing pose, proportions, and camera angle. "
        f"Canvas alignment: The asset MUST be generated on a solid white or transparent background, "
        f"perfectly framed for a {component.canvasWidth}x{component.canvasHeight} canvas. "
        f"Do not crop, rotate, scale independently, or reposition the asset. "
        f"Do not include a background, text, watermark, or unrelated objects. "
        f"Ensure it aligns with these anchors: {', '.join(component.anchorReferences)}."
    )
    return base_prompt
