import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-south-1',     // Mumbai
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-east-1',      // Hong Kong
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'eu-central-1',   // Frankfurt
  'eu-central-2',   // Zurich
  'sa-east-1',      // São Paulo
  'ca-central-1'    // Canada Central
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Testing ${region}...`);
  
  const client = new Client({
    host: host,
    port: 6543,
    user: "postgres.oeuelrgzxtogwmotdomd",
    password: "VedicanaOrganics@1306",
    database: "postgres",
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`\n[SUCCESS] Connected to region ${region} (${host})!`);
    const res = await client.query("SELECT NOW()");
    console.log("Time from DB:", res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    if (!err.message.includes('not found') && !err.message.includes('ENOTFOUND')) {
      console.log(`[PARTIAL] ${region} returned error: ${err.message}`);
    }
    return false;
  }
}

async function run() {
  console.log("Scanning all 17 Supabase regions...");
  for (const region of regions) {
    try {
      const success = await testRegion(region);
      if (success) {
        console.log(`\nFound matching region! Use aws-0-${region}.pooler.supabase.com`);
        break;
      }
    } catch (e) {
      // Ignored
    }
  }
  console.log("Scan completed.");
}

run();
