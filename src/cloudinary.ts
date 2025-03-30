import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: "diezw3wln",
  api_key: "678615555414937",
  api_secret: "Eh7ADltH_ZAgXNcyWP8akoIxusk",
  secure: true,
});

export default cloudinary;
