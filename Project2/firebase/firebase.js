import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDRzsA9k8nv5MfsBXFUCSXzGmNHp8rXTvM",
    authDomain: "education-gamification.firebaseapp.com",
    projectId: "education-gamification",
    storageBucket: "education-gamification.firebasestorage.app",
    messagingSenderId: "481951042794",
    appId: "1:481951042794:web:42696d9447acf377771b93"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fetch player data
export async function fetchData() {
    try {
        const docRef = doc(db, "Players", "Player");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

// Check if email is registered
export async function isEmailRegistered(email) {
    const playersRef = collection(db, "Players");
    const q = query(playersRef, where("SchoolEmail", "==", email)); // Match SchoolEmail field
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Return true if email exists
}

// Register a new user
export async function registerUser(email) {
    const username = prompt("Create your username:");
    
    if (!username || username.trim() === "") {
        alert("Username cannot be empty.");
        return false;
    }
        
    try {
        const user = auth.currentUser; // Get the currently signed-in user
        if (!user) {
            alert("User must be signed in to register.");
            return false;
        }

        // Create a document in the Players collection with the UID as the document ID
        const docRef = doc(db, "Players", user.uid);
        await setDoc(docRef, {
            PlayerID: user.uid,
            SchoolEmail: email,
            SaveData: null,
            Username: username
        });

        alert("Registration successful!");
        console.log("Registered user with PlayerID:", user.uid);
        return true;
    } catch (error) {
        console.error("Error registering user:", error);
        alert("An error occurred during registration. Please try again.");
        return false;
    }
}

// Check if the user is signed in
export function isUserSignedIn() {
    let user = auth.currentUser;
    return !!user;
}

// Get the username of the signed-in user
export async function getUsername() {
    let user = auth.currentUser;
    if (user) {
        try {
            const docRef = doc(db, "Players", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userName = docSnap.data().Username;
                console.log("Username: ", userName);
                return userName;
            } else {
                console.error("No document found for user ID: ", user.uid);
                return null;
            }
        } catch (error) {
            console.error("Error fetching username from Firestore: ", error);
            return null;
        }
    } else {
        console.log("Not signed in");
        return null;
    }
}

// Send login link to the provided email
export async function sendLoginLink(email) {
    const emailExists = await isEmailRegistered(email);

    if (!emailExists) {
        alert("This email is not registered.");
        return;
    }

    const actionCodeSettings = {
        url: 'http://localhost:8080', // Replace with domain in production
        handleCodeInApp: true,
    };

    return sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            alert('Login link sent! Check your email.');
        })
        .catch(error => {
            console.error("Error sending login link:", error);
        });
}

// Complete the login process
export function completeLogin() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is already signed in:", user.email);
            // Perform any setup for the authenticated user
        } else if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');

            if (!email) {
                alert("No email found for login. Please use a new login link.");
                return;
            }

            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    console.log("User signed in:", result.user);
                    window.localStorage.removeItem('emailForSignIn');
                    alert("Login successful!");
                })
                .catch((error) => {
                    console.error("Error signing in:", error);
                    alert("The sign-in link is invalid or expired. Please try logging in again.");
                });
        } else {
            console.log("Not a sign-in email link.");
        }
    });
}

// Set persistence for authentication
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Auth persistence is set to local storage.");
    })
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is already logged in:", user.email);
        //Uncomment this during testing to force logout on refresh
        // signOut(auth).then(() => {
        //     console.log("Signed out successfully.");
        // });
    } else {
        console.log("No user is signed in.");
    }
});
