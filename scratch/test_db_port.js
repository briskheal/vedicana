import net from 'net';

const checkPort = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      console.log(`[SUCCESS] Port ${port} is OPEN and reachable.`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`[TIMEOUT] Port ${port} connection timed out.`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`[ERROR] Port ${port} error:`, err.message);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
};

const run = async () => {
  const host = 'db.oeuelrgzxtogwmotdomd.supabase.co';
  console.log(`Checking ports for host ${host}...`);
  await checkPort(host, 5432);
  await checkPort(host, 6543);
};

run();
