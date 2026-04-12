from src.agent.tools.book_appointment import book_appointment


def test_returns_confirmed_mock_booking():
    result = book_appointment.invoke({"patient_name": "Alex"})
    assert result["status"] == "confirmed"
    assert result["patient_name"] == "Alex"
    assert "booked_slot" in result
    assert len(result["alternatives"]) == 2
