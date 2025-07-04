import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState("general");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const promptTypes = [
    { value: "general", label: "General Information", icon: "🌍" },
    { value: "public_transport", label: "Public Transport", icon: "🚇" },
    { value: "museum_exhibit", label: "Museum & Art", icon: "🏛️" },
    { value: "restaurant_menu", label: "Restaurant Menus", icon: "🍽️" },
    { value: "cultural_customs", label: "Cultural Customs", icon: "🤝" },
    { value: "emergency_safety", label: "Emergency & Safety", icon: "🆘" },
    { value: "currency_exchange", label: "Currency & Money", icon: "💰" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");
    setStats(null);

    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userInput: input,
          promptType: promptType 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to simplify text");
      }

      setResponse(data.result);
      setStats({
        originalLength: data.originalLength,
        simplifiedLength: data.simplifiedLength,
        reduction: data.reduction
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setInput("");
    setResponse("");
    setError("");
    setStats(null);
  }

  return (
    <>
      <Head>
        <title>TravelBuddy AI - Simplify Tourist Information</title>
        <meta name="description" content="AI-powered tool to simplify complex tourist information into easy-to-understand guides" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🧳</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">TravelBuddy AI</h1>
                  <p className="text-sm text-gray-600">Simplify complex tourist information</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Powered by Gemini AI
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Enter Complex Tourist Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Prompt Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={promptType}
                      onChange={(e) => setPromptType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {promptTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complex Text to Simplify
                    </label>
                    <textarea
                      rows={12}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste complex tourist information here... For example:&#10;&#10;To transfer from the Marunouchi Line to the Yamanote Line at Shinjuku Station, proceed to the JR East transfer gates located on the B1 level. Valid IC cards (PASMO/Suica) can be used for seamless transfers between Tokyo Metro and JR lines..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      disabled={loading}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Simplifying...
                        </span>
                      ) : (
                        "🚀 Simplify Text"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  ✨ Simplified Result
                </h2>

                {!response && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🧳</div>
                    <p className="text-lg font-medium mb-2">Ready to simplify!</p>
                    <p className="text-sm">Enter complex tourist information on the left and get a simplified version here.</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Simplifying your text...</p>
                  </div>
                )}

                {response && (
                  <div className="space-y-4">
                    {/* Stats */}
                    {stats && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{stats.originalLength}</div>
                            <div className="text-xs text-blue-600">Original</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{stats.simplifiedLength}</div>
                            <div className="text-xs text-green-600">Simplified</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${parseFloat(stats.reduction) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stats.reduction}%
                            </div>
                            <div className="text-xs text-gray-600">Reduction</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Simplified Text */}
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-800">{response}</pre>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(response);
                        // You could add a toast notification here
                      }}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 Tips for Best Results
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Choose the right content type for better simplification
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Include specific details like costs, times, and locations
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    The AI will add cultural context and practical tips
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Safety information is automatically highlighted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              <p>TravelBuddy AI - Making travel information accessible for everyone</p>
              <p className="mt-1">Powered by Google Gemini AI</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 