
import requests
from PIL import Image
from io import BytesIO

def get_viirs_lighting_data(lat: float, lon: float) -> float:
    """
    Gets the VIIRS lighting data for a given location.
    Makes a request to the NASA GIBS WMS API to get an image,
    then processes the image to calculate an average brightness value.
    """
    # Define the bounding box for the request (a small area around the given lat/lon)
    bbox = [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01]

    # Define the WMS request URL
    url = (
        f"https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?"
        f"SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&"
        f"LAYERS=VIIRS_SNPP_DayNightBand_ENCC&STYLES=&FORMAT=image/png&"
        f"TRANSPARENT=true&HEIGHT=10&WIDTH=10&CRS=EPSG:4326&"
        f"BBOX={','.join(map(str, bbox))}&TIME=2025-08-29"
    )

    try:
        # Make the request to the API
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Open the image from the response content
        image = Image.open(BytesIO(response.content)).convert("L")  # Convert to grayscale

        # Calculate the average brightness of the pixels
        pixels = list(image.getdata())
        if not pixels:
            return 0.0
        
        brightness = sum(pixels) / len(pixels)
        return brightness / 255.0  # Normalize to a value between 0 and 1

    except requests.exceptions.RequestException as e:
        print(f"Error fetching VIIRS data: {e}")
        return 0.0
    except Exception as e:
        print(f"Error processing VIIRS image: {e}")
        return 0.0
