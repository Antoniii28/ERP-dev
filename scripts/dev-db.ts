import { MongoMemoryServer } from 'mongodb-memory-server';

const start = async () => {
  const mongo = await MongoMemoryServer.create({
    instance: {
      dbName: 'erp-test',
    },
  });

  console.log(`Mongo Memory Server ready: ${mongo.getUri()}`);

  process.on('SIGINT', async () => {
    await mongo.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongo.stop();
    process.exit(0);
  });
};

start().catch((error: unknown) => {
  console.error('Unable to start Mongo Memory Server:', error);
  process.exit(1);
});
