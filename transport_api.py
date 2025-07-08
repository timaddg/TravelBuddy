# transport_api.py
# Real-time transportation data integration for TravelBuddy

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from geopy.geocoders import Nominatim
import json

@dataclass
class TransportRoute:
    """Data class for transport route information"""
    route_id: str
    route_name: str
    transport_type: str  # 'bus', 'train', 'subway', 'tram'
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    cost: Optional[str] = None
    platform: Optional[str] = None
    status: str = "On Time"
    real_time_info: Optional[Dict] = None

@dataclass
class Location:
    """Data class for location information"""
    name: str
    latitude: float
    longitude: float
    address: str

class TransportAPI:
    """Main class for handling real-time transportation data using Google Maps API"""
    
    def __init__(self):
        self.geolocator = Nominatim(user_agent="TravelBuddy")
        self.session = requests.Session()
        
        # Google Maps API configuration
        self.google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.google_maps_base_url = 'https://maps.googleapis.com/maps/api/directions/json'
    
    def get_location_coordinates(self, location_name: str) -> Optional[Location]:
        """Get coordinates for a location name"""
        try:
            location = self.geolocator.geocode(location_name)
            if location:
                return Location(
                    name=location_name,
                    latitude=location.latitude,
                    longitude=location.longitude,
                    address=location.address
                )
        except Exception as e:
            print(f"Error getting coordinates for {location_name}: {e}")
        return None
    
    def get_google_maps_routes(self, origin: str, destination: str, 
                              transport_mode: str = "transit") -> List[TransportRoute]:
        """Get routes using Google Maps Directions API"""
        if not self.google_maps_api_key:
            print("Warning: GOOGLE_MAPS_API_KEY not found. Using mock data.")
            return self.get_mock_routes(origin, destination)
        
        try:
            params = {
                'origin': origin,
                'destination': destination,
                'mode': transport_mode,
                'key': self.google_maps_api_key,
                'alternatives': 'true',
                'transit_mode': 'bus|subway|train|tram'
            }
            
            response = self.session.get(
                self.google_maps_base_url,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                routes = []
                
                if data.get('status') == 'OK':
                    for route in data.get('routes', []):
                        for leg in route.get('legs', []):
                            for step in leg.get('steps', []):
                                if step.get('travel_mode') == 'TRANSIT':
                                    transit_details = step.get('transit_details', {})
                                    line = transit_details.get('line', {})
                                    
                                    route_obj = TransportRoute(
                                        route_id=line.get('short_name', 'Unknown'),
                                        route_name=line.get('name', 'Unknown Route'),
                                        transport_type=self._get_transport_type(line.get('vehicle', {}).get('type', '')),
                                        destination=transit_details.get('headsign', 'Unknown'),
                                        departure_time=transit_details.get('departure_time', {}).get('text', 'Unknown'),
                                        arrival_time=transit_details.get('arrival_time', {}).get('text', 'Unknown'),
                                        duration=step.get('duration', {}).get('text', 'Unknown'),
                                        platform=transit_details.get('departure_stop', {}).get('name', 'Unknown')
                                    )
                                    routes.append(route_obj)
                    
                    return routes
                else:
                    print(f"Google Maps API error: {data.get('status')} - {data.get('error_message', 'Unknown error')}")
                    return self.get_mock_routes(origin, destination)
                
        except Exception as e:
            print(f"Error getting Google Maps routes: {e}")
            return self.get_mock_routes(origin, destination)
        
        return self.get_mock_routes(origin, destination)
    
    def get_mock_routes(self, origin: str, destination: str) -> List[TransportRoute]:
        """Generate mock routes for demonstration when API is not available"""
        now = datetime.now()
        routes = [
            TransportRoute(
                route_id="101",
                route_name="Express Bus 101",
                transport_type="bus",
                destination=destination,
                departure_time=(now + timedelta(minutes=5)).strftime('%H:%M'),
                arrival_time=(now + timedelta(minutes=25)).strftime('%H:%M'),
                duration="20 minutes",
                cost="$2.50",
                platform="Platform 3",
                status="On Time",
                real_time_info={
                    'crowding_level': 'Medium',
                    'next_departure': (now + timedelta(minutes=5)).strftime('%H:%M')
                }
            ),
            TransportRoute(
                route_id="A",
                route_name="Train Line A",
                transport_type="train",
                destination=destination,
                departure_time=(now + timedelta(minutes=8)).strftime('%H:%M'),
                arrival_time=(now + timedelta(minutes=18)).strftime('%H:%M'),
                duration="10 minutes",
                cost="$3.75",
                platform="Platform 1",
                status="Delayed",
                real_time_info={
                    'crowding_level': 'Low',
                    'next_departure': (now + timedelta(minutes=8)).strftime('%H:%M'),
                    'delay_minutes': 3
                }
            ),
            TransportRoute(
                route_id="1",
                route_name="Subway Line 1",
                transport_type="subway",
                destination=destination,
                departure_time=(now + timedelta(minutes=2)).strftime('%H:%M'),
                arrival_time=(now + timedelta(minutes=22)).strftime('%H:%M'),
                duration="20 minutes",
                cost="$2.00",
                platform="Platform 2",
                status="On Time",
                real_time_info={
                    'crowding_level': 'High',
                    'next_departure': (now + timedelta(minutes=2)).strftime('%H:%M')
                }
            )
        ]
        return routes
    
    def get_real_time_info(self, route_id: str, transport_type: str, city: str) -> Dict:
    """Get real-time information for a specific route"""
    # This would integrate with specific city transit APIs
    # For now, return mock data
    return self.get_mock_real_time_data(route_id, transport_type)

def generate_google_maps_link(self, origin: str, destination: str) -> str:
    """Generate a Google Maps directions link for the route"""
    import urllib.parse
    encoded_origin = urllib.parse.quote(origin)
    encoded_destination = urllib.parse.quote(destination)
    return f"https://www.google.com/maps/dir/{encoded_origin}/{encoded_destination}/data=!3m1!4b1!4m2!4m1!3e3"
    
    def get_mock_real_time_data(self, route_id: str, transport_type: str) -> Dict:
        """Generate mock real-time data for demonstration purposes"""
        import random
        
        statuses = ["On Time", "Delayed", "Early", "Cancelled"]
        delays = [0, 5, 10, 15, -5, -10]
        
        return {
            'route_id': route_id,
            'status': random.choice(statuses),
            'delay_minutes': random.choice(delays),
            'crowding_level': random.choice(['Low', 'Medium', 'High']),
            'next_departure': (datetime.now() + timedelta(minutes=random.randint(1, 30))).strftime('%H:%M'),
            'platform': f"Platform {random.randint(1, 20)}",
            'real_time_available': True
        }
    
    def find_best_routes(self, origin: str, destination: str, 
                        preferences: Dict = None) -> List[TransportRoute]:
        """Find the best transportation routes between two locations"""
        
        # Get routes from Google Maps API
        routes = self.get_google_maps_routes(origin, destination)
        
        # Add real-time information to routes
        for route in routes:
            route.real_time_info = self.get_real_time_info(
                route.route_id, route.transport_type, "default"
            )
        
        # Sort routes based on preferences
        if preferences:
            routes = self._sort_routes_by_preferences(routes, preferences)
        
        return routes[:5]  # Return top 5 routes
    
    def _sort_routes_by_preferences(self, routes: List[TransportRoute], 
                                   preferences: Dict) -> List[TransportRoute]:
        """Sort routes based on user preferences"""
        def route_score(route):
            score = 0
            
            # Prefer faster routes
            if 'duration' in route.duration:
                try:
                    duration_minutes = int(route.duration.split()[0])
                    score -= duration_minutes  # Lower duration = higher score
                except:
                    pass
            
            # Prefer certain transport types
            transport_preferences = preferences.get('transport_types', [])
            if route.transport_type in transport_preferences:
                score += 10
            
            # Prefer cheaper routes
            if route.cost and 'cost' in preferences:
                try:
                    cost = float(route.cost.replace('$', '').replace(',', ''))
                    score -= cost * 0.1  # Lower cost = higher score
                except:
                    pass
            
            return score
        
        return sorted(routes, key=route_score, reverse=True)
    
    def _get_transport_type(self, vehicle_type: str) -> str:
        """Convert vehicle type to standardized transport type"""
        vehicle_type = vehicle_type.lower()
        
        if 'bus' in vehicle_type:
            return 'bus'
        elif 'train' in vehicle_type or 'rail' in vehicle_type:
            return 'train'
        elif 'subway' in vehicle_type or 'metro' in vehicle_type:
            return 'subway'
        elif 'tram' in vehicle_type or 'streetcar' in vehicle_type:
            return 'tram'
        else:
            return 'unknown'
    
    def get_nearby_stops(self, latitude: float, longitude: float, 
                        radius_km: float = 1.0) -> List[Dict]:
        """Get nearby transportation stops"""
        # This would integrate with Google Places API for real data
        # For now, return mock data
        return [
            {
                'name': 'Central Station',
                'distance': '0.2 km',
                'routes': ['Bus 101', 'Train A', 'Subway Line 1'],
                'coordinates': [latitude + 0.001, longitude + 0.001]
            },
            {
                'name': 'Downtown Bus Stop',
                'distance': '0.5 km',
                'routes': ['Bus 102', 'Bus 103'],
                'coordinates': [latitude - 0.002, longitude + 0.002]
            }
        ]
    
    def get_service_alerts(self, city: str = None) -> List[Dict]:
        """Get service alerts and disruptions"""
        # This would integrate with transit agency APIs
        # For now, return mock data
        return [
            {
                'type': 'Delay',
                'route': 'Bus 101',
                'message': 'Bus 101 is running 10 minutes late due to traffic',
                'severity': 'Medium',
                'affected_stops': ['Central Station', 'Downtown']
            },
            {
                'type': 'Service Change',
                'route': 'Train A',
                'message': 'Train A will not stop at Main Street Station today',
                'severity': 'High',
                'affected_stops': ['Main Street Station']
            }
        ]

# Global instance for easy access
transport_api = TransportAPI() 