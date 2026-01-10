// Lazy MongoDB connection - only imports and connects when actually needed
// This allows the build to succeed even without MONGODB_URI configured

let clientPromise;
let isInitialized = false;

const getClientPromise = async () => {
  // Return cached promise if already initialized
  if (isInitialized && clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri || typeof uri !== 'string' || uri.length === 0) {
    const error = new Error('MONGODB_URI is not defined. Please add it to your environment variables.');
    clientPromise = Promise.reject(error);
    isInitialized = true;
    throw error;
  }

  try {
    // Dynamic import to avoid build-time evaluation
    const { MongoClient } = await import('mongodb');
    
    const options = {};
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
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    
    isInitialized = true;
    return clientPromise;
  } catch (error) {
    clientPromise = Promise.reject(error);
    isInitialized = true;
    throw error;
  }
};

// Export the function directly instead of calling it
// This prevents any code execution at module load time
export default getClientPromise;




