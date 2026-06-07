import pg from 'pg';

const regions = [
  'ap-south-1',     // Mumbai
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'eu-central-1',   // Frankfurt
  'ca-central-1',   // Central Canada
  'sa-east-1'       // São Paulo
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new pg.Client({
    host: host,
    port: 6543,
    database: 'postgres',
    user: 'postgres.oeuelrgzxtogwmotdomd',
    password: 'VedicanaOrganics@1306',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000
  });

  try {
    await client.connect();
    await client.end();
    return { region, success: true, message: 'Connected successfully!' };
  } catch (err) {
    return { region, success: false, error: err.message };
  }
}

async function main() {
  console.log('Scanning all Supabase regions...');
  for (const region of regions) {
    const res = await testRegion(region);
    if (res.success) {
      console.log(`✅ [${region}] SUCCESS!`);
    } else {
      console.log(`❌ [${region}] Error: ${res.error}`);
    }
  }
}

main();
