import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
