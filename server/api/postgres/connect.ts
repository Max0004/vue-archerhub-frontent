import pg from 'pg';
const { Client } = pg;
let client: Client;

const connectToDatabase = async () => {
  if (!client) {
    client = new Client({
      user: useRuntimeConfig()?.postgres.user,
      host: useRuntimeConfig()?.postgres.host,
      database: useRuntimeConfig()?.postgres.database,
      password: useRuntimeConfig()?.postgres.password,
      port: useRuntimeConfig()?.postgres.port,
    });
    await client.connect();
  }
  return client;
};

export default connectToDatabase;