import React, { useState, useEffect, useRef } from 'react';

// --- Base Styles Component ---
// Injects global styles, fonts, and the aurora background effect into the document.
// This is a workaround to keep everything in a single file without needing a separate CSS file.
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', sans-serif;
        /* Aurora Background Effect */
        background-color: #0A0A0A;
        position: relative;
        overflow: hidden;
      }

      body::before, body::after {
        content: '';
        position: absolute;
        z-index: -1;
        border-radius: 50%;
        filter: blur(150px);
        opacity: 0.2;
      }

      body::before {
        width: 500px;
        height: 500px;
        background-color: #7c3aed; /* Purple */
        top: -200px;
        left: -200px;
      }
      
      body::after {
        width: 450px;
        height: 450px;
        background-color: #2563eb; /* Blue */
        bottom: -250px;
        right: -200px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return null;
};

// --- SVG Icons ---
// Using inline SVGs to avoid external dependencies.
const icons = {
  step: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m12 14-4-4 4-4"/><path d="M18 10h-6"/></svg>
  ),
  thinking: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 animate-pulse"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  ),
  output: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  loader: (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
};

// --- MOCK AUTOMATION AGENT ---
// This simulates the backend process for demonstration purposes.
async function mockAutomationAgent(query, setMessages, setLatestScreenshot, setFinalOutput) {
    const addMessage = (text, type = 'step') => {
        setMessages(prev => [...prev, { text, type, icon: icons[type] }]);
    };
    
    addMessage("Agent received new task...", 'thinking');
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Navigating to https://ui.chaicode.com/signup...");
    await new Promise(res => setTimeout(res, 2000));
    
    addMessage("Analyzing page content to find selectors...");
    await new Promise(res => setTimeout(res, 1500));

    addMessage("Typing 'nitin' into first name input.");
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Typing 'yadav' into last name input.");
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Typing 'openai454@gmail.com' into email input.");
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Taking screenshot...");
    setLatestScreenshot('https://placehold.co/600x400/111827/a5b4fc?text=Form+Filled');
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Typing password...");
    await new Promise(res => setTimeout(res, 1000));
    
    addMessage("Clicking 'Sign Up' button.");
    await new Promise(res => setTimeout(res, 1500));
    
    addMessage("Taking final screenshot...");
    setLatestScreenshot('https://placehold.co/600x400/111827/4ade80?text=Signup+Successful!');
    await new Promise(res => setTimeout(res, 1000));

    const output = "Task complete. Successfully signed up and took a final screenshot.";
    addMessage(output, 'output');
    setFinalOutput(output);
}

// --- Main App Component ---
export default function App() {
  const [query, setQuery] = useState("Go to https://ui.chaicode.com/signup, sign up with Firstname='nitin', Lastname='yadav', email='openai454@gmail.com', and password='justfortesting45'.");
  const [messages, setMessages] = useState([]);
  const [isAutomating, setIsAutomating] = useState(false);
  const [latestScreenshot, setLatestScreenshot] = useState('');
  
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    setIsAutomating(true);
    setMessages([]);
    setLatestScreenshot('');
    await mockAutomationAgent(query, setMessages, setLatestScreenshot);
    setIsAutomating(false);
  };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 text-white">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          <header className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent pb-2">
              Web Automation Agent
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              Enter a command and watch the AI agent interact with the web in real-time.
            </p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Input and Screenshot */}
            <div className="flex flex-col gap-8">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold mb-4">Command Center</h2>
                <div className="flex flex-col gap-4">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Go to saucedemo.com and log in..."
                    disabled={isAutomating}
                    className="w-full h-36 p-3 bg-gray-900/50 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button 
                    onClick={handleStart} 
                    disabled={isAutomating || !query}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all duration-300 ease-in-out"
                  >
                    {isAutomating ? (
                      <>
                        {icons.loader}
                        <span>Automating...</span>
                      </>
                    ) : (
                      'Start Automation'
                    )}
                  </button>
                </div>
              </div>
               <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold mb-4">Latest Screenshot</h2>
                <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border border-white/10">
                  {latestScreenshot ? (
                    <img src={latestScreenshot} alt="Agent screenshot" className="rounded-md object-contain h-full w-full" />
                  ) : (
                    <p className="text-gray-500">Waiting for screenshot...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Feed */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-[calc(24rem+9rem)]">
              <h2 className="text-xl font-semibold mb-4">Agent Live Feed</h2>
              <div ref={logContainerRef} className="h-full overflow-y-auto pr-2 space-y-3">
                {messages.length === 0 && <p className="text-gray-500">Agent is standing by...</p>}
                {messages.map((msg, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/30 rounded-lg animate-fade-in">
                    <span className="mt-1">{msg.icon}</span>
                    <p className="flex-1">
                      <span className="text-gray-500 text-xs block">{new Date().toLocaleTimeString()}</span>
                      <span className={
                        msg.type === 'output' ? 'text-green-400 font-bold' : 
                        msg.type === 'thinking' ? 'text-yellow-400 italic' : 
                        'text-gray-300'
                      }>{msg.text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// Add a style tag for the fade-in animation
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`;
document.head.appendChild(animationStyle);
