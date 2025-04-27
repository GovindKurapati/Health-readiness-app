import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pymongo import MongoClient
from geopy.distance import geodesic
from typing import List

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment Variables
MELISSA_API_KEY = os.getenv("MELISSA_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini API Configuration
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro-latest")

# MongoDB Atlas Setup
mongo_uri = "mongodb+srv://bpgayathriananya:X3IyUryZQUhn3IRn@hospital-locator.n1rx9tp.mongodb.net/?retryWrites=true&w=majority&appName=Hospital-locator"
mongo_client = MongoClient(mongo_uri)
db = mongo_client["Hospital_locator"]  # <<== correct database name
hospital_collection = db["hospitals"]  # <<== correct collection name


# Pydantic Models
class Location(BaseModel):
    latitude: float
    longitude: float


class HospitalInfo(BaseModel):
    name: str
    address: str
    zipcode: str
    latitude: float
    longitude: float
    distance_miles: float


@app.post("/healthcare")
def get_healthcare(data: Location):
    lat, lon = data.latitude, data.longitude

    # Melissa API Call
    MELLISA_URL = "https://reversegeo.melissadata.net/v3/web/ReverseGeoCode/doLookup"
    params = {
        "lat": lat,
        "long": lon,
        "id": MELISSA_API_KEY,
        "format": "json",
        "recs": 1,
    }

    melissa_response = requests.get(MELLISA_URL, params=params)

    if melissa_response.status_code != 200:
        raise HTTPException(status_code=502, detail="Melissa API error")

    records = melissa_response.json().get("Records", [])

    postal_code = records[0]["PostalCode"] if records else "90049"

    # Fetch hospitals within ±1 mile using MongoDB
    user_location = (lat, lon)

    nearby_hospitals = []

    hospitals_cursor = hospital_collection.find({"zip_code": int(postal_code)})

    for hospital in hospitals_cursor:
        hosp_lat, hosp_lon = hospital.get("lat"), hospital.get("long")
        print(hosp_lat, hosp_lon)
        if hosp_lat is None or hosp_lon is None:
            continue

        distance = geodesic(user_location, (hosp_lat, hosp_lon)).miles

        if distance <= 2.0:
            nearby_hospitals.append(
                HospitalInfo(
                    name=hospital.get("name"),
                    address=hospital.get("address"),
                    zipcode=hospital.get("zipcode"),
                    latitude=hosp_lat,
                    longitude=hosp_lon,
                    distance_miles=round(distance, 2),
                )
            )
    services_list = []
    # Gemini API prompt
    for hospital in nearby_hospitals:
        services_list.append(
            {
                "name": hospital.name,
                "address": hospital.address,
                "zipcode": hospital.zipcode,
                "latitude": hospital.latitude,
                "longitude": hospital.longitude,
            }
        )
    health_score = 80  # You can calculate it dynamically based on your logic

    prompt = (
        f"Generate an emergency action plan for a student at ({lat},{lon}), "
        f"with a Health Readiness Score of {health_score} and based on basic human health difficulties suggest health advise. Don't be conversational. Output the plan in a numbered list. Keep it short and concise. "
    )

    gemini_response = model.generate_content(prompt)

    return {
        "score": health_score,
        "plan": gemini_response.text,
        "services": services_list,
        "nearby_hospitals": [hospital.dict() for hospital in nearby_hospitals],
    }
