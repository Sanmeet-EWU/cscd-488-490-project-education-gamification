import { isUserSignedIn, sendLoginLink, registerUser } from '../firebase/firebase.js';
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

// ✅ Force Logout of Previous User
async function forceLogout() {
    if (auth.currentUser) {
        console.log("Logging out previous user before new login...");
        await signOut(auth);
    }
}

// Redirect to game.html if the user is already signed in
if (isUserSignedIn()) {
    window.location.href = '../game.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        if (!loginForm.hasListener) {
            console.log("Adding event listener to loginForm");

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log("Login form submitted");

                const email = document.getElementById('loginEmail').value;
                const button = e.target.querySelector("button");

                button.disabled = true;

                try {
                    const success = await sendLoginLink(email);
                    if (success) {
                        alert('Login link sent! Check your email.');
                    } else {
                        alert('Login failed. Please try again.');
                    }
                } catch (error) {
                    console.error("Error during login:", error);
                    alert("An error occurred. Please try again.");
                } finally {
                    button.disabled = false;
                }
            });

            loginForm.hasListener = true;
        }
    } else {
        console.warn("⚠️ Warning: `loginForm` not found. This may happen if `auth.js` runs before the DOM is ready.");
    }

    if (registerForm) {
        if (!registerForm.hasListener) {
            console.log("Adding event listener to registerForm");

            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log("Register form submitted");
                const email = document.getElementById('registerEmail').value;
                const button = e.target.querySelector("button");

                button.disabled = true;

                try {
                    const success = await registerUser(email);
                    if (success) {
                        alert('Registration successful!');
                    } else {
                        alert('Registration failed. Please try again.');
                    }
                } catch (error) {
                    console.error("Error during registration:", error);
                } finally {
                    button.disabled = false;
                }
            });

            registerForm.hasListener = true;
        }
    } else {
        console.warn("⚠️ Warning: `registerForm` not found. This may happen if `auth.js` runs before the DOM is ready.");
    }
});
