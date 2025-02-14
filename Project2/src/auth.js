import { isUserSignedIn, sendLoginLink, registerUser } from '../firebase/firebase.js';
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

//  Force Logout of Previous User
async function forceLogout() {
    if (auth.currentUser) {
        await signOut(auth);
    }
}

// Redirect to game.html if the user is already signed in
if (isUserSignedIn()) {
    window.location.href = '../game.html';
}