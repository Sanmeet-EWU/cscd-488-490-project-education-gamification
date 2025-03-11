import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, getDoc, serverTimestamp, updateDoc, orderBy, limit} from "firebase/firestore";

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
export { auth, db };
let persistenceSet = false;

if (!persistenceSet) {
    try {
        setPersistence(auth, browserSessionPersistence).then(() => {
            persistenceSet = true;
        });
    } catch (error) {
        // Critical error handling only
    }
}

export default app;

// Fetch player data
export async function fetchData() {
    try {
        const docRef = doc(db, "Players", "Player");
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        return null;
    }
}

// Check if email is registered
export async function isEmailRegistered(email) {
    const playersRef = collection(db, "Players");
    const q = query(playersRef, where("SchoolEmail", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}


// Fetch leaderboard data
export async function fetchLeaderboardData() {
    const leaderboardData = {};
    const q = query(collection(db, "Players"), orderBy("SaveData.score", 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(data); 
        leaderboardData[i] = { Username: data.Username, Score: data.SaveData.score };
    });
    return leaderboardData;
}


export async function registerUser(email) {
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
        alert("This email is already registered.");
        console.warn("Email already registered, preventing duplicate registration:", email);
        return false; 
    }

    const username = prompt('Enter your desired username:');
    if (!username || username.trim() === '') {
        alert("Username cannot be empty.");
        return false;
    }

    try {
        const normalizedEmail = email.toLowerCase(); // Normalize email to lowercase
        const docRef = await addDoc(playersRef, {
            SchoolEmail: normalizedEmail,
            Username: username,
            SaveData: {
                scene: "Act1Scene1",
                score: 0,
                inventory: [],
                position: { x: 100, y: 100 },
                lastSaved: serverTimestamp()
            }
        });
        alert("Registration successful!");
        return true;
    } catch (error) {
        console.error("Error registering user:", error);
        alert("An error occurred during registration. Please try again.");
        return false;
    }
}


// Save game progress
export async function saveGameData(saveData) {
    const user = auth.currentUser;
    if (!user) {
        return false;
    }

    try {
        const normalizedEmail = user.email.toLowerCase();
        const playersRef = collection(db, "Players");
        const q = query(playersRef, where("SchoolEmail", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return false;
        }

        const playerDoc = querySnapshot.docs[0];
        const playerDocId = playerDoc.id;
        const playerRef = doc(db, "Players", playerDocId);
        
        await updateDoc(playerRef, {
            SaveData: {
                ...saveData,
                lastSaved: serverTimestamp(),
            },
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Load game progress
export async function loadGameData() {
    const user = auth.currentUser;
    if (!user) {
        return null;
    }

    try {
        const normalizedEmail = user.email.toLowerCase();
        const playersRef = collection(db, "Players");
        const q = query(playersRef, where("SchoolEmail", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const playerDoc = querySnapshot.docs[0];
        const playerDocId = playerDoc.id;
        const playerRef = doc(db, "Players", playerDocId);
        const docSnap = await getDoc(playerRef);

        if (docSnap.exists() && docSnap.data().SaveData) {
            return docSnap.data().SaveData;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Check if user is signed in
export function isUserSignedIn() {
    let user = auth.currentUser;
    return !!user;
}

// Get username of signed-in user
export async function getUsername() {
    let user = auth.currentUser;

    if (user) {
        try {
            const email = user.email;
            const playersRef = collection(db, "Players");
            const q = query(playersRef, where("SchoolEmail", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const userName = docSnap.data().Username;
                return userName;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    } else {
        return null;
    }
}

// Send login link via email
export async function sendLoginLink(email) {
    const normalizedEmail = email.toLowerCase();
    const user = auth.currentUser;
    if (user) {
        await signOut(auth);
    }

    const emailExists = await isEmailRegistered(normalizedEmail);
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
        window.localStorage.setItem("emailForSignIn", normalizedEmail);
        await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
        alert("Check your email for the login link.");
        return true;
    } catch (error) {
        alert("Error sending login link. Please try again.");
        return false;
    }
}

// Complete login process
export async function completeLogin() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (!window.location.pathname.includes("game.html")) {
                window.location.href = "game.html";
            }
            return;
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem("emailForSignIn");

            if (!email) {
                email = prompt("Please enter your email to complete login:");

                if (!email) {
                    alert("Email is required to complete login.");
                    return;
                }
            }

            try {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                window.localStorage.removeItem("emailForSignIn");

                if (!window.location.pathname.includes("game.html")) {
                    window.location.href = "game.html";
                }
            } catch (error) {
                alert("The sign-in link is invalid or expired. Please try logging in again.");
            }
        }
    });
}

window.registerUser = registerUser;
window.sendLoginLink = sendLoginLink;