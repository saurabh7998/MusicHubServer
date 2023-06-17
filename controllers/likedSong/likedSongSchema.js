import mongoose from 'mongoose';

const schema = mongoose.Schema(
    {
        trackId: String,
        albumId: String,
        artist: String,
        title: String,
        uri: String,
        albumUrl: String,
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }],
    },
    { collection: 'likedSongs' }
);

export default schema;
