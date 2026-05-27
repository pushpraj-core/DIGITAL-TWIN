"""
Terrain Intelligence Engine
============================
Analyses uploaded satellite / aerial imagery to produce structured terrain
segments, classification grids, and layer overlays.

Pipeline
--------
1. Load & pre-process the image (OpenCV).
2. HSV colour-based segmentation (water, vegetation, road, building, …).
3. Canny edge detection for structure boundaries.
4. Contour extraction → polygon segments.
5. (Optional) YOLO object detection if weights are available.
6. (Optional) SegFormer semantic segmentation if weights are available.
7. Assemble ``TerrainAnalysisResult``.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

import cv2
import numpy as np

from models.terrain import TerrainAnalysisResult, TerrainSegment
from utils.image_utils import load_image, resize_image, image_to_base64
from utils.grid_utils import (
    TERRAIN_CLASSES,
    create_terrain_grid,
    apply_segments_to_grid,
)

logger = logging.getLogger(__name__)

# ── HSV class ranges (BGR → HSV) ───────────────────────────────────────────
# Each entry: (label, lower_hsv, upper_hsv)
HSV_RULES: list[tuple[str, tuple[int, ...], tuple[int, ...]]] = [
    ("water",       (90, 50, 50),   (130, 255, 255)),
    ("vegetation",  (35, 40, 40),   (85, 255, 255)),
    ("road",        (0, 0, 80),     (180, 50, 200)),
    ("building",    (10, 50, 50),   (25, 200, 200)),
    ("open",        (20, 20, 150),  (40, 100, 255)),
]


class TerrainIntelligenceEngine:
    """Stateless terrain analysis engine."""

    def __init__(self) -> None:
        self._yolo: Any = None
        self._segformer: Any = None
        self._try_load_ml()

    # ── ML model loading (best-effort) ──────────────────────────────────────

    def _try_load_ml(self) -> None:
        """Attempt to load YOLO and SegFormer.  Failures are non-fatal."""
        try:
            from ml.yolo_detector import YOLODetector
            self._yolo = YOLODetector()
            logger.info("YOLO detector loaded")
        except Exception as exc:
            logger.warning("YOLO unavailable – OpenCV fallback: %s", exc)

        try:
            from ml.segformer_segmenter import SegFormerSegmenter
            self._segformer = SegFormerSegmenter()
            logger.info("SegFormer segmenter loaded")
        except Exception as exc:
            logger.warning("SegFormer unavailable – OpenCV fallback: %s", exc)

    # ── Public API ──────────────────────────────────────────────────────────

    def analyze_image(
        self,
        image_path: str,
        *,
        analysis_id: Optional[str] = None,
        grid_resolution: int = 100,
    ) -> TerrainAnalysisResult:
        """Run the full terrain analysis pipeline on *image_path*."""
        analysis_id = analysis_id or uuid.uuid4().hex[:12]

        # 1. Load & resize
        img = load_image(image_path)
        img = resize_image(img, max_size=1024)
        h, w = img.shape[:2]

        # Synthetic geographic bounds (image-space mapped to lat/lng)
        bounds = {
            "min_lat": 28.50,
            "max_lat": 28.50 + h / 10000,
            "min_lng": 77.00,
            "max_lng": 77.00 + w / 10000,
        }

        # 2. Colour segmentation
        segments = self._colour_segmentation(img, bounds)

        # 3. Edge-detected structures
        edge_segments = self._edge_detection(img, bounds)
        segments.extend(edge_segments)

        # 4. ML-enhanced detection (if available)
        if self._yolo is not None:
            ml_segments = self._yolo_detection(img, bounds)
            segments.extend(ml_segments)

        if self._segformer is not None:
            seg_mask = self._segformer.segment(img)
            # Merge mask-based segments
            mask_segments = self._mask_to_segments(seg_mask, bounds)
            segments.extend(mask_segments)

        # 5. Collect distinct terrain classes
        terrain_classes = sorted({s.type for s in segments}) or ["open"]

        # 6. Build layers dict
        layers = self._build_layers(img, segments)

        return TerrainAnalysisResult(
            id=analysis_id,
            segments=segments,
            layers=layers,
            terrain_classes=terrain_classes,
            bounds=bounds,
        )

    def generate_terrain_grid(
        self,
        analysis_result: TerrainAnalysisResult,
        resolution: int = 100,
    ) -> np.ndarray:
        """Convert analysis segments to a 2-D integer terrain grid."""
        grid = create_terrain_grid(resolution, resolution, default_class="open")

        # Convert segment polygons to grid-space and paint
        h, w = resolution, resolution
        bounds = analysis_result.bounds
        lat_range = bounds["max_lat"] - bounds["min_lat"]
        lng_range = bounds["max_lng"] - bounds["min_lng"]

        grid_segments: list[dict] = []
        for seg in analysis_result.segments:
            poly_grid: list[list[int]] = []
            for coord in seg.polygon:
                col = int(
                    (coord[0] - bounds["min_lng"]) / max(lng_range, 1e-9) * (w - 1)
                )
                row = int(
                    (bounds["max_lat"] - coord[1]) / max(lat_range, 1e-9) * (h - 1)
                )
                col = max(0, min(w - 1, col))
                row = max(0, min(h - 1, row))
                poly_grid.append([col, row])
            grid_segments.append({"type": self.classify_terrain(seg.type), "polygon": poly_grid})

        grid = apply_segments_to_grid(grid, grid_segments)
        return grid

    @staticmethod
    def classify_terrain(segment_type: str) -> str:
        """Map a raw segment type to a tactical terrain class."""
        mapping = {
            "road": "exposed",
            "building": "urban",
            "water": "obstacle",
            "vegetation": "forest",
            "forest": "forest",
            "bridge": "safe",
            "open": "exposed",
            "obstacle": "obstacle",
            "hill": "high_ground",
        }
        return mapping.get(segment_type.lower(), "open")

    # ── Internal: Colour Segmentation ───────────────────────────────────────

    def _colour_segmentation(
        self, img: np.ndarray, bounds: dict[str, float]
    ) -> list[TerrainSegment]:
        """HSV thresholding per terrain class → polygon segments."""
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h_img, w_img = img.shape[:2]
        segments: list[TerrainSegment] = []

        for label, lower, upper in HSV_RULES:
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            # Morphological cleanup
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

            contours, _ = cv2.findContours(
                mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 200:  # skip noise
                    continue

                epsilon = 0.02 * cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, epsilon, True)
                polygon = self._contour_to_latlng(approx, h_img, w_img, bounds)

                confidence = min(1.0, area / (h_img * w_img) * 10)
                segments.append(
                    TerrainSegment(
                        type=label, polygon=polygon, confidence=round(confidence, 3)
                    )
                )
        return segments

    # ── Internal: Edge Detection ────────────────────────────────────────────

    def _edge_detection(
        self, img: np.ndarray, bounds: dict[str, float]
    ) -> list[TerrainSegment]:
        """Canny edge detection → structure boundary polygons."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        edges = cv2.dilate(edges, kernel, iterations=1)

        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        h_img, w_img = img.shape[:2]
        segments: list[TerrainSegment] = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 500:
                continue
            perimeter = cv2.arcLength(cnt, True)
            circularity = 4 * np.pi * area / (perimeter ** 2 + 1e-6)

            # High circularity → likely a building or structure
            label = "building" if circularity > 0.4 else "obstacle"
            epsilon = 0.03 * perimeter
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            polygon = self._contour_to_latlng(approx, h_img, w_img, bounds)
            segments.append(
                TerrainSegment(type=label, polygon=polygon, confidence=0.5)
            )
        return segments

    # ── Internal: YOLO-enhanced detection ───────────────────────────────────

    def _yolo_detection(
        self, img: np.ndarray, bounds: dict[str, float]
    ) -> list[TerrainSegment]:
        """Run YOLO detector and convert bounding boxes to terrain segments."""
        if self._yolo is None:
            return []
        detections = self._yolo.detect(img)
        h_img, w_img = img.shape[:2]
        segments: list[TerrainSegment] = []
        for det in detections:
            cls_name = det.get("class", "obstacle")
            bbox = det.get("bbox", [0, 0, 0, 0])  # x1, y1, x2, y2
            conf = det.get("confidence", 0.5)
            x1, y1, x2, y2 = bbox
            # Convert bbox corners to polygon
            corners_px = np.array([
                [[x1, y1]], [[x2, y1]], [[x2, y2]], [[x1, y2]]
            ], dtype=np.int32)
            polygon = self._contour_to_latlng(corners_px, h_img, w_img, bounds)
            segments.append(
                TerrainSegment(type=cls_name, polygon=polygon, confidence=conf)
            )
        return segments

    # ── Internal: Mask → Segments ───────────────────────────────────────────

    def _mask_to_segments(
        self, mask: np.ndarray, bounds: dict[str, float]
    ) -> list[TerrainSegment]:
        """Convert a per-pixel class mask to polygon segments."""
        h_img, w_img = mask.shape[:2]
        segments: list[TerrainSegment] = []
        class_names = ["background", "road", "vegetation", "water", "building", "open"]

        for cls_id in np.unique(mask):
            if cls_id == 0:
                continue
            binary = (mask == cls_id).astype(np.uint8) * 255
            contours, _ = cv2.findContours(
                binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            label = class_names[cls_id] if cls_id < len(class_names) else "open"
            for cnt in contours:
                if cv2.contourArea(cnt) < 200:
                    continue
                epsilon = 0.02 * cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, epsilon, True)
                polygon = self._contour_to_latlng(approx, h_img, w_img, bounds)
                segments.append(
                    TerrainSegment(type=label, polygon=polygon, confidence=0.7)
                )
        return segments

    # ── Internal: Build layers ──────────────────────────────────────────────

    def _build_layers(
        self, img: np.ndarray, segments: list[TerrainSegment]
    ) -> dict[str, Any]:
        """Produce named visualisation layers."""
        layers: dict[str, Any] = {}

        # Grayscale base layer
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        layers["grayscale"] = image_to_base64(gray)

        # Edge layer
        edges = cv2.Canny(gray, 50, 150)
        layers["edges"] = image_to_base64(edges)

        # Segment overlay
        overlay = img.copy()
        class_colours = {
            "water": (255, 100, 0),
            "vegetation": (0, 200, 0),
            "road": (128, 128, 128),
            "building": (0, 100, 200),
            "open": (200, 200, 200),
            "obstacle": (0, 0, 200),
        }
        h_img, w_img = img.shape[:2]
        for seg in segments:
            colour = class_colours.get(seg.type, (128, 128, 128))
            # Convert polygon lat/lng back to pixel coords for overlay
            pts = self._latlng_to_pixel(
                seg.polygon, h_img, w_img,
                {
                    "min_lat": min(p[1] for p in seg.polygon),
                    "max_lat": max(p[1] for p in seg.polygon),
                    "min_lng": min(p[0] for p in seg.polygon),
                    "max_lng": max(p[0] for p in seg.polygon),
                },
            )
            if len(pts) >= 3:
                cv2.fillPoly(overlay, [np.array(pts, dtype=np.int32)], colour)
        blended = cv2.addWeighted(overlay, 0.4, img, 0.6, 0)
        layers["segmentation_overlay"] = image_to_base64(blended)

        return layers

    # ── Coordinate helpers ──────────────────────────────────────────────────

    @staticmethod
    def _contour_to_latlng(
        contour: np.ndarray,
        img_h: int,
        img_w: int,
        bounds: dict[str, float],
    ) -> list[list[float]]:
        """Convert pixel contour to [lng, lat] coordinate list."""
        lat_range = bounds["max_lat"] - bounds["min_lat"]
        lng_range = bounds["max_lng"] - bounds["min_lng"]
        coords: list[list[float]] = []
        for pt in contour.reshape(-1, 2):
            px, py = float(pt[0]), float(pt[1])
            lng = bounds["min_lng"] + (px / max(img_w - 1, 1)) * lng_range
            lat = bounds["max_lat"] - (py / max(img_h - 1, 1)) * lat_range
            coords.append([round(lng, 7), round(lat, 7)])
        return coords

    @staticmethod
    def _latlng_to_pixel(
        polygon: list[list[float]],
        img_h: int,
        img_w: int,
        bounds: dict[str, float],
    ) -> list[list[int]]:
        """Convert [lng, lat] polygon back to pixel [x, y]."""
        lat_range = bounds["max_lat"] - bounds["min_lat"]
        lng_range = bounds["max_lng"] - bounds["min_lng"]
        pixels: list[list[int]] = []
        for coord in polygon:
            lng, lat = coord
            x = int((lng - bounds["min_lng"]) / max(lng_range, 1e-9) * (img_w - 1))
            y = int((bounds["max_lat"] - lat) / max(lat_range, 1e-9) * (img_h - 1))
            pixels.append([max(0, min(img_w - 1, x)), max(0, min(img_h - 1, y))])
        return pixels
