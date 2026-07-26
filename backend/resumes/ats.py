import pdfplumber
import re
import io

def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract raw text from a compiled resume PDF, same way an ATS would."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
    return "\n".join(text_parts)


def check_parseability(pdf_bytes: bytes, expected_sections: list[str]) -> dict:
    text = extract_pdf_text(pdf_bytes)
    issues = []
    score = 100

    if len(text.strip()) < 50:
        issues.append("Little to no text extracted — likely a font embedding or rendering issue.")
        score -= 50
        return {"score": max(score, 0), "issues": issues, "extracted_text": text}

    # Unmapped glyphs — pdfminer's raw glyph-ID fallback when a font has no
    # ToUnicode mapping. Near-guaranteed ATS parsing failure for that content.
    cid_matches = re.findall(r'\(cid:\d+\)', text)
    if cid_matches:
        issues.append(
            f"{len(cid_matches)} unmapped glyph(s) detected (e.g. {cid_matches[0]}) — "
            "font has no text mapping for these characters. Commonly caused by icon "
            "fonts (e.g. FontAwesome); the icon renders visually but extracts as garbage "
            "or nothing, which can break ATS parsing of adjacent fields like phone/email."
        )
        score -= 25

    positions = []
    for section in expected_sections:
        match = re.search(re.escape(section), text, re.IGNORECASE)
        if not match:
            issues.append(f"Section header '{section}' not found in extracted text.")
            score -= 10
        else:
            positions.append((section, match.start()))

    ordered = [p[0] for p in sorted(positions, key=lambda p: p[1])]
    if ordered != [s for s in expected_sections if s in ordered]:
        issues.append("Section order in extracted text does not match visual layout — "
                       "may indicate a multi-column template that interleaves columns when parsed linearly.")
        score -= 20

    if not re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text):
        issues.append("No email address pattern detected in extracted text.")
        score -= 10

    return {
        "score": max(score, 0),
        "issues": issues,
        "extracted_text": text,
    }