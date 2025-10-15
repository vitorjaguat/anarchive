import { ThirdwebStorage } from '@thirdweb-dev/storage';
import fs from 'fs';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = new ThirdwebStorage({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_CLIENT_SECRET,
});

export default async function handler(req, res) {
  console.log('running');
  // console.log(process.env.THIRDWEB_CLIENT_SECRET);
  // console.log(req.body);

  if (req.method === 'POST') {
    try {
      const form = new IncomingForm();
      const [fields, files] = await form.parse(req);
      // console.log('fields:', fields);
      // console.log('files:', files);
      // console.log('filepath:', files.image[0].filepath);

      // const imgPath = path.join(process.cwd(), files.image[0].filepath);
      // console.log('imgPath:', imgPath);
      // TODO: check if there is image and media or only media:
      const media = fs.readFileSync(files.media[0].filepath);
      const uriMedia = await storage.upload(media);
      const isTypeImage = files.media[0].mimetype.includes('image');
      let img;
      let uriImg;
      if (!isTypeImage) {
        img = fs.readFileSync(files.image[0].filepath);
        uriImg = await storage.upload(img);
      }

      const metadataObj = {
        name: fields.title[0],
        description: fields.description[0],
        image: isTypeImage ? uriMedia : uriImg,
        content: {
          mime: files.media[0].mimetype,
          uri: uriMedia,
        },
        animation_url: !isTypeImage ? uriMedia : undefined,
        attributes: [
          {
            trait_type: 'To',
            value: fields.attTo[0],
          },
          {
            trait_type: 'From',
            value: fields.attFrom[0],
          },
          {
            trait_type: 'Year',
            value: fields.attYear[0],
          },
          {
            trait_type: 'Event',
            value: fields.attEvent[0],
          },
          {
            trait_type: 'Media',
            value: fields.attMedia[0],
          },
          {
            trait_type: 'Creator',
            value: fields.attCreator[0],
          },
          {
            trait_type: 'Tags',
            value: fields.attTags[0],
          },
          {
            trait_type: 'Location',
            value: fields.attLocation[0],
          },
        ],
      };
      if (isTypeImage) {
        delete metadataObj.animation_url;
      }
      // if (!metadataObj.content.mime.includes('image')) {
      //   metadataObj.animation_url = uriMedia;
      // }
      const metadata = JSON.stringify(metadataObj);
      const uriMetadata = await storage.upload(metadata);
      // console.log('metadata:', metadata);
      // console.log('uriMetadata:', uriMetadata);

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

      // console.log('image URI:', uriImg);
      // console.log('media URI:', uriMedia);

      res
        .status(200)
        .json({ message: 'Image uploaded successfully', uriMetadata });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error uploading image' });
    }
  }
}

// pages/api/upload.js
