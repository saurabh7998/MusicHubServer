import userModel from "./userModel.js";

export const createUser = async (user) =>
    await userModel.create(user)

export const findUserByEmail = async ({email}) => {
    const res = await userModel.findOne({email})
    return res;
}

export const findUserById = async (id) => (await userModel.findOne({_id: id}));

export const findLikedTracksByUser = async (userId) => {
    try {
        const user = await userModel.findById(userId).populate('likedTracks');
        return user.likedTracks;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const addLikedSongToUser = async (userId, likedSong) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.likedTracks.length > 0) {
            if (user.likedTracks.some((trackId) => trackId.toString() === likedSong._id.toString())) {
                return {"error": "This song is already liked"};
            }
        }
        user.likedTracks.push(likedSong);
        await user.save();
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};
