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
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    await client.end();
    return { region, success: true, message: 'Connected successfully!' };
  } catch (err) {
    const errMsg = err.message || '';
    if (errMsg.includes('tenant/user') && errMsg.includes('not found')) {
      return { region, success: false, tenantNotFound: true };
    }
    return { region, success: false, error: errMsg };
  }
}

async function main() {
  console.log('Scanning Supabase regions for project oeuelrgzxtogwmotdomd...');
  for (const region of regions) {
    console.log(`Checking ${region}...`);
    const result = await testRegion(region);
    if (result.success) {
      console.log(`\n🎉 FOUND IT! Region: ${region}`);
      console.log(`Connection URL: postgresql://postgres.oeuelrgzxtogwmotdomd:[PASSWORD]@aws-0-${region}.pooler.supabase.com:6543/postgres\n`);
      process.exit(0);
    } else if (!result.tenantNotFound) {
      console.log(`Found region candidate ${region} but got another error:`, result.error);
      console.log(`This is likely the correct region!`);
      console.log(`Connection URL: postgresql://postgres.oeuelrgzxtogwmotdomd:[PASSWORD]@aws-0-${region}.pooler.supabase.com:6543/postgres\n`);
      process.exit(0);
    }
  }
  console.log('Scan complete. No matching region found.');
}

main();
