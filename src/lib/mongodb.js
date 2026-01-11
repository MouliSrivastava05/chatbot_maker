// Lazy MongoDB connection - only imports and connects when actually needed
// This allows the build to succeed even without MONGODB_URI configured

let clientPromise;
let isInitializing = false;

const getClientPromise = async () => {
  // Return cached promise if already initialized
  if (clientPromise) {
    return clientPromise;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // Wait for the ongoing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (clientPromise) {
      return clientPromise;
    }
  }

  isInitializing = true;

  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri || typeof uri !== 'string' || uri.length === 0) {
      const error = new Error('MONGODB_URI is not defined. Please add it to your environment variables.');
      clientPromise = Promise.reject(error);
      isInitializing = false;
      throw error;
    }

    // Dynamic import to avoid build-time evaluation
    const { MongoClient } = await import('mongodb');
    
    // Optimize connection options for serverless environments (Vercel)
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timeout
      connectTimeoutMS: 10000, // How long to wait for initial connection
      // For serverless, we want to close connections quickly
      ...(process.env.NODE_ENV === 'production' && {
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      }),
    };
    
    let client;

    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      // In production mode (serverless), create a new connection each time
      // Vercel serverless functions are stateless, so we can't rely on global state
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    
    isInitializing = false;
    return clientPromise;
  } catch (error) {
    clientPromise = Promise.reject(error);
    isInitializing = false;
    throw error;
  }
};

// Export the function directly instead of calling it
// This prevents any code execution at module load time
export default getClientPromise;
