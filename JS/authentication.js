import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
// import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD7gxX8L9iQifF7l_Ih2Uw4iKU03FHnBbw",
    authDomain: "sterling-d2c39.firebaseapp.com",
    projectId: "sterling-d2c39",
    storageBucket: "sterling-d2c39.appspot.com",
    messagingSenderId: "688373174785",
    appId: "1:688373174785:web:f6d0c695761b2fc42ee600",
    measurementId: "G-RHGZMMRW2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
// const database = getDatabase(app)




async function monitorAuthState() {
    onAuthStateChanged(auth, user => {

        if (user) {

            if (user.emailVerified) {
                window.location.href = "../HTML/dashboard.html";
            } else {
                alert("Please check your email to verify your account.");

            }


        } else {
            //user has signed out
        }
    })
}

document.addEventListener("keydown", (event) => {
    const sound = document.getElementById("key-sound");

    // Check if the pressed key is a letter (a-z) or a number (0-9)
    // if (/^[a-z0-9]$/i.test(event.key)) {
    sound.currentTime = 0; // Reset to start in case sound is already playing

    // Randomize playback rate between 0.9 and 1.1 for slight pitch variation
    sound.playbackRate = 0.9 + Math.random() * 0.2;

    sound.play();
    // }
});



monitorAuthState();


const scrollContainer = document.querySelector(".container");

scrollContainer.addEventListener("scroll", () => {
    const scrollTop = scrollContainer.scrollTop; // Get the current scroll position within the container
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight; // Calculate scrollable height of the container

    // Calculate the grayscale percentage (100% at the top, 0% at the bottom)
    const grayscalePercentage = Math.max(0, 100 - (scrollTop / scrollHeight) * 100);

    // Apply the grayscale filter to the body
    document.body.style.filter = `grayscale(${grayscalePercentage}%)`;
});





function switchSections(oldSection, newSection) {
    // Fade out the old section
    oldSection.classList.add("hidden");

    // Wait for the fade-out transition to complete before showing the new section
    setTimeout(() => {
        oldSection.style.display = "none"; // Hide the old section completely

        // Show and fade in the new section
        newSection.style.display = "flex";
        setTimeout(() => newSection.classList.remove("hidden"), 10); // Delay to trigger CSS transition
    }, 500); // Match this timeout to the CSS transition duration (0.5s)
}

document.addEventListener("DOMContentLoaded", function () {
    const section1 = document.getElementById("login-section");
    const section2 = document.getElementById("create-section");

    // Initially show only section1
    section2.style.display = "none";
    section2.classList.add("hidden");

    // Function call to switch from section1 to section2
    // switchSections(section1, section2);
})



const submit = document.getElementById("submit");

submit.addEventListener("click", async function () {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorDisplay = document.getElementById("error-message"); // Create an element to display errors

    const email = usernameInput.value;
    const password = passwordInput.value;



    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {


        // Visa felmeddelandet i errorDisplay
        errorDisplay.textContent = error.message;

        // Ställ in en tidsfördröjning på 3 sekunder för att ta bort felmeddelandet
        setTimeout(() => {
            errorDisplay.textContent = ""; // Ta bort felmeddelandet
        }, 5000); // 3000 millisekunder (3 sekunder)

    }

});

const new_account = document.getElementById("new-account");

new_account.addEventListener("click", function () {

    const section1 = document.getElementById("login-section");
    const section2 = document.getElementById("create-section");

    switchSections(section1, section2);
});

const already_account = document.getElementById("already-account");

already_account.addEventListener("click", function () {

    const section1 = document.getElementById("create-section");
    const section2 = document.getElementById("login-section");

    switchSections(section1, section2);
});

const register = document.getElementById("register");

register.addEventListener("click", async function () {

    await createProfile();


})


async function createProfile() {

    const email = document.getElementById('create-email').value; // Fetch the email value here
    const password = document.getElementById('create-password').value; // Fetch the password value here
    const repeat_password = document.getElementById('create-confirm_password').value; // Fetch the repeat_password value here
    const username = document.getElementById('create-username').value; // Fetch the repeat_password value here
    const error = document.getElementById('error-message');

    if (await validate_email(email, error) == false) {

        alert("Epost felaktigt.");
        return;
    }

    if (await validate_password(password, repeat_password, error) == false) {
        alert("Lösenordet felaktigt.");
        return;
    }

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

        updateProfile(auth.currentUser, {
            displayName: username
        }).then(() => {
            // Profile updated!
            onAuthStateChanged(auth, user => {
                if (user && !user.emailVerified) {
                    sendEmailVerification(user);
                    const section1 = document.getElementById("login-section");
                    const section2 = document.getElementById("create-section");
                    switchSections(section2, section1);
                } else {
                    // User is signed out or email is verified
                }
            });

            // ...
        }).catch((error) => {
            alert(error);

        });


    } catch (err) {
        console.error("Could not create profile:", err);
    }

}


function validate_email(email, error) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    if (expression.test(email)) {
        return true;
    } else {
        error.textContent = "Felaktig e-postadress.";
        return false;
    }
}

async function validate_password(password, repeat_password, error) {

    if (password == null || password.length < 6) {
        window.alert("Lösenordet är för kort.");
        return false;
    } else {

        if (password === repeat_password) {
            // error.textContent = ''; // Clear the error message
            return true;
        } else {
            window.alert("Lösenorden matchar inte.");
            return false;
        }
    }
}