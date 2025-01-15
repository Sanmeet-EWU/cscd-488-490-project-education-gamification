import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged} from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc } from "firebase/firestore";


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
export async function isEmailRegistered(email) {
    const playersRef = collection(db, "Players");
    const q = query(playersRef, where("SchoolEmail", "==", email)); // Match SchoolEmail field
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Return true if email exists
}
// export function isValidSchoolEmail(email, allowedDomain = null) {
//     // Basic email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         return false;
//     }

//     // Optional domain restriction
//     if (allowedDomain && !email.endsWith(allowedDomain)) {
//         return false;
//     }

//     return true;
// }
 
export async function registerUser(email) {
    // const allowedDomain = "@school.edu"; // Replace with your desired domain, or set to null to allow all domains

    // if (!isValidSchoolEmail(email, allowedDomain)) {
    //     alert(`Invalid email. Only emails ending with ${allowedDomain} are allowed.`);
    //     return false;
    // }

    const db = getFirestore();
    const playersRef = collection(db, "Players");

    try {
        // Add the new user to Firestore with an auto-generated document ID
        const docRef = await addDoc(playersRef, {
            SchoolEmail: email,
            SaveData: null // Initialize with no save data
        });
    
        // Use the auto-generated document ID as the PlayerID
        const playerId = docRef.id;
    
        // Optionally update the document to include the PlayerID field
        await setDoc(docRef, { PlayerID: playerId }, { merge: true });
    
        alert("Registration successful!");
        console.log("Registered user with PlayerID:", playerId);
        return true;
    } catch (error) {
        console.error("Error registering user:", error);
        alert("An error occurred during registration. Please try again.");
        return false;
    }    
}

export async function sendLoginLink(email) {
    const emailExists = await isEmailRegistered(email);

    if (!emailExists) {
        alert("This email is not registered.");
        return;
    }

    const actionCodeSettings = {
        url: 'http://localhost:8080', // Replace with your domain in production
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

export function completeLogin() {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');

        // If email is not found in local storage, prompt the user for it
        if (!email) {
            email = window.prompt('Please provide your email for confirmation:');
        }

        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                console.log('User signed in:', result.user);
                window.localStorage.removeItem('emailForSignIn');
                alert('Login successful!');
            })
            .catch((error) => {
                console.error('Error signing in:', error);
                alert('Failed to log in. Please try again.');
            });
    } else {
        console.log('Not a sign-in email link.');
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
    } else {
        console.log('No user is signed in.');
    }
});