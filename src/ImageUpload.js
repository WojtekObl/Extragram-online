import { Button } from '@material-ui/core';
import React, { useState } from 'react';
import { storage, db } from "./firebase";
import firebase from 'firebase';
import './ImageUpload.css';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


function CircularProgressWithLabel(props) {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}



function ImageUpload({ username }) {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showprogress, setShowprogress] = useState(false)

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);

        }
    }

    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        setShowprogress(true);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                //progress function
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                //Error function... 
                console.log(error);
                alert(error.message)
            },
            () => {
                //complete function 
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        //post image inside db
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageUrl: url,
                            userName: username,
                        });

                        setProgress(0);
                        setCaption("");
                        setImage(null);
                    })
                    .then(
                        setShowprogress(false));
            }

        )

    }

    return (
        <div className="imageUpload">
            <div className="imageUpload__header">
                <Avatar
                    className="post__avatar"
                    alt={username}
                    src="mjm"
                />
                <h3>{username}</h3>
            </div>
            {/* {showprogress &&
            <CircularProgressWithLabel value={progress} /> } */}
            {/* <progress className="imageUpload__progress" value={progress} max="100" /> */}
            <input

                className="imageUpload__caption MuiInput-multiline" type="text" placeholder="Enter a caption..." value={caption} onChange={event => setCaption(event.target.value)}
            />
            <input className="imageUpload__picker" t type="file" onChange={handleChange} />
            {showprogress &&
                <CircularProgressWithLabel className="imageUpload__progress" value={progress} />}
            <Button disabled={!image} onClick={handleUpload}>
                Upload
            </Button>
        </div>
    )
}

export default ImageUpload
