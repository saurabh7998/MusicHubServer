import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        likedTracks: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LikedSongModel'
            }],
        }
    },
    {
        timestamps: true,
    }
)

export default userSchema;