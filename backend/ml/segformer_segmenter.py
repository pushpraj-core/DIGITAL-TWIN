import logging
import numpy as np
import cv2
try:
    import torch
    from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

logger = logging.getLogger(__name__)

class SegFormerSegmenter:
    def __init__(self, model_name="nvidia/segformer-b0-finetuned-ade-512-512", device="cpu"):
        self.processor = None
        self.model = None
        self.available = False
        self.device = device
        
        if TRANSFORMERS_AVAILABLE:
            try:
                self.processor = SegformerImageProcessor.from_pretrained(model_name)
                self.model = SegformerForSemanticSegmentation.from_pretrained(model_name)
                self.model.to(self.device)
                self.available = True
                logger.info(f"Loaded SegFormer model {model_name} on {device}")
            except Exception as e:
                logger.warning(f"Failed to load SegFormer model: {e}")
        else:
            logger.warning("transformers package not available. SegFormer segmenter disabled.")
            
    def segment(self, image: np.ndarray) -> np.ndarray:
        \"\"\"
        Perform semantic segmentation on an image.
        Returns a 2D numpy array with class indices.
        \"\"\"
        if not self.available or self.model is None:
            return self._fallback_segmentation(image)
            
        try:
            # Need to convert BGR to RGB for HF models usually
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            inputs = self.processor(images=image_rgb, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            logits = outputs.logits
            # Resize logits to original image size
            import torch.nn.functional as F
            upsampled_logits = F.interpolate(
                logits,
                size=image.shape[:2], # (height, width)
                mode="bilinear",
                align_corners=False,
            )
            
            pred_seg = upsampled_logits.argmax(dim=1)[0].cpu().numpy()
            return pred_seg
            
        except Exception as e:
            logger.error(f"Error during SegFormer segmentation: {e}")
            return self._fallback_segmentation(image)
            
    def _fallback_segmentation(self, image: np.ndarray) -> np.ndarray:
        \"\"\"
        A very simple color-based segmentation fallback if ML model is unavailable.
        Returns dummy class IDs.
        \"\"\"
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        
        # Very rough fallback: everything is class 0 (background/safe)
        # Just extracting green stuff as a different class (e.g. vegetation=4)
        lower_green = np.array([35, 50, 50])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        mask[green_mask > 0] = 4
        
        return mask
