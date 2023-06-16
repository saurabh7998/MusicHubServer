import likedSongModel from "./likedSongModel.js";

export const findLikedTrack = async (trackId) => {
    const res = await likedSongModel.findOne(trackId);
    return res;
}
export const createLikedTrack = async (track) =>
    await likedSongModel.create(track);

export const saveLikedTrack = async (track) => {
    try {
        const updatedTrack =
            await likedSongModel.findByIdAndUpdate(track._id, track, {new: true});
        return updatedTrack;
    } catch (error) {
        console.error('Error saving liked song:', error);
        throw error;
    }
}

export const getLikedTracks = async () => await likedSongModel.find()
