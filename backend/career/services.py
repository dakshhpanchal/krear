from pgvector.django import CosineDistance
from .models import CareerEntry
from .models import CareerEntry, Skill
from rapidfuzz import fuzz
from .models import CareerEntry, Skill
FUZZY_MATCH_THRESHOLD = 80

def _fuzzy_match(skill, user_skills, threshold=FUZZY_MATCH_THRESHOLD):
    best_score = 0
    best_match = None
    for user_skill in user_skills:
        score = fuzz.partial_ratio(skill, user_skill)
        if score > best_score:
            best_score = score
            best_match = user_skill
    return best_match if best_score >= threshold else None

def compute_match_score(user, jd):
    if not jd.parsed_requirements:
        return None

    required = set(s.lower() for s in jd.parsed_requirements.get('required_skills', []))
    preferred = set(s.lower() for s in jd.parsed_requirements.get('preferred_skills', []))

    user_skills = set(
        s.lower() for s in
        Skill.objects.filter(user=user).values_list('name', flat=True)
    )
    for entry in CareerEntry.objects.filter(user=user):
        user_skills.update(t.lower() for t in entry.tech_stack)
        user_skills.update(t.lower() for t in entry.tags)

    matched_required, missing_required = {}, []
    for skill in required:
        match = _fuzzy_match(skill, user_skills)
        if match:
            matched_required[skill] = match
        else:
            missing_required.append(skill)

    matched_preferred, missing_preferred = {}, []
    for skill in preferred:
        match = _fuzzy_match(skill, user_skills)
        if match:
            matched_preferred[skill] = match
        else:
            missing_preferred.append(skill)

    required_score = len(matched_required) / len(required) if required else 1.0
    preferred_score = len(matched_preferred) / len(preferred) if preferred else 1.0
    overall_score = round((required_score * 0.7 + preferred_score * 0.3) * 100)

    return {
        'overall_score': overall_score,
        'matched_required': matched_required,      # {jd_skill: your_matching_skill}
        'missing_required': sorted(missing_required),
        'matched_preferred': matched_preferred,
        'missing_preferred': sorted(missing_preferred),
    }

def get_relevant_entries(user, jd_embedding, top_n=5):

    if jd_embedding is None:
        return CareerEntry.objects.none()

    return (
        CareerEntry.objects
        .filter(user=user, embedding__isnull=False)
        .annotate(distance=CosineDistance('embedding', jd_embedding))
        .order_by('distance')[:top_n]
    )

def compute_ats_score(match_score: float, parseability_result: dict) -> dict:
    """
    Combines content match score (0-100) and parseability score (0-100)
    into a single breakdown, not a flattened single number.
    """
    return {
        "content_score": round(match_score, 1),
        "parseability_score": parseability_result["score"],
        "overall_score": round((match_score + parseability_result["score"]) / 2, 1),
        "parseability_issues": parseability_result["issues"],
    }