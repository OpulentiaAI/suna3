'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import LiveView from '../components/LiveView';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  const [sessionId, setSessionId] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');

  // Generate session and thread IDs
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
    setThreadId(`thread-${Date.now()}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Suna AI Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            TypeScript-powered AI agent with advanced tools and capabilities
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Thread ID: {threadId} | Session: {sessionId}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Live Agent View */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Live Agent View
            </h2>
            <LiveView sessionId={sessionId} />
          </div>

          {/* Chat Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Chat with Suna
            </h2>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p className="text-lg mb-2">👋 Hello! I'm Suna, your AI assistant.</p>
                  <p className="text-sm">I can help you with:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Execute shell commands</li>
                    <li>• Read and write files</li>
                    <li>• Search the web</li>
                    <li>• Extract content from websites</li>
                  </ul>
                </div>
              )}

              {messages.map(m => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg ${
                    m.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                      : 'bg-gray-100 dark:bg-gray-700 mr-8'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1 text-gray-700 dark:text-gray-300">
                    {m.role === 'user' ? '👤 You' : '🤖 Suna'}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {m.content}
                  </div>
                  {m.toolInvocations && m.toolInvocations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      🔧 Used tools: {m.toolInvocations.map(t => t.toolName).join(', ')}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="bg-gray-100 dark:bg-gray-700 mr-8 p-3 rounded-lg">
                  <div className="font-semibold text-sm mb-1 text-gray-700 dark:text-gray-300">
                    🤖 Suna
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                placeholder="Ask me anything... (e.g., 'list files in current directory' or 'search for latest AI news')"
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Next.js, TypeScript, and AI SDK • Built with ❤️ for the future</p>
        </footer>
      </div>
    </div>
  );
}
