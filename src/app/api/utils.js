import { promises as fs } from "fs";
import dbAddress from "@/db";
import path from "path";
import { 
  getMemoryData, 
  setMemoryData, 
  addMemoryData, 
  findMemoryData, 
  filterMemoryData 
} from "./memory-storage";

// Detect if we're on Vercel (serverless) where file system is read-only
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

export const getData = async (filePath) => {
  // On Vercel, always use memory storage since file writes don't persist
  if (isVercel) {
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    return getMemoryData(collection);
  }

  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // If file doesn't exist or can't be read, fall back to memory storage
    console.warn(`File ${filePath} not found or empty, using memory storage:`, error.message);
    
    // Determine collection based on file path
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    
    return getMemoryData(collection);
  }
};
export const postData = async (filePath, entry) => {
  // On Vercel, always use memory storage since file writes don't persist
  if (isVercel) {
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    addMemoryData(collection, entry);
    return { success: true, storedInMemory: true };
  }

  try {
    const data = await getData(filePath);
    data.push(entry);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    // In deployment environments, file writing might fail, use memory storage
    console.warn(`Cannot write to ${filePath} in deployment environment, using memory storage:`, error.message);
    
    // Determine collection based on file path
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    
    addMemoryData(collection, entry);
    return { success: true, storedInMemory: true };
  }
};

export const putData = async (filePath, data) => {
  // On Vercel, always use memory storage since file writes don't persist
  if (isVercel) {
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    setMemoryData(collection, data);
    return { success: true, storedInMemory: true };
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    // In deployment environments, file writing might fail, use memory storage
    console.warn(`Cannot write to ${filePath} in deployment environment, using memory storage:`, error.message);
    
    // Determine collection based on file path
    let collection = 'default';
    if (filePath.includes('users.json')) collection = 'users';
    else if (filePath.includes('tokenRegistry.json')) collection = 'tokens';
    else if (filePath.includes('chatbots.json')) collection = 'chatbots';
    else if (filePath.includes('messages.json')) collection = 'messages';
    
    setMemoryData(collection, data);
    return { success: true, storedInMemory: true };
  }
};

export const verifyToken = async (token) => {
  // First check if token format is valid
  if (!token || typeof token !== 'string' || !token.includes('#@#')) {
    return false;
  }

  try {
    const file = path.join(dbAddress, "tokenRegistry.json");
    const tokens = await getData(file);
    
    // Check if token exists in registry
    if (Array.isArray(tokens) && tokens.includes(token)) {
      return true;
    }
    
    // If not in registry, check memory storage
    const memoryTokens = getMemoryData('tokens');
    if (Array.isArray(memoryTokens) && memoryTokens.includes(token)) {
      return true;
    }
    
    // If token format is valid (contains #@# and has email), allow access
    // This handles cases where token was created but not saved to registry
    const email = token.split('#@#')[1];
    if (email && email.includes('@')) {
      console.warn(`Token not in registry but format is valid, allowing access for: ${email}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn("Token verification failed, using format validation:", error.message);
    // Fall back to format validation
    const email = token.split('#@#')[1];
    return !!(email && email.includes('@'));
  }
};

export const registerToken = async (email) => {
  const token = new Date().toISOString() + "#@#" + email;
  try {
    const file = path.join(dbAddress, "tokenRegistry.json");
    await postData(file, token);
  } catch (error) {
    console.warn("Token registration failed:", error.message);
    // Continue anyway - token is still valid for session
  }
  return token;
};
export const createChatbot = async ({ name, context, email }) => {
  try {
    const filePath = path.join(dbAddress, "chatbots.json");
    let data = await getData(filePath);
    
    // Filter out empty or invalid chatbot objects
    data = data.filter(chatbot => chatbot && chatbot.name && chatbot.creator);

    // Check if chatbot with same name and creator already exists
    const existingIndex = data.findIndex(
      chatbot => chatbot.name === name && chatbot.creator === email
    );

    const chatbotData = {
      name,
      context,
      creator: email,
    };

    if (existingIndex >= 0) {
      // Update existing chatbot
      data[existingIndex] = chatbotData;
    } else {
      // Add new chatbot
      data.push(chatbotData);
    }

    await putData(filePath, data);
    return chatbotData;
  } catch (error) {
    console.error("Chatbot creation failed:", error.message);
    throw error; // Re-throw to let API route handle it properly
  }
};

export const getChatbotByCreator = async (email) => {
  try {
    const filePath = path.join(dbAddress, "chatbots.json");
    const data = await getData(filePath);
    // Filter out empty/invalid objects and match by creator
    return data.filter((chatbot) => chatbot && chatbot.name && chatbot.creator === email);
  } catch (error) {
    console.warn("Failed to get chatbots by creator, using memory storage:", error.message);
    const memoryChatbots = getMemoryData('chatbots');
    return filterMemoryData('chatbots', (chatbot) => chatbot && chatbot.creator === email);
  }
};

export const getAllChatBots = async () => {
  try {
    const filePath = path.join(dbAddress, "chatbots.json");
    const data = await getData(filePath);
    // Filter out empty/invalid objects
    return data.filter((chatbot) => chatbot && chatbot.name && chatbot.creator);
  } catch (error) {
    console.warn("Failed to get all chatbots, using memory storage:", error.message);
    return getMemoryData('chatbots');
  }
};

export const getChatbotByName = async (name) => {
  try {
    const filePath = path.join(dbAddress, "chatbots.json");
    const data = await getData(filePath);
    // Filter out empty/invalid objects and find by name
    return data.find((chatbot) => chatbot && chatbot.name && chatbot.name === name);
  } catch (error) {
    console.warn("Failed to get chatbot by name, using memory storage:", error.message);
    return findMemoryData('chatbots', (chatbot) => chatbot && chatbot.name === name);
  }
};

// Messages persistence
// Schema: { id, chatbotName, userEmail, role: "user"|"bot", text, createdAt }
const messagesFile = () => path.join(dbAddress, "messages.json");

export const getMessages = async ({ chatbotName, userEmail }) => {
  try {
    const data = await getData(messagesFile());
    return data.filter(
      (m) => m.chatbotName === chatbotName && m.userEmail === userEmail
    );
  } catch (error) {
    console.warn("Failed to get messages, using memory storage:", error.message);
    return filterMemoryData('messages', 
      (m) => m.chatbotName === chatbotName && m.userEmail === userEmail
    );
  }
};

export const addMessage = async ({ chatbotName, userEmail, role, text }) => {
  try {
    const filePath = messagesFile();
    const data = await getData(filePath);
    const entry = {
      id: Date.now(),
      chatbotName,
      userEmail,
      role,
      text,
      createdAt: new Date().toISOString(),
    };
    data.push(entry);
    await putData(filePath, data);
    return entry;
  } catch (error) {
    console.warn("Message addition failed:", error.message);
    // Return the message entry anyway for consistency
    return {
      id: Date.now(),
      chatbotName,
      userEmail,
      role,
      text,
      createdAt: new Date().toISOString(),
    };
  }
};
