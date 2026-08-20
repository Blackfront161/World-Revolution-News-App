import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from multilingual_content import (
    trim_repeated_translation,
    trim_repeated_translation_blocks,
)


ENGLISH = """We rescued an animal from a hunting kennel and brought her to a safe home. The veterinarian treated the injuries and removed the tracking chip. The group documented the rescue, arranged ongoing care and found a quiet place where the animal could recover without being used again. This report explains why collective action and reliable support networks matter whenever living beings are treated as resources.

She now lives with other rescued animals. From the first day she played with them, and the collective will continue supporting her recovery. Everyone involved agreed that the work does not end with the immediate rescue: food, medical treatment, shelter and patient care remain necessary. The action was therefore dedicated to all people who build practical solidarity without seeking attention or recognition."""

SPANISH = """Rescatamos a un animal de una perrera de caza y la llevamos a un hogar seguro. La veterinaria trató las heridas y retiró el chip de seguimiento. El grupo documentó el rescate, organizó los cuidados continuos y encontró un lugar tranquilo donde el animal pudiera recuperarse sin volver a ser utilizado. Este informe explica por qué la acción colectiva y las redes de apoyo fiables son importantes cuando los seres vivos son tratados como recursos.

Ahora vive con otros animales rescatados. Desde el primer día jugó con ellos, y el colectivo seguirá apoyando su recuperación. Todas las personas implicadas acordaron que el trabajo no termina con el rescate inmediato: la comida, el tratamiento médico, el refugio y los cuidados pacientes siguen siendo necesarios. Por ello, la acción se dedicó a quienes construyen solidaridad práctica sin buscar atención ni reconocimiento."""


def test_repeated_translation_is_removed_after_original_edition():
    source = f"ENGLISH:\n\n{ENGLISH}\n\n{SPANISH}"
    cleaned = trim_repeated_translation(source, "en")
    assert "We rescued" in cleaned
    assert "Rescatamos" not in cleaned


def test_short_foreign_quote_is_not_mistaken_for_full_translation():
    quote = "No pasarán, porque la solidaridad no conoce fronteras y nuestra memoria sigue viva."
    source = f"{ENGLISH}\n\n{quote}"
    assert trim_repeated_translation(source, "en") == source


def test_structured_blocks_follow_the_same_language_boundary():
    blocks = [
        {"type": "paragraph", "text": paragraph}
        for paragraph in [*ENGLISH.split("\n\n"), *SPANISH.split("\n\n")]
    ]
    cleaned = trim_repeated_translation_blocks(blocks, "en")
    assert len(cleaned) == 2
    assert all("Rescatamos" not in block["text"] for block in cleaned)
