'use client';

import { useState, useRef, useEffect } from "react";

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stats?: {
    originalLength: number;
    simplifiedLength: number;
    reduction: string;
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setListening(false);
        };
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Voice recognition functions
  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Function to detect if the input is a transport query
  function isTransportQuery(text: string): boolean {
    const transportKeywords = [
      'how do i get', 'how to get', 'transport', 'bus', 'train', 'subway', 'metro',
      'route', 'directions', 'from', 'to', 'airport', 'station', 'stop',
      'public transport', 'transit', 'commute', 'travel between'
    ];
    
    const lowerText = text.toLowerCase();
    return transportKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Function to extract origin and destination from transport query
  function extractLocations(text: string): { origin: string | null, destination: string | null } {
    const lowerText = text.toLowerCase();
    
    // Look for "from X to Y" pattern
    const fromToMatch = text.match(/from\s+([^,\n]+?)\s+to\s+([^,\n]+?)(?:\s|$|\.|,)/i);
    if (fromToMatch) {
      return {
        origin: fromToMatch[1].trim(),
        destination: fromToMatch[2].trim()
      };
    }
    
    // Look for "between X and Y" pattern
    const betweenMatch = text.match(/between\s+([^,\n]+?)\s+and\s+([^,\n]+?)(?:\s|$|\.|,)/i);
    if (betweenMatch) {
      return {
        origin: betweenMatch[1].trim(),
        destination: betweenMatch[2].trim()
      };
    }
    
    // Look for "X to Y" pattern
    const toMatch = text.match(/([^,\n]+?)\s+to\s+([^,\n]+?)(?:\s|$|\.|,)/i);
    if (toMatch) {
      return {
        origin: toMatch[1].trim(),
        destination: toMatch[2].trim()
      };
    }
    
    return { origin: null, destination: null };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setError("");
    setInput("");

    try {
      // Check if this is a transport query
      if (isTransportQuery(input)) {
        const locations = extractLocations(input);
        
        if (locations.origin && locations.destination) {
          // Handle transport query
          const res = await fetch("/api/transport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin: locations.origin,
              destination: locations.destination,
              preferences: {
                transport_types: ['bus', 'train', 'subway'],
                max_duration: 60,
                max_cost: 10
              }
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to get transport information");
          }

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.simplified_text,
            timestamp: new Date()
          };

          setChatHistory(prev => [...prev, assistantMessage]);
        } else {
          // Transport query but couldn't extract locations
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `🚇 I can help you find transport routes! Please specify your origin and destination clearly. For example:\n\n• "How do I get from Times Square to Central Park?"\n• "Transport from JFK Airport to Manhattan"\n• "Route from Brooklyn Bridge to Empire State Building"\n\nOr visit the 🚇 Transport Finder for a dedicated interface.`,
            timestamp: new Date()
          };
          setChatHistory(prev => [...prev, assistantMessage]);
        }
      } else {
        // Handle regular text simplification
        const res = await fetch("/api/simplify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userInput: input,
            promptType: "general"
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to simplify text");
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.result,
          timestamp: new Date(),
          stats: {
            originalLength: data.originalLength,
            simplifiedLength: data.simplifiedLength,
            reduction: data.reduction
          }
        };

        setChatHistory(prev => [...prev, assistantMessage]);
      }

    } catch (err: any) {
      setError(err.message);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${err.message}`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setChatHistory([]);
    setError("");
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-gray-100 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">🗺️</div>
                <div className="text-2xl">✈️</div>
                <div className="text-2xl">🏛️</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TravelBuddy AI</h1>
                <p className="text-sm text-gray-600">Your AI travel companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 border border-gray-300"
              >
                🗑️ Clear Chat
              </button>
              <div className="text-sm text-gray-600">
                Powered by Gemini AI
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Chat History */}
          <div className="flex-1 bg-gray-50 rounded-t-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🗺️</div>
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🏛️</div>
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🗽</div>
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🗼</div>
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0.8s' }}>🏰</div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to TravelBuddy!</h2>
                  <p className="text-gray-600 mb-4">Ask me anything about travel - I'll help simplify complex information for you.</p>
                  <div className="flex justify-center space-x-2 text-sm text-gray-500">
                    <span>🗺️ Maps & Directions</span>
                    <span>•</span>
                    <span>🏛️ Cultural Sites</span>
                    <span>•</span>
                    <span>🍽️ Local Cuisine</span>
                    <span>•</span>
                    <span>🚇 Real-time Transport</span>
                  </div>
                </div>
              )}

              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="text-lg">
                        {message.type === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">
                          {message.content.split('\n').map((line, index) => {
                            // Check if line contains a Google Maps link
                            const googleMapsMatch = line.match(/https:\/\/www\.google\.com\/maps\/dir\/[^\s]+/);
                            if (googleMapsMatch) {
                              const url = googleMapsMatch[0];
                              const beforeUrl = line.substring(0, line.indexOf(url));
                              const afterUrl = line.substring(line.indexOf(url) + url.length);
                              
                              return (
                                <div key={index}>
                                  {beforeUrl}
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                  >
                                    🗺️ Open in Google Maps
                                  </a>
                                  {afterUrl}
                                </div>
                              );
                            }
                            return <div key={index}>{line}</div>;
                          })}
                        </div>
                        {message.stats && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-bold text-blue-600">{message.stats.originalLength}</div>
                                <div className="text-gray-500">Original</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-green-600">{message.stats.simplifiedLength}</div>
                                <div className="text-gray-500">Simplified</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold ${parseFloat(message.stats.reduction) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {message.stats.reduction}%
                                </div>
                                <div className="text-gray-500">Reduction</div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {message.type === 'assistant' && !message.content.startsWith('❌') && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">🤖</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-gray-50 rounded-b-2xl border-t-0 border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about travel information, directions, cultural customs, or anything else..."
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  disabled={loading}
                />
              </div>
              {/* Microphone Button */}
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm ${
                  listening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ fontSize: '1.5rem' }}
                title={listening ? "Stop listening" : "Speak"}
                disabled={loading}
              >
                {listening ? '🔴' : '🎤'}
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>🚀 Send</span>
                )}
              </button>
            </form>

            {/* Voice Recognition Status */}
            {listening && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening... Speak now!</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-red-700">
                  <span>❌</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-100 border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>TravelBuddy AI - Making travel information accessible for everyone</p>
            <p className="mt-1">Powered by Google Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
