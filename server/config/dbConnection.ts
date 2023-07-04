import mongoose from 'mongoose';

export const connectDb = async () => {
  const dbConnectionString = process.env.DB_CONNECTION_STRING;

  if (!dbConnectionString) {
    console.error('DB_CONNECTION_STRING not defined');
    process.exit(1);
  }

  try {
    const connect = await mongoose.connect(dbConnectionString)
    console.log(`Database connected ${connect.connection.host}, ${connect.connection.name} `);
    
  } catch (error) {
    console.log(error);
    process.exit(1)
  }
}