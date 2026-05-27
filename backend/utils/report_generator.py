import os
import json
from datetime import datetime

class ReportGenerator:
    def __init__(self, export_dir="./data/reports"):
        self.export_dir = export_dir
        os.makedirs(self.export_dir, exist_ok=True)

    def generate_mission_report(self, mission_data: dict) -> str:
        \"\"\"
        Generates a summary tactical report in JSON/Text format.
        (For full PDF generation in a production app, use ReportLab or FPDF2).
        \"\"\"
        report_id = f"mission_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        filepath = os.path.join(self.export_dir, f"{report_id}.json")
        
        # Structure the tactical report
        report_content = {
            "title": "Tactical Mission Plan & Risk Analysis",
            "timestamp": datetime.now().isoformat(),
            "target_area": mission_data.get("bounds", "Unknown"),
            "selected_strategy": mission_data.get("strategy_name", "Safest"),
            "threats_identified": len(mission_data.get("threats", [])),
            "mission_metrics": {
                "total_distance_m": mission_data.get("distance", 0),
                "estimated_duration_s": mission_data.get("duration", 0),
                "risk_exposure_index": mission_data.get("risk", 0.0)
            },
            "recommendations": [
                "Maintain radio silence in elevated risk zones (Segments 3-4).",
                "Ensure covering fire assigned to blind spots on western flank."
            ]
        }
        
        with open(filepath, 'w') as f:
            json.dump(report_content, f, indent=4)
            
        return filepath
