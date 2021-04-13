import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import Post from "./Post";
import { auth, db } from "./firebase";
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button, TextField } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import GlobalState from "./GlobalState"





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
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));




function App() {

  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  //singup/in errors handle
  const [mailError, setMailError] = useState(false);
  const [mailErrorText, setMailErrorText] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [signInError, setSignInError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [touched, setTouched] = useState(false);

  const handleTouch = () => {
    setTouched(true);
  };

  //Global active TAG
  const [tag, setTag] = useState("")

  // UseEffect -> runs a piece of code based on specific condition
  //ten fragment kodu uruchamia  po odświeżniu strony listener moniutorujacy zmiany w bazie danych, przy kazdej zmianie  tworzy snapshot bazy i uruchami kod aktulizujacy App state do stanu ze snapshota
  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, []);

  useEffect(() => {
    if (password !== confirmPassword && touched) {
      setConfirmPasswordError("password doesn't match")
    } else setConfirmPasswordError("")


  }, [password, confirmPassword, touched]);


  //listener na zmiane w bazie autoryzacji
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user is logged in
        // console.log(authUser);
        setUser(authUser);
        if (authUser.displayName) {
          //dont update username(displayed
        } else {
          //if profile was created
          return authUser.updateProfile({
            displayName: username,
          })
        }
      } else {
        // user has logged out
        setUser(null);
      }
    })

    return () => {
      //perform cleanup of listeners
      unsubscribe();
    }

  }, [user, username])

  const signUp = (event) => {
    event.preventDefault();
    setMailError(false)
    setMailErrorText("")
    setPasswordError(false)
    setPasswordErrorText("")

    //autoryzacja użytkownia za pomocą firebase
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        }).then(setOpen(false));
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/invalid-email":
            setMailError(true)
            setMailErrorText(error.message)
            break;
          case "auth/email-already-in-use":
            setMailError(true)
            setMailErrorText(error.message)
            break;
          case "auth/weak-password":
            setPasswordError(true)
            setPasswordErrorText(error.message)
            break;
          default:
            alert(error.message);
        }
        // console.log(error);
        // alert(error.message)
      })

  }


  const signIn = (event) => {
    event.preventDefault();
    setSignInError(false)

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => setOpenSignIn(false))
      .catch((error) => {
        // alert(error.message)
        setSignInError(true)
      })
    // tutaj musze dodac przypisanie tresci errorra do spana na dole passworda

  }


  return (
    <div className="app">

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="modal"
      >
        <div style={modalStyle} className={classes.paper}>
          <form action="" className="app__signup">
            <center>
              <img src="https://i.gyazo.com/cc9abb71a63bddde73cf3b4fb96e847c.png" alt="Extragram logo" className="app__headerImage" />
            </center>

            <TextField
              label="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              inputProps={{ maxLength: 12 }}
            />

            {/* <InputLabel htmlFor="my-input">Email address</InputLabel>
            <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText> */}
            <TextField
              error={mailError}
              // error={touched && Boolean(errorMessage.length)}
              helperText={mailErrorText}
              type="email"
              label="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
            />
            <TextField
              error={passwordError}
              helperText={passwordErrorText}
              type="password"
              label="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
            />
            <TextField
              error={touched && Boolean(confirmPasswordError.length)}
              helperText={confirmPasswordError}
              type="password"
              label="confirm password"
              onFocus={handleTouch}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="dense"
            />


            <Button type="submit" disabled={!email || !password || !username || !confirmPassword} onClick={signUp}>Sign Up</Button>
          </form>


        </div>
      </Modal>


      {/* login modal */}
      {/* zmien te modale na komponent */}
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
        className="modal"
      >
        <div style={modalStyle} className={classes.paper}>
          <form action="" className="app__signup">
            <center>
              <img src="https://i.gyazo.com/cc9abb71a63bddde73cf3b4fb96e847c.png" alt="Extragram logo" className="app__headerImage" />
            </center>
            <TextField
              type="email"
              label="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSignInError(false)
              }}
              margin="dense"
            />
            <TextField
              type="password"
              label="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setSignInError(false)
              }}
              margin="dense"
            />
            {signInError && (<span className="signIn__error">email or password is incorrect </span>)}
            <Button disabled={!email || !password} type="submit" onClick={signIn}>Sign In</Button>
          </form>


        </div>
      </Modal>






      <div className="app__header">
        <div className="app_header__container">
          <img src="https://i.gyazo.com/cc9abb71a63bddde73cf3b4fb96e847c.png" alt="Extragram logo" className="app__headerImage" />
          {/* display diferent button depend on user log in or not */}

          {user ? (
            <Button onClick={() => auth.signOut()}>Log out</Button>
          ) :
            (
              <div className="app__loginContainer">
                <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
                <Button onClick={() => setOpen(true)}>Sign Up</Button>
              </div>
            )}
        </div>
        <a href="https://github.com/WojtekObl/Extragram-online" target="blank">visit github repository</a>
      </div>

      <div className="app__posts">

        <GlobalState.Provider value={[tag, setTag]}>
            <div className="post__left">
            {tag &&
              <div className="posts__hashtag">
                <p>You are watching <strong>{tag}</strong></p>
                <Button onClick={() => setTag(null)}>Cancel</Button>
              </div>
            }
            {
              posts
              .filter(({ post }) => {
                if(tag) {
                  console.log(tag)
                  return post.hashtags.includes(tag)
                } else return true
               
              })
              .map(({ id, post }) => (
                <Post
                  key={id}
                  postId={id}
                  user={user}
                  userName={post.userName}
                  caption={post.caption}
                  imageUrl={post.imageUrl}
                />
              ))
              
            }
          </div>
        </GlobalState.Provider>
        <div className="post__right">

          {user ? (
            <ImageUpload user={user} />)
            :
            (
              <h3 className="login__info">Sorry you need sign in to upload...</h3>
            )}

        </div>
      </div>

      {/* <Post
        imageUrl="https://i.pinimg.com/originals/e8/b2/71/e8b271169214323595f5155a649884d2.jpg"
        userName="RandoomUser"
        caption="Wow! It works"
      />

      <Post
        imageUrl="https://images.unsplash.com/photo-1554080353-a576cf803bda?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8cGhvdG98ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        userName="USER TWO"
        caption="DOPE"
      /> */}



    </div>
  );
}

export default App;
