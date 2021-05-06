import React, { useEffect, useState, useContext } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import firebase from "firebase/app";
import { ReactTagify } from "react-tagify";
import GlobalState from "./GlobalState";
import { Button, Modal, TextField } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 515,
    maxWidth: "100%",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid lightgrey",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(0, 0, 3),
  },
  root: {
    "& .MuiTextField-root": {
      // margin: theme.spacing(1),
      width: "25ch",
      padding: "20px",
      width: "100%",
    },
    ".MuiFormControl-root": {
      margin: "30px",
    },
  },
}));

function Post({ postId, user, imageUrl, userName, caption }) {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newCaption, setNewCaption] = useState("");

  const [tag, setTag] = useContext(GlobalState);

  const handleOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });

      // console.log(postId)
      // console.log(comments)
    }

    return () => {
      //perform cleanup of listeners
      unsubscribe();
    };
  }, [postId]);

  const postComment = (event) => {
    event.preventDefault();

    db.collection("posts").doc(postId).collection("comments").add({
      text: comment,
      username: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setComment("");
  };

  const handleDelete = () => {
    db.collection("posts")
      .doc(postId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  };

  const handleEdit = () => {
    db.collection("posts")
      .doc(postId)
      .update({ caption: newCaption })
      .then(() => {
        setOpenEdit(false);
      })
      .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  };

  return (
    <div className="post">
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="Delete post"
        aria-describedby="Decide if you want to delete chosen post"
      >
        <DialogTitle id="alert-dialog-title">{"Delete the post"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="secondary">
            No
          </Button>
          <Button onClick={handleDelete} color="black" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <div style={modalStyle} className={classes.paper}>
          <div className="post edit_modal">
            <div className="post__header">
              <Avatar className="post__avatar" alt={userName} src="mjm" />
              <h3>{userName}</h3>
            </div>

            <img className="post__image" src={imageUrl} alt="" />
            {/* <h4 className="edit__username">{userName}:</h4> */}
            {/* <textarea className="edit__caption" cols="30" rows="10" defaultValue={caption}></textarea> */}

            <TextField
              id="outlined-multiline-static"
              className="edit__caption"
              label="Caption"
              multiline
              defaultValue={caption}
              onChange={(e) => setNewCaption(e.target.value)}
              variant="outlined"
              style={{ margin: "10px" }}
            />
          </div>
          <div className="edit__buttons">
            <Button onClick={handleEdit}>Aplly</Button>
            <Button onClick={() => setOpenEdit(false)} color="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <div className="post__header">
        <Avatar className="post__avatar" alt={userName} src="mjm" />
        <h3>{userName}</h3>
      </div>

      <img className="post__image" src={imageUrl} alt="" />

      <h4 className="post__text">
        <strong>{userName} </strong>
        <ReactTagify
          colors={"red"}
          tagClicked={(tag) => {
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            setTag(tag);
          }}
        >
          {caption}
        </ReactTagify>

        {userName == user?.displayName && (
          <div className="post__control">
            <button
              className="post__controlButton"
              onClick={() => setOpenEdit(true)}
            >
              Edit
            </button>
            <button className="post__controlButton" onClick={handleOpenDelete}>
              Delete
            </button>
          </div>
        )}
      </h4>

      <div className="post__comments">
        {comments.map((comment) => (
          <p key={comment.timestamp}>
            <strong>{comment.username}</strong> {comment.text}
          </p>
        ))}
      </div>

      {user && (
        <form className="post__commentBox">
          <input
            type="text"
            className="post__input"
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="post__button"
            disabled={!comment}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
