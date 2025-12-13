# Vercel Deployment Limitation

## Important Note About Data Persistence

**Current Limitation:** On Vercel (serverless platform), data stored in memory or JSON files **does not persist** between deployments or across different serverless function instances.

### Why This Happens

- Each API request can run on a **different serverless function instance**
- In-memory data is **isolated per instance**
- File system on Vercel is **read-only** for most deployments
- When you create a chatbot, it might be stored on instance A
- When you retrieve chatbots, the request might hit instance B (which has empty memory)

### Current Behavior

- **Localhost**: Works perfectly (file system is writable)
- **Vercel**: Chatbots will work within a single session, but may not persist across requests

### Solutions (For Production)

For a production deployment on Vercel, you should use a proper database:

1. **Vercel KV** (Redis) - Recommended for Vercel
2. **MongoDB Atlas** - Free tier available
3. **PostgreSQL** (via Vercel Postgres or Supabase)
4. **PlanetScale** - MySQL-compatible serverless database

### Quick Fix for Now

The current implementation uses in-memory storage on Vercel, which means:
- ✅ Works for testing/demos
- ❌ Data resets on each deployment
- ❌ May not persist across different serverless instances

### Testing on Vercel

If you want to test if it's working:
1. Create a chatbot
2. Immediately check the dashboard (same session might work)
3. Refresh the page or wait a few minutes
4. Data may be lost if it hits a different instance

---

**Recommendation**: For production use, migrate to a database solution like Vercel KV or MongoDB Atlas.

