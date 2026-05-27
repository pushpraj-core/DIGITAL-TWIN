"""
Image loading, resizing, tiling, and conversion helpers.

All functions work with OpenCV (numpy) arrays in BGR order unless stated.
"""

from __future__ import annotations

import base64
import io
from typing import Optional

import cv2
import numpy as np
from PIL import Image


def load_image(filepath: str) -> np.ndarray:
    """Load an image from *filepath* and return it as a BGR numpy array.

    Raises ``FileNotFoundError`` if the path does not exist.
    Raises ``ValueError`` if OpenCV cannot decode the file.
    """
    img = cv2.imread(filepath, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Cannot decode image: {filepath}")
    return img


def resize_image(img: np.ndarray, max_size: int = 1024) -> np.ndarray:
    """Resize *img* so that neither dimension exceeds *max_size*, keeping AR."""
    h, w = img.shape[:2]
    if max(h, w) <= max_size:
        return img
    scale = max_size / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def tile_image(
    img: np.ndarray, tile_size: int = 256
) -> list[dict]:
    """Split *img* into non-overlapping tiles.

    Returns a list of dicts: ``{tile: ndarray, row: int, col: int, x: int, y: int}``.
    """
    h, w = img.shape[:2]
    tiles: list[dict] = []
    for r, y in enumerate(range(0, h, tile_size)):
        for c, x in enumerate(range(0, w, tile_size)):
            tile = img[y : y + tile_size, x : x + tile_size]
            tiles.append({"tile": tile, "row": r, "col": c, "x": x, "y": y})
    return tiles


def create_mask_overlay(
    img: np.ndarray,
    mask: np.ndarray,
    colors: Optional[dict[int, tuple[int, int, int]]] = None,
    alpha: float = 0.45,
) -> np.ndarray:
    """Overlay a segmentation *mask* on *img* with per-class colours.

    *colors* maps integer class IDs to BGR tuples.  Missing classes default
    to (128, 128, 128).
    """
    if colors is None:
        colors = {}
    overlay = img.copy()
    for class_id in np.unique(mask):
        if class_id == 0:
            continue  # background
        colour = colors.get(int(class_id), (128, 128, 128))
        overlay[mask == class_id] = colour
    return cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)


def image_to_base64(img: np.ndarray, fmt: str = ".png") -> str:
    """Encode an OpenCV image to a base-64 string."""
    success, buf = cv2.imencode(fmt, img)
    if not success:
        raise ValueError("Failed to encode image")
    return base64.b64encode(buf.tobytes()).decode("utf-8")


def base64_to_image(b64: str) -> np.ndarray:
    """Decode a base-64 string back to a BGR numpy array."""
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode base64 image")
    return img
