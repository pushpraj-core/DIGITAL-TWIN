import math
import io
import asyncio
import httpx
import numpy as np
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class LiveDataEngine:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def fetch_satellite_image(self, bounds: dict, zoom: int = 15) -> str:
        """
        Fetches and stitches ESRI World Imagery tiles for the given bounds.
        Returns the path to the saved composite image.
        """
        min_lat = bounds["min_lat"]
        max_lat = bounds["max_lat"]
        min_lng = bounds["min_lng"]
        max_lng = bounds["max_lng"]

        # Calculate slippy map tiles
        def deg2num(lat_deg, lon_deg, zoom):
            lat_rad = math.radians(lat_deg)
            n = 2.0 ** zoom
            xtile = int((lon_deg + 180.0) / 360.0 * n)
            ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
            return (xtile, ytile)

        x_min, y_max = deg2num(min_lat, min_lng, zoom)
        x_max, y_min = deg2num(max_lat, max_lng, zoom)
        
        # Limit to 6x6 tiles (36 requests) to avoid abuse/OOM
        if (x_max - x_min + 1) * (y_max - y_min + 1) > 36:
            # Drop zoom level
            zoom -= 1
            x_min, y_max = deg2num(min_lat, min_lng, zoom)
            x_max, y_min = deg2num(max_lat, max_lng, zoom)

        width = (x_max - x_min + 1) * 256
        height = (y_max - y_min + 1) * 256
        
        result_image = Image.new("RGB", (width, height))

        async def fetch_tile(x, y):
            url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
            try:
                resp = await self.client.get(url)
                if resp.status_code == 200:
                    img = Image.open(io.BytesIO(resp.content))
                    return x, y, img
            except Exception as e:
                logger.warning(f"Failed to fetch tile {x},{y}: {e}")
            return x, y, None

        tasks = []
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tasks.append(fetch_tile(x, y))

        results = await asyncio.gather(*tasks)

        for x, y, img in results:
            if img:
                px = (x - x_min) * 256
                py = (y - y_min) * 256
                result_image.paste(img, (px, py))

        filepath = f"./data/uploads/live_{zoom}_{x_min}_{y_min}.jpg"
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        result_image.save(filepath, "JPEG", quality=90)
        return filepath

    async def fetch_elevation_grid(self, bounds: dict, grid_size: int = 10) -> np.ndarray:
        """
        Fetches an elevation grid using OpenTopoData API (SRTM90m).
        grid_size defines the resolution (e.g. 10x10).
        """
        lats = np.linspace(bounds["min_lat"], bounds["max_lat"], grid_size)
        lngs = np.linspace(bounds["min_lng"], bounds["max_lng"], grid_size)
        
        # OpenTopoData allows up to 100 locations per request
        locations = []
        for lat in lats:
            for lng in lngs:
                locations.append(f"{lat},{lng}")
                
        loc_str = "|".join(locations)
        url = f"https://api.opentopodata.org/v1/srtm90m?locations={loc_str}"
        
        try:
            resp = await self.client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                elevations = [r.get("elevation", 0) or 0 for r in results]
                # reshape to grid_size x grid_size
                # Wait, our grid rows are usually from top (max_lat) to bottom (min_lat)
                grid = np.array(elevations).reshape((grid_size, grid_size))
                # Flip vertically because lats were generated min to max
                grid = np.flipud(grid)
                return grid
        except Exception as e:
            logger.error(f"Failed to fetch elevation: {e}")
            
        return np.zeros((grid_size, grid_size))

    async def fetch_weather(self, lat: float, lng: float) -> dict:
        """
        Fetches live weather from Open-Meteo.
        """
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=precipitation,weather_code,visibility"
        try:
            resp = await self.client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                return {
                    "precipitation": current.get("precipitation", 0),
                    "visibility_m": current.get("visibility", 10000), # default 10km
                    "weather_code": current.get("weather_code", 0)
                }
        except Exception as e:
            logger.error(f"Failed to fetch weather: {e}")
            
        return {"precipitation": 0, "visibility_m": 10000, "weather_code": 0}
