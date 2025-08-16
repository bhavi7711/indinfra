import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import GetStartedView from "./components/GetStartedView";
import Auth from "./components/Auth";

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'getStarted'>('dashboard');

  const handleGetStarted = () => {
    setCurrentView('getStarted');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="w-screen h-screen flex flex-col text-black"> 
      {user ? (
        <div className="flex flex-1 w-full">
          {currentView === 'dashboard' ? (
            <div className="flex flex-col flex-1 w-full">
              {/* Navigation Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Dashboard
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {user.email}
                    </span>
                    <button
                      onClick={() => setUser(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Content */}
              <Dashboard 
                onGetStarted={handleGetStarted}
              />
            </div>
          ) : (
            <div className="flex flex-col flex-1 w-full">
              {/* Navigation Header */}
              <div className="bg-gray-100 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-white-900">
                      Get Started
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white-600">
                      Welcome, {user.email}
                    </span>
                    <button
                      onClick={() => setUser(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Get Started Content */}
              <GetStartedView onBackToDashboard={handleBackToDashboard} />
            </div>
          )}
        </div>
      ) : (
        <Auth setUser={setUser} />
      )}
    </div>
  );
};

export default App;
