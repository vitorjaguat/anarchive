import { ThirdwebStorage } from '@thirdweb-dev/storage';
import fs from 'fs';

const storage = new ThirdwebStorage({
  // clientId: process.env.THIRDWEB_CLIENT_ID,
  // secretKey: process.env.THIRDWEB_CLIENT_SECRET,
  clientId: 'd3cb6e160e5c6817e0ba2c74376ddd7b',
  secretKey:
    'CKVMMqO6iJ6XoEpXTvDjdZMwYBaCmoFOGL2rCBV8K_l9p1XlPOgSWjC5m1_qDq7GhDjNS58eWheo-UQENZp0ig',
});

// export default (async () => {
//   console.log('running');
//   console.log(process.env.THIRDWEB_CLIENT_SECRET);

//   const uri = await storage.upload({ maravilha: 'alaska' });

//   const result = await storage.download(uri);

//   console.log('upload URL:', uri);

//   console.log('download URL:', result.body);
//   // console.log('Upload URL:', storage.resolveScheme(upload));
// })();

export default (async () => {
  console.log('running');
  console.log(process.env.THIRDWEB_CLIENT_SECRET);

  const img = fs.readFileSync('./loading284x284.png');
  const uri = await storage.upload(img);

  const result = await storage.download(uri);

  console.log('upload URL:', uri);

  console.log('download URL:', result.body);
  // console.log('Upload URL:', storage.resolveScheme(upload));
})();
