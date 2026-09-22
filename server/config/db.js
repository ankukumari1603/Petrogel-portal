import mongoose from 'mongoose'

function describeMongoUri(uri) {
  try {
    const parsed = new URL(uri)
    return { host: parsed.hostname || 'unknown', hasUsername: Boolean(parsed.username), hasPassword: Boolean(parsed.password) }
  } catch {
    return { host: 'unparseable', hasUsername: false, hasPassword: false }
  }
}

export async function connectDatabase() {
  const uri = process.env.MONGO_URI?.trim()
  if (!uri) throw new Error('MONGO_URI is not configured. Add your MongoDB Atlas connection string to the project root .env file.')
  if (!uri.startsWith('mongodb+srv://')) throw new Error('MONGO_URI must be a MongoDB Atlas connection string beginning with mongodb+srv://')
  const diagnostics = describeMongoUri(uri)
  console.log(`MongoDB configuration: MONGO_URI present; Atlas host ${diagnostics.host}; username ${diagnostics.hasUsername ? 'present' : 'missing'}; password ${diagnostics.hasPassword ? 'present' : 'missing'}`)
  if (!diagnostics.hasUsername || !diagnostics.hasPassword) throw new Error('MONGO_URI is missing Atlas database-user credentials. Check the connection string in the project-root .env file.')
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 45000 })
  } catch (error) {
    if (/bad auth|authentication failed/i.test(error.message)) throw new Error('MongoDB Atlas authentication failed. Verify the Atlas database user name and password, confirm the user has access to this database, and URL-encode special characters in the password.')
    throw new Error(`MongoDB Atlas connection failed for host ${diagnostics.host}: ${error.message}`)
  }
  console.log(`MongoDB Atlas connected to database "${mongoose.connection.name}"`)
}

mongoose.connection.on('disconnected', () => console.warn('MongoDB Atlas disconnected; requests will report database unavailable until reconnection.'))
mongoose.connection.on('error', (error) => console.error(`MongoDB Atlas error: ${error.message}`))
