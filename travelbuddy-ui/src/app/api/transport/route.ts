import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock transport data for demonstration
// In a real implementation, this would call your Python transport_api.py

interface TransportRoute {
  route_id: string;
  route_name: string;
  transport_type: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  cost?: string;
  platform?: string;
  status: string;
  real_time_info?: any;
}

function getMockTransportRoutes(origin: string, destination: string): TransportRoute[] {
  const now = new Date();
  const routes: TransportRoute[] = [
    {
      route_id: "101",
      route_name: "Express Bus 101",
      transport_type: "bus",
      destination: destination,
      departure_time: new Date(now.getTime() + 5 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      arrival_time: new Date(now.getTime() + 25 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: "20 minutes",
      cost: "$2.50",
      platform: "Platform 3",
      status: "On Time",
      real_time_info: {
        crowding_level: "Medium",
        next_departure: new Date(now.getTime() + 5 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    },
    {
      route_id: "A",
      route_name: "Train Line A",
      transport_type: "train",
      destination: destination,
      departure_time: new Date(now.getTime() + 8 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      arrival_time: new Date(now.getTime() + 18 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: "10 minutes",
      cost: "$3.75",
      platform: "Platform 1",
      status: "Delayed",
      real_time_info: {
        crowding_level: "Low",
        next_departure: new Date(now.getTime() + 8 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        delay_minutes: 3
      }
    },
    {
      route_id: "1",
      route_name: "Subway Line 1",
      transport_type: "subway",
      destination: destination,
      departure_time: new Date(now.getTime() + 2 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      arrival_time: new Date(now.getTime() + 22 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: "20 minutes",
      cost: "$2.00",
      platform: "Platform 2",
      status: "On Time",
      real_time_info: {
        crowding_level: "High",
        next_departure: new Date(now.getTime() + 2 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    }
  ];

  return routes;
}

function getServiceAlerts(): any[] {
  return [
    {
      type: "Delay",
      route: "Train Line A",
      message: "Train Line A is running 3 minutes late due to signal issues",
      severity: "Medium",
      affected_stops: ["Central Station", "Downtown"]
    },
    {
      type: "Service Change",
      route: "Bus 102",
      message: "Bus 102 will not stop at Main Street Station today due to construction",
      severity: "High",
      affected_stops: ["Main Street Station"]
    }
  ];
}

function formatRoutesForPrompt(routes: TransportRoute[]): string {
  return routes.map((route, index) => `
OPTION ${index + 1}: ${route.route_name}
• Type: ${route.transport_type.toUpperCase()}
• Route: ${route.route_id}
• Departure: ${route.departure_time}
• Arrival: ${route.arrival_time}
• Duration: ${route.duration}
• Cost: ${route.cost || 'Unknown'}
• Status: ${route.status}
• Platform: ${route.platform || 'Unknown'}
• Crowding: ${route.real_time_info?.crowding_level || 'Unknown'}
`).join('\n');
}

function generateGoogleMapsLink(origin: string, destination: string): string {
  const encodedOrigin = encodeURIComponent(origin);
  const encodedDestination = encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/${encodedOrigin}/${encodedDestination}/data=!3m1!4b1!4m2!4m1!3e3`;
}

function getRealTimeTransportPrompt(origin: string, destination: string, routesData: string): string {
  const googleMapsLink = generateGoogleMapsLink(origin, destination);
  
  return `You are TravelBuddy. Give SHORT, PRECISE transport info for tourists.

From: ${origin} → To: ${destination}

Available routes:
${routesData}

Format as:
🚇 Quick Routes to ${destination}

1️⃣ [Route Name] - [Duration] - [Cost]
• [Transport type] • [Departure] → [Arrival]
• Status: [On time/Delayed] • Platform: [Number]
• [One helpful tip or note]

2️⃣ [Route Name] - [Duration] - [Cost]
• [Transport type] • [Departure] → [Arrival]
• Status: [On time/Delayed] • Platform: [Number]
• [One helpful tip or note]

🚨 Alerts: [Only if delays/changes exist]

🗺️ ${googleMapsLink}

Each option: 50 words max. Focus on essential info only.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, preferences } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    // Get mock transport routes (in real implementation, call your Python API)
    const routes = getMockTransportRoutes(origin, destination);
    const alerts = getServiceAlerts();

    // Format routes for the prompt
    const routesData = formatRoutesForPrompt(routes);

    // Create the prompt
    const prompt = getRealTimeTransportPrompt(origin, destination, routesData);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      simplified_text: text,
      raw_routes: routes,
      service_alerts: alerts,
      metadata: {
        origin,
        destination,
        timestamp: new Date().toISOString(),
        route_count: routes.length
      }
    });

  } catch (error) {
    console.error("Error in transport API:", error);
    return NextResponse.json(
      { error: "Failed to process transport request" },
      { status: 500 }
    );
  }
} 