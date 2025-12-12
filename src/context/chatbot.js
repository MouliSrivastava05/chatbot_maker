"use client"
import { createContext } from "react";
export const ChatbotContext = createContext(null);
const ChatbotProvider = ({ children }) => {
    const [chatbot, setChatbot] = useState([]);
  return (
    <ChatbotContext.Provider value={{chatbot,setChatbot}}>
      {children}
    </ChatbotContext.Provider>
  );
};
export default ChatbotProvider;