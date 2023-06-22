import * as likedSongDao from './likedSongDao.js'

const likedSongController = (app) => {
    app.post('/api/like', likeTrack);
    app.post('/api/dislike', dislikeTrack);
    app.get('/api/liked', getLikedTracks);
}

const dislikeTrack = async (req, res) => {
    const {trackId} = req.body;
    const {user} = req.body;
    try {
        const track = await likedSongDao.findLikedTrack({trackId});
        if (!track) {
            return res.status(404).json({error: 'Track not found'});
        }

        const index = track.likedBy.indexOf(user._id);
        if (index !== -1) {
            track.likedBy.splice(index, 1);
        }
        await track.save();
        return res.status(200).json({
                                        message: 'Track disliked successfully',
                                        track: track,
                                    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

const getLikedTracks = async (req, res) => {
    const result = await likedSongDao.getLikedTracks();
    return res.json(result);
}

const likeTrack = async (req, res) => {
    const track = req.body;
    const uri = track.uri;
    const albumId = track.album.id;
    const id = uri.substring(14);
    const user = track.user;
    const smallestAlbumImage = track.album.images.reduce(
        (smallest, image) => {
            if (image.height < smallest.height) {
                return image;
            }
            return smallest;
        },
        track.album.images[0]
    );

    const artist = track.artist;
    const title = track.title;
    const albumUrl = smallestAlbumImage.url;

    const likedTrack = {
        trackId: id,
        albumId: albumId,
        artist: artist,
        title: title,
        uri: uri,
        albumUrl: albumUrl,
    };

    try {
        // Check if the song already exists in the database
        const existingTrack = await likedSongDao.findLikedTrack({trackId: id});
        let modLikedTrack = existingTrack;

        if (existingTrack) {
            // Song already exists, check if the user has already liked it
            if (!existingTrack.likedBy.find(u => u.toString() === user._id)) {
                // Append the user to the likes array if they haven't liked it
                // before
                console.log(existingTrack.likedBy[0].toString());
                console.log(user);
                existingTrack.likedBy.push(user);
                await likedSongDao.saveLikedTrack(existingTrack);
            }
        } else {
            // If song doesn't exist, create a new document with the user in
            // the likes array
            modLikedTrack = {
                ...likedTrack,
                likedBy: [user],
            }
            await likedSongDao.createLikedTrack(modLikedTrack);
        }

        res.status(200).json(
            {
                message: 'Song liked successfully.',
                track: modLikedTrack,
            });
    } catch (error) {
        res.status(500).json({error: 'Unable to like the song.'});
    }
};

// export const dislikeTrack = async (req, res) => {
//     const id = req.params.tid
//     const userId = req.params.uid
//     try {
//         // Find the track by its trackId
//         const track = await likedSongDao.findLikedTrack({trackId: id});
//
//         if (!track) {
//             // Handle the case if the track does not exist
//             res.json("Song does not exist");
//         }
//
//         // Remove the user from the likedBy list (users list) for that track
//         const index = track.likedBy.indexOf(userId);
//         if (index > -1) {
//             track.likedBy.splice(index, 1);
//             await likedSongDao.saveLikedTrack(track); // Assuming you have a
//                                                       // method to save the
//                                                       // updated track in the
//                                                       // likedSongDao
//         }
//     } catch (error) {
//         // Handle any errors that occur during the deletion process
//         console.error('Error deleting liked song:', error);
//     }
// };

export default likedSongController;