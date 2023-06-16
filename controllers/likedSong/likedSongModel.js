import mongoose from 'mongoose';
import likedSongSchema from "./likedSongSchema.js";

const likedSongModel = mongoose.model('LikedSongModel', likedSongSchema);

export default likedSongModel;

