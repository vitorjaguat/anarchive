import { ThirdwebStorage } from '@thirdweb-dev/storage';
import fs from 'fs';
import { IncomingForm } from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = new ThirdwebStorage({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_CLIENT_SECRET,
  // clientId: 'd3cb6e160e5c6817e0ba2c74376ddd7b',
  // secretKey:
  //   'CKVMMqO6iJ6XoEpXTvDjdZMwYBaCmoFOGL2rCBV8K_l9p1XlPOgSWjC5m1_qDq7GhDjNS58eWheo-UQENZp0ig',
});

export default async function handler(req, res) {
  console.log('running');
  // console.log(process.env.THIRDWEB_CLIENT_SECRET);
  console.log(req.body);

  if (req.method === 'POST') {
    try {
      const form = new IncomingForm();
      let uri;
      const [fields, files] = await form.parse(req);
      console.log('fields:', fields);
      console.log('files:', files);
      console.log('filepath:', files.image[0].filepath);

      // const imgPath = path.join(process.cwd(), files.image[0].filepath);
      // console.log('imgPath:', imgPath);
      const img = fs.readFileSync(files.image[0].filepath);
      uri = await storage.upload(img);

      // form.parse(req, async (err, fields, files) => {
      //   console.log('fields:', fields);
      //   console.log('files:', files);
      //   console.log('filepath:', files.image[0].filepath);

      //   // const imgPath = path.join(process.cwd(), files.image[0].filepath);
      //   // console.log('imgPath:', imgPath);
      //   const img = fs.readFileSync(files.image[0].filepath);
      //   uri = await storage.upload(img);
      // });

      // const name = req.body.name;
      // console.log('body:', req.body);
      // console.log('name:', name);

      // const img = fs.readFileSync('./loading284x284.png');
      // const uri = await storage.upload(req.body.image);
      // const result = await storage.download(uri);
      // console.log('upload URL:', uri);
      // console.log('download URL:', result.body);

      // res.status(200).json({ message: 'Image uploaded successfully', uri });
      console.log('upload URL:', uri);

      res.status(200).json({ message: 'Image uploaded successfully', uri });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error uploading image' });
    }
  }
}

// pages/api/upload.js
