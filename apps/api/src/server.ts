import mongoose from 'mongoose';
import { connectDatabase, env } from './config/index.js';
import { app } from './app.js';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    const server=app.listen(env.PORT,()=>console.warn(`API listening on port ${env.PORT}`));
    let shuttingDown=false;
    const shutdown=async(signal:string)=>{if(shuttingDown)return;shuttingDown=true;console.warn(`${signal} received. Shutting down gracefully.`);server.close(async()=>{try{await mongoose.disconnect();process.exit(0)}catch(error){console.error('Graceful shutdown failed:',error);process.exit(1)}});setTimeout(()=>process.exit(1),10_000).unref();};
    process.on('SIGTERM',()=>void shutdown('SIGTERM'));
    process.on('SIGINT',()=>void shutdown('SIGINT'));
  } catch (error) { console.error('Failed to start server:', error); process.exit(1); }
};
void startServer();
