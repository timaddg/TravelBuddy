# 🚇 TravelBuddy Real-Time Transportation

This feature adds real-time transportation data to your TravelBuddy application, helping tourists find the best bus, train, and subway routes with live updates.

## ✨ Features

### 🚌 Real-Time Route Finding
- Find optimal routes between any two locations
- Real-time departure and arrival times
- Live status updates (on time, delayed, cancelled)
- Platform information and crowding levels
- Cost estimates and payment methods

### 🚨 Service Alerts
- Real-time service disruptions
- Delay notifications
- Route changes and cancellations
- Severity-based alert system

### 📍 Location Services
- Geocoding for location names
- Nearby transportation stops
- Distance calculations
- Address validation

### 🤖 AI-Powered Recommendations
- Smart route suggestions based on preferences
- Tourist-friendly explanations
- Cultural context and tips
- Simplified language for international travelers

## 🏗️ Architecture

### Backend Components

#### `transport_api.py`
The main transportation API handler with the following classes:

- **`TransportAPI`**: Core class for handling all transport operations
- **`TransportRoute`**: Data class for route information
- **`Location`**: Data class for location coordinates

#### Key Methods:
- `find_best_routes()`: Find optimal routes between locations
- `get_real_time_info()`: Get live updates for specific routes
- `get_service_alerts()`: Fetch current service disruptions
- `get_nearby_stops()`: Find transportation stops near coordinates

### Frontend Components

#### `TransportFinder.tsx`
React component providing:
- Clean, intuitive interface
- Real-time route display
- Service alert notifications
- Responsive design for mobile use

#### `/api/transport/route.ts`
Next.js API endpoint handling:
- Route requests from frontend
- Integration with Gemini AI
- Mock data for demonstration
- Error handling and validation

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd travelbuddy-ui
npm install
```

### 2. Configure API Keys

Create a `.env` file in your project root:

```env
# Required for AI functionality
GEMINI_API_KEY=your_gemini_api_key_here

# Required for real transportation data
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Run the Application

```bash
# Start the frontend
cd travelbuddy-ui
npm run dev

# Run the Python demo (optional)
python transport_demo.py
```

### 4. Access the Transport Finder

Navigate to `http://localhost:3000/transport` or click the "🚇 Transport Finder" button on the main page.

## 🔧 API Integration

### Google Maps Directions API
The system uses Google Maps Directions API for real-time transportation data:

```python
# Get routes using Google Maps API
routes = transport_api.get_google_maps_routes(origin, destination)
```

### Setup Google Maps API
1. **Get API Key**: Visit [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable the following APIs:
   - Directions API
   - Geocoding API
   - Places API (for nearby stops)
3. **Add to .env**: `GOOGLE_MAPS_API_KEY=your_key_here`

### Fallback to Mock Data
When Google Maps API is not available, the system automatically falls back to mock data for demonstration purposes.

### Future Extensions
The system is designed to be easily extensible for additional transit APIs:

#### Local Transit APIs
For city-specific real-time data, you can integrate with local transit authorities:

#### NYC MTA
```python
def get_nyc_mta_routes(self, origin, destination):
    # Implement NYC MTA API integration
    pass
```

#### London TfL
```python
def get_london_tfl_routes(self, origin, destination):
    # Implement London TfL API integration
    pass
```

#### Other Cities
- **Chicago CTA**: Real-time bus and train data
- **San Francisco Muni**: BART and Muni integration
- **Paris RATP**: Metro and bus information
- **Tokyo Metro**: Subway and train schedules

## 📱 Usage Examples

### Basic Route Search
```javascript
// Frontend API call
const response = await fetch('/api/transport', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'Times Square, New York',
    destination: 'JFK Airport, New York',
    preferences: {
      transport_types: ['subway', 'bus'],
      max_duration: 60,
      max_cost: 10
    }
  })
});
```

### Python API Usage
```python
from transport_api import transport_api

# Find routes using Google Maps API
routes = transport_api.find_best_routes(
    origin="Central Park, NYC",
    destination="Brooklyn Bridge, NYC",
    preferences={
        'transport_types': ['subway', 'bus'],
        'max_duration': 45
    }
)

# Get real-time info
for route in routes:
    real_time = transport_api.get_real_time_info(
        route.route_id, 
        route.transport_type, 
        "New York"
    )
    print(f"{route.route_name}: {real_time['status']}")

# Direct Google Maps API call
google_routes = transport_api.get_google_maps_routes(
    origin="Times Square, New York",
    destination="JFK Airport, New York"
)
```

## 🎨 Customization

### Adding New Transport Types
```python
def _get_transport_type(self, vehicle_type: str) -> str:
    # Add new transport types here
    if 'ferry' in vehicle_type:
        return 'ferry'
    elif 'cable_car' in vehicle_type:
        return 'cable_car'
    # ... existing code
```

### Custom Prompts
Modify `prompts.py` to add new transportation-related prompts:

```python
def get_ferry_schedule_prompt(self, schedule_data: str) -> str:
    return f"""You are TravelBuddy, helping tourists understand ferry schedules.
    
    Schedule data:
    {schedule_data}
    
    Format as simple, tourist-friendly information."""
```

### Styling
Customize the React component styling in `TransportFinder.tsx`:

```tsx
// Add new transport icons
const getTransportIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ferry':
      return '⛴️';
    case 'cable_car':
      return '🚡';
    // ... existing cases
  }
};
```

## 🧪 Testing

### Run the Demo
```bash
python transport_demo.py
```

### Test API Endpoints
```bash
# Test the transport API
curl -X POST http://localhost:3000/api/transport \
  -H "Content-Type: application/json" \
  -d '{"origin": "Times Square", "destination": "Central Park"}'
```

### Frontend Testing
```bash
cd travelbuddy-ui
npm test
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-modal routing**: Combine walking, cycling, and public transport
- **Accessibility information**: Wheelchair access, elevator status
- **Bike sharing integration**: Include bike share stations
- **Ride-sharing options**: Uber, Lyft integration
- **Offline support**: Cache routes for offline use
- **Voice navigation**: Voice-guided directions
- **Group travel**: Optimize routes for multiple people

### Advanced Integrations
- **Weather integration**: Route recommendations based on weather
- **Event-based routing**: Special routes for major events
- **Tourist attractions**: Direct routes to popular destinations
- **Language support**: Multi-language interface
- **Cultural context**: Local customs and etiquette tips

## 🐛 Troubleshooting

### Common Issues

#### No Routes Found
- Check API keys are properly configured
- Verify location names are recognizable
- Ensure internet connection is stable

#### API Rate Limits
- Implement caching for frequent requests
- Add retry logic with exponential backoff
- Consider using multiple API providers

#### Location Accuracy
- Use more specific location names
- Add city/country context
- Implement location autocomplete

### Debug Mode
Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📄 License

This transportation module is part of the TravelBuddy project and follows the same licensing terms.

## 🤝 Contributing

To contribute to the transportation functionality:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add type hints for all functions
- Include docstrings for new methods
- Test with multiple cities and transport systems
- Consider international users and accessibility

---

**Happy Traveling! 🚇✈️🗺️** 