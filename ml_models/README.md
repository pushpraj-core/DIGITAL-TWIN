# ML Models Configuration

This directory contains configuration files for the AI/ML models used in the Tactical Digital Twin platform.

## Models

### YOLOv8 - Tactical Object Detection
- **Purpose**: Detect tactical objects in satellite/drone imagery (buildings, vehicles, roads, bridges)
- **Base Model**: `yolov8n.pt` (nano) for speed, `yolov8m.pt` (medium) for accuracy
- **Config**: `configs/yolo_terrain.yaml`

### SegFormer - Semantic Segmentation
- **Purpose**: Pixel-wise terrain classification
- **Base Model**: `nvidia/segformer-b0-finetuned-ade-512-512` from HuggingFace
- **Config**: `configs/segformer_config.json`

### Risk Model - Random Forest
- **Purpose**: Terrain risk prediction
- **Training**: Synthetic tactical data (auto-generated on first run)
- **Features**: terrain_class, elevation, slope, cover_distance, visibility, threat_distance

## Setup

1. Model weights are downloaded automatically on first use
2. For offline use, place weights in `weights/` directory
3. GPU acceleration: Set `ML_DEVICE=cuda` in `.env`

## Fine-Tuning

For production accuracy on specific terrain types, fine-tune on:
- [SpaceNet](https://spacenet.ai/) - Satellite imagery building/road detection
- [DeepGlobe](http://deepglobe.org/) - Land cover classification
- [DOTA](https://captain-whu.github.io/DOTA/) - Aerial object detection
