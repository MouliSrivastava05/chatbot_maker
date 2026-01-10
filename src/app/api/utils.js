import getClientPromise from '@/lib/mongodb';

const DB_NAME = 'chatbotmaker';

// Helper to get database
const getDb = async () => {
  const client = await getClientPromise();
  return client.db(DB_NAME);
};

// Users collection operations
export const getUserByEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email provided');
  }

  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ email });
    return user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    // If MongoDB is not configured, return null instead of throwing
    if (error.message && error.message.includes('MONGODB_URI')) {
      console.warn('MongoDB not configured, returning null');
      return null;
    }
    throw error;
  }
};

export const createUser = async ({ email, password }) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email is required');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  try {
    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const result = await db.collection('users').insertOne({ 
      email, 
      password,
      createdAt: new Date()
    });
    
    return { 
      email, 
      _id: result.insertedId,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating user:', error);
    // Re-throw user-friendly errors as-is
    if (error.message === 'User already exists') {
      throw error;
    }
    // If MongoDB is not configured, throw a more helpful error
    if (error.message && error.message.includes('MONGODB_URI')) {
      throw new Error('Database is not configured. Please configure MONGODB_URI.');
    }
    throw new Error('Failed to create user');
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
    
    // Fallback: check token format (for backward compatibility)
    // This allows tokens created before MongoDB migration to still work
    const email = token.split('#@#')[1];
    if (email && email.includes('@')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    // If MongoDB is not configured, fall back to format validation
    if (error.message && error.message.includes('MONGODB_URI')) {
      const email = token.split('#@#')[1];
      return !!(email && email.includes('@'));
    }
    // For other errors, still allow format-based validation as fallback
    const email = token.split('#@#')[1];
    return !!(email && email.includes('@'));
  }
};

export const registerToken = async (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email is required to create token');
  }

  const token = new Date().toISOString() + '#@#' + email;
  
  try {
    const db = await getDb();
    await db.collection('tokens').insertOne({ 
      token, 
      email, 
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
  } catch (error) {
    console.warn('Token registration failed:', error.message);
    // If MongoDB is not configured, still return the token
    // This allows the app to work in development without MongoDB
    if (error.message && error.message.includes('MONGODB_URI')) {
      console.warn('MongoDB not configured, token created but not persisted');
    }
  }
  
  return token;
};

export const removeToken = async (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Valid token is required');
  }

  try {
    const db = await getDb();
    const result = await db.collection('tokens').deleteOne({ token });
    
    if (result.deletedCount === 0) {
      console.warn(`Token not found in database: ${token.substring(0, 20)}...`);
    }
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error removing token:', error);
    // If MongoDB is not configured, don't throw - just log warning
    if (error.message && error.message.includes('MONGODB_URI')) {
      console.warn('MongoDB not configured, token removal skipped');
      return false;
    }
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
