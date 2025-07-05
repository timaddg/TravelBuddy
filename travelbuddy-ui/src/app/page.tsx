'use client';

import { useState, useRef, useEffect } from "react";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userInput: input,
          promptType: "general" // Simplified to single prompt type
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
              <div className="text-3xl animate-bounce">🧳</div>
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
                  <div className="text-6xl mb-4 animate-pulse">🧳</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to TravelBuddy!</h2>
                  <p className="text-gray-600">Ask me anything about travel - I'll help simplify complex information for you.</p>
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
                        <div className="whitespace-pre-wrap">{message.content}</div>
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
