/**
 * Popup Header Component
 * Displays branding, status indicator, and page title.
 */

import React, { useEffect, useState } from 'react';
import { GraduationCap, Wifi, WifiOff } from 'lucide-react';
import { sendToBackground } from '../../../shared/utils/messaging';

const Header: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Ping background to check if extension is working
    const checkConnection = async () => {
      try {
        const response = await sendToBackground('PING');
        setIsConnected(response.success);
      } catch {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
      {/* Logo + Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none">AI Student Assistant</h1>
          <p className="text-[10px] text-blue-200 leading-none mt-0.5">
            Powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full">
        {isChecking ? (
          <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
        ) : isConnected ? (
          <Wifi size={11} className="text-green-300" />
        ) : (
          <WifiOff size={11} className="text-red-300" />
        )}
        <span className="text-[10px] text-blue-100">
          {isChecking ? 'Checking...' : isConnected ? 'Ready' : 'Error'}
        </span>
      </div>
    </header>
  );
};

export default Header;