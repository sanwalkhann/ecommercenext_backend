// pages/api/cloud.js

import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: "dpr7tcchw",
  api_key: "561735198215347",
  api_secret: "gNqtD-K2DB8LImW26EO_hGgnr38",
});

export default async function handler(req, res) {
  try {
    const { buffer } = req.file;
    const uploaded = await cloudinary.v2.uploader.upload(buffer, { resource_type: "auto" });

    res.status(200).json(uploaded);
  } catch (error) {
    console.error("Error inside uploadation:", error);
    res.status(500).json({ error: "Failed to upload file to Cloudinary" });
  }
}
