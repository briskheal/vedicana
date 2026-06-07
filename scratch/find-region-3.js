import pg from 'pg';

const hosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-1-ap-south-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-1-ap-southeast-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-1-eu-west-2.pooler.supabase.com'
];

async function testHost(host) {
  const client = new pg.Client({
    host: host,
    port: 6543,
    database: 'postgres',
    user: 'postgres.oeuelrgzxtogwmotdomd',
    password: 'VedicanaOrganics@1306',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    await client.end();
    return { host, success: true, message: 'Connected successfully!' };
  } catch (err) {
    return { host, success: false, error: err.message };
  }
}

async function main() {
  console.log('Scanning hosts...');
  for (const host of hosts) {
    const res = await testHost(host);
    if (res.success) {
      console.log(`✅ [${host}] SUCCESS!`);
    } else {
      console.log(`❌ [${host}] Error: ${res.error}`);
    }
  }
}

main();
