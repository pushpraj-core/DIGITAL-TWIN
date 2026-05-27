import logging
import numpy as np
try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False

logger = logging.getLogger(__name__)

class YOLODetector:
    def __init__(self, model_path="yolov8n.pt", device="cpu"):
        self.model = None
        self.available = False
        
        if ULTRALYTICS_AVAILABLE:
            try:
                self.model = YOLO(model_path)
                # Ensure it runs on correct device (cpu/cuda)
                self.model.to(device)
                self.available = True
                logger.info(f"Loaded YOLO model from {model_path} on {device}")
            except Exception as e:
                logger.warning(f"Failed to load YOLO model: {e}")
        else:
            logger.warning("ultralytics package not available. YOLO detector disabled.")
            
    def detect(self, image: np.ndarray) -> list:
        \"\"\"
        Detect objects in an image.
        Returns a list of dicts: {"class": name, "bbox": [x1, y1, x2, y2], "confidence": float}
        \"\"\"
        if not self.available or self.model is None:
            return []
            
        try:
            results = self.model(image, verbose=False)
            
            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    cls_name = self.model.names[cls_id]
                    conf = float(box.conf[0].item())
                    b = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                    
                    detections.append({
                        "class": cls_name,
                        "bbox": b,
                        "confidence": conf
                    })
            return detections
        except Exception as e:
            logger.error(f"Error during YOLO detection: {e}")
            return []
