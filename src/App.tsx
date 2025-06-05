import type { FC } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ChatList } from './widgets/ChatList/ui/ChatList';
import { ChatPage } from './pages/Chat/ui/ChatPage';
import { layoutStyles } from './shared/styles/layout';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AppLayout: FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isChat = location.pathname.startsWith('/chat/');

  // Handle mobile detection and responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // On mobile, show either chat list or chat, but not both
    return (
      <div className={layoutStyles.mainContainer}>
        {!isChat ? (
          // Show full-screen chat list on root route
          <div className={layoutStyles.mobilePage}>
            <ChatList />
          </div>
        ) : (
          // Show full-screen chat when chat is selected
          <div className={layoutStyles.mobilePage}>
            <Routes>
              <Route path="chat/:chatId" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout with sidebar and chat area
  return (
    <div className={layoutStyles.mainContainer}>
      {/* Sidebar - always visible on desktop */}
      <div className={layoutStyles.sidebarContainer}>
        <ChatList />
      </div>

      {/* Main content area */}
      <div className={layoutStyles.chatContainer}>
        <Routes>
          <Route index element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
