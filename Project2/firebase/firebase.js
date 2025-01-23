import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export default app;
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

//Register User
export async function registerUser(email) {
    // const allowedDomain = "@school.edu"; // Replace with your desired domain or set to null to allow all domains

    // if (!email.endsWith(allowedDomain)) {
    //     alert(`Invalid email. Only emails ending with ${allowedDomain} are allowed.`);
    //     return false;
    // }

    const username = prompt('Enter your desired username:');
    if (!username || username.trim() === '') {
        alert("Username cannot be empty.");
        return false;
    }

    const db = getFirestore();
    const playersRef = collection(db, "Players");   

    try {
        // Add the new user to Firestore with an auto-generated document ID
        const docRef = await addDoc(playersRef, {
            SchoolEmail: email,
            Username: username, // Add username field
            SaveData: null // Initialize with no save data
        });

        // Use the auto-generated document ID as the PlayerID
        const playerId = docRef.id;

        await setDoc(docRef, { PlayerID: playerId }, { merge: true });

        alert("Registration successful!");
        console.log("Registered user with PlayerID:", playerId, "and Username:", username);
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
            const email = user.email; // Get the logged-in user's email
            const playersRef = collection(db, "Players");
            const q = query(playersRef, where("SchoolEmail", "==", email)); // Query Firestore using email
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0]; // Get the first matching document
                const userName = docSnap.data().Username;
                console.log("Username: ", userName);
                return userName;
            } else {
                console.error("No document found for email: ", email);
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
export async function completeLogin() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is already signed in:", user.email);

            try {
                const email = user.email;
                const playersRef = collection(db, "Players");
                const q = query(playersRef, where("SchoolEmail", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    console.log("Matching Firestore record found for email:", email, "with document ID:", docSnap.id);
                } else {
                    console.log("No matching Firestore record found for email:", email);
                }
            } catch (error) {
                console.error("Error retrieving Firestore record:", error);
            }
        } else if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem("emailForSignIn");

            if (!email) {
                alert("No email found for login. Please use a new login link.");
                return;
            }

            try {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                console.log("User signed in:", result.user);

                window.localStorage.removeItem("emailForSignIn");
                alert("Login successful!");
            } catch (error) {
                console.error("Error signing in:", error);
                alert("The sign-in link is invalid or expired. Please try logging in again.");
            }
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
