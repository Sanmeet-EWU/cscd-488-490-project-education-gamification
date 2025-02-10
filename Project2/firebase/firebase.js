import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, getDoc, serverTimestamp} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

let app;
if (!app) {
    app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

let persistenceSet = false; // Prevent multiple persistence calls

if (!persistenceSet) {
    try {
        setPersistence(auth, browserSessionPersistence).then(() => {
            console.log("Auth persistence is set to local storage.");
            persistenceSet = true; // Mark as set
        });
    } catch (error) {
        console.error("Error setting auth persistence:", error);
    }
}

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
    console.trace("registerUser called with email:", email)
    // const allowedDomain = "@school.edu"; // Replace with domain or set to null to allow all domains

    // if (!email.endsWith(allowedDomain)) {
    //     alert(`Invalid email. Only emails ending with ${allowedDomain} are allowed.`);
    //     return false;
    // }

    // Check if the email already exists in the Players collection
    const playersRef = collection(db, "Players");
    const q = query(playersRef, where("SchoolEmail", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.warn("Email already registered, preventing duplicate registration:", email);
        return false; 
    }

    const username = prompt('Enter your desired username:');
    if (!username || username.trim() === '') {
        alert("Username cannot be empty.");
        return false;
    }

    try {
        const docRef = await addDoc(playersRef, {
            SchoolEmail: email,
            Username: username,
            SaveData: {
                level: 1,
                score: 0,
                inventory: [],
                position: { x: 100, y: 100 },
                lastSaved: serverTimestamp()
            }
        });

        console.log("User registered successfully with ID:", docRef.id);
        alert("Registration successful!");
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

export async function sendLoginLink(email) {
    const user = auth.currentUser;
    if (user) {
        console.log("Logging out previous user before sending login link...");
        await signOut(auth);
    }

    const emailExists = await isEmailRegistered(email);
    if (!emailExists) {
        alert("This email is not registered.");
        return;
    }

    const isLocal = window.location.hostname === "localhost";
    const actionCodeSettings = {
        url: isLocal ? "http://localhost:8080/game.html" : "https://macbethrpg.netlify.app/game.html",
        handleCodeInApp: true,
    };

    try {
        window.localStorage.setItem("emailForSignIn", email);  // Store email before sending link
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        console.log(" Login link sent successfully!");
        alert("Check your email for the login link.");
        return true;
    } catch (error) {
        console.error("❌ Error sending login link:", error);
        alert("Error sending login link. Please check console.");
        return false;
    }
}


export async function completeLogin() {
    console.log("Processing login link...");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log(" User is signed in:", user.email);

            //  Prevent infinite redirect loop
            if (!window.location.pathname.includes("game.html")) {
                console.log("Redirecting to game.html...");
                window.location.href = "game.html";  
            }
            return;
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
            console.log(" Detected valid sign-in email link.");
            let email = window.localStorage.getItem("emailForSignIn");

            if (!email) {
                console.error("❌ No email stored for sign-in. Cannot complete login.");
                alert("No email found for login. Please use a new login link.");
                return;
            }

            try {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                console.log(" User signed in successfully:", result.user);
                window.localStorage.removeItem("emailForSignIn");
                alert("Login successful!");

                //  Only redirect if not already on game.html
                if (!window.location.pathname.includes("game.html")) {
                    console.log("Redirecting to game.html...");
                    window.location.href = "game.html";
                }
            } catch (error) {
                console.error("❌ Error during sign-in:", error);
                alert("The sign-in link is invalid or expired. Please try logging in again.");
            }
        } else {
            console.log("❌ Not a valid sign-in email link.");
        }
    });
}

/**
 * Saves the player's game progress in Firestore.
 */
export async function saveGameData(saveData) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in, cannot save data.");
        return false;
    }

    try {
        const playerRef = doc(db, "Players", user.uid);  // Use UID instead of auto-generated ID
        await updateDoc(playerRef, {
            SaveData: {
                ...saveData,
                lastSaved: serverTimestamp()
            }
        });
        console.log("Game data saved successfully:", saveData);
        return true;
    } catch (error) {
        console.error("Error saving game data:", error);
        return false;
    }
}
/**
 * Loads the player's saved game progress from Firestore.
 */
export async function loadGameData() {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in, cannot load data.");
        return null;
    }

    try {
        const playerRef = doc(db, "Players", user.uid);
        const docSnap = await getDoc(playerRef);

        if (docSnap.exists() && docSnap.data().SaveData) {
            console.log("Loaded game data:", docSnap.data().SaveData);
            return docSnap.data().SaveData;
        } else {
            console.warn("No saved game data found. Using default values.");
            return {
                level: 1,
                score: 0,
                inventory: [],
                position: { x: 100, y: 100 }
            };
        }
    } catch (error) {
        console.error("Error loading game data:", error);
        return null;
    }
}

window.registerUser = registerUser;
window.sendLoginLink = sendLoginLink;