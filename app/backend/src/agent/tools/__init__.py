from .extract_symptoms import extract_symptoms
from .check_completeness import check_completeness
from .calculate_risk_score import calculate_risk_score
from .search_medical_knowledge import search_medical_knowledge
from .detect_emergency import detect_emergency
from .book_appointment import book_appointment

ALL_TOOLS = [
    extract_symptoms,
    check_completeness,
    calculate_risk_score,
    search_medical_knowledge,
    detect_emergency,
    book_appointment,
]
