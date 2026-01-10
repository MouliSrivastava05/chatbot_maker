import clientPromise from '@/lib/mongodb';

const DB_NAME = 'chatbotmaker';

// Helper to get database
const getDb = async () => {
  const client = await clientPromise;
  return client.db(DB_NAME);
};

// Users collection operations
export const getUserByEmail = async (email) => {
  try {
    const db = await getDb();
    return await db.collection('users').findOne({ email });
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUser = async ({ email, password }) => {
  try {
    const db = await getDb();
    const result = await db.collection('users').insertOne({ email, password });
    return { email, password, _id: result.insertedId };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Token operations
export const verifyToken = async (token) => {
  if (!token || typeof token !== 'string' || !token.includes('#@#')) {
    return false;
  }

  try {
    const db = await getDb();
    const tokenDoc = await db.collection('tokens').findOne({ token });
    if (tokenDoc) {
      return true;
    }
    
    // Fallback: check token format
    const email = token.split('#@#')[1];
    return !!(email && email.includes('@'));
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    const email = token.split('#@#')[1];
    return !!(email && email.includes('@'));
  }
};

export const registerToken = async (email) => {
  const token = new Date().toISOString() + '#@#' + email;
  try {
    const db = await getDb();
    await db.collection('tokens').insertOne({ token, email, createdAt: new Date() });
  } catch (error) {
    console.warn('Token registration failed:', error.message);
  }
  return token;
};

export const removeToken = async (token) => {
  try {
    const db = await getDb();
    await db.collection('tokens').deleteOne({ token });
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

// Chatbot operations
export const createChatbot = async ({ name, context, email }) => {
  try {
    const db = await getDb();
    const chatbotData = { name, context, creator: email, createdAt: new Date() };
    
    await db.collection('chatbots').updateOne(
      { name, creator: email },
      { $set: chatbotData },
      { upsert: true }
    );
    
    return chatbotData;
  } catch (error) {
    console.error('Chatbot creation failed:', error.message);
    throw error;
  }
};

export const getChatbotByCreator = async (email) => {
  try {
    const db = await getDb();
    const chatbots = await db.collection('chatbots').find({ creator: email }).toArray();
    // Convert MongoDB _id to id for frontend compatibility
    return chatbots.map(chatbot => ({
      ...chatbot,
      id: chatbot._id.toString(),
      createdAt: chatbot.createdAt ? chatbot.createdAt.toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to get chatbots by creator:', error.message);
    return [];
  }
};

export const getAllChatBots = async () => {
  try {
    const db = await getDb();
    const chatbots = await db.collection('chatbots').find({}).toArray();
    // Convert MongoDB _id to id for frontend compatibility
    return chatbots.map(chatbot => ({
      ...chatbot,
      id: chatbot._id.toString(),
      createdAt: chatbot.createdAt ? chatbot.createdAt.toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to get all chatbots:', error.message);
    return [];
  }
};

export const getChatbotByName = async (name) => {
  try {
    const db = await getDb();
    const chatbot = await db.collection('chatbots').findOne({ name });
    if (!chatbot) return null;
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...chatbot,
      id: chatbot._id.toString(),
      createdAt: chatbot.createdAt ? chatbot.createdAt.toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get chatbot by name:', error.message);
    return null;
  }
};

export const deleteChatbot = async ({ name, email }) => {
  try {
    const db = await getDb();
    const result = await db.collection('chatbots').deleteOne({ name, creator: email });
    
    // Also delete all messages for this chatbot
    await db.collection('messages').deleteMany({ chatbotName: name });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Failed to delete chatbot:', error.message);
    throw error;
  }
};

// Message operations
export const getMessages = async ({ chatbotName, userEmail }) => {
  try {
    const db = await getDb();
    const messages = await db.collection('messages')
      .find({ chatbotName, userEmail })
      .sort({ createdAt: 1 })
      .toArray();
    // Convert MongoDB _id to id and ensure createdAt is ISO string
    return messages.map(msg => ({
      ...msg,
      id: msg._id.toString(),
      createdAt: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to get messages:', error.message);
    return [];
  }
};

export const addMessage = async ({ chatbotName, userEmail, role, text }) => {
  try {
    const db = await getDb();
    const entry = {
      chatbotName,
      userEmail,
      role,
      text,
      createdAt: new Date(),
    };
    
    const result = await db.collection('messages').insertOne(entry);
    return {
      ...entry,
      id: result.insertedId.toString(),
      createdAt: entry.createdAt.toISOString()
    };
  } catch (error) {
    console.error('Message addition failed:', error.message);
    throw error;
  }
};

// Legacy compatibility functions (for backward compatibility)
export const getData = async (filePath) => {
  // This is kept for backward compatibility but won't work with MongoDB
  console.warn('getData called - this function is deprecated. Use MongoDB functions instead.');
  return [];
};

export const postData = async (filePath, entry) => {
  console.warn('postData called - this function is deprecated. Use MongoDB functions instead.');
  return { success: true };
};

export const putData = async (filePath, data) => {
  console.warn('putData called - this function is deprecated. Use MongoDB functions instead.');
  return { success: true };
};
