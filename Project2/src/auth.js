import { isUserSignedIn, sendLoginLink, registerUser } from '../firebase/firebase.js';

// Redirect to game.html if the user is already signed in
if (isUserSignedIn()) {
    window.location.href = '../game.html';
}

const loginForm = document.getElementById('loginForm');

if (!loginForm.hasListener) {
    console.log("Adding event listener to loginForm");

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        e.stopPropagation(); // Stop the event from bubbling up

        console.log("Login form submitted");

        const email = document.getElementById('loginEmail').value;
        const button = e.target.querySelector("button");

        // Disable the button to prevent multiple submissions
        button.disabled = true;

        try {
            const success = await sendLoginLink(email); // Assuming sendLoginLink handles the login
            if (success) {
                alert('Login link sent! Check your email.');
            } else {
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
        } finally {
            button.disabled = false; // Re-enable the button
        }
    });

    loginForm.hasListener = true; // Ensure listener is added only once
}

const registerForm = document.getElementById('registerForm');

if (!registerForm.hasListener) {
    console.log("Adding event listener to registerForm");
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ensure the default form submission is stopped
        e.stopPropagation(); // Stop the event from propagating further

        console.log("Register form submitted");
        const email = document.getElementById('registerEmail').value;
        const button = e.target.querySelector("button");

        // Disable the button to prevent multiple submissions
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
            button.disabled = false; // Re-enable the button
        }
    });
    registerForm.hasListener = true; // Ensure listener is added only once
}

