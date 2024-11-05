import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, get, set, ref as databaseRef, push, onValue, update, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7gxX8L9iQifF7l_Ih2Uw4iKU03FHnBbw",
    authDomain: "sterling-d2c39.firebaseapp.com",
    databaseURL: "https://sterling-d2c39-default-rtdb.europe-west1.firebasedatabase.app", // Ensure this is included
    projectId: "sterling-d2c39",
    storageBucket: "sterling-d2c39.appspot.com",
    messagingSenderId: "688373174785",
    appId: "1:688373174785:web:f6d0c695761b2fc42ee600",
    measurementId: "G-RHGZMMRW2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const logout_button = document.getElementById("logout");
const detectiveName = document.getElementById("detectiveName");
const createdDate = document.getElementById("createdDate");


async function monitorAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {

            try {

                detectiveName.innerText = user.displayName || 'Detective';

                const creationDate = new Date(user.metadata.creationTime);
                const formattedDate = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }).format(creationDate);
                createdDate.innerText = formattedDate;



            } catch (error) {
                console.error('Error in monitorAuthState:', error);
            }
        } else {
            window.location.href = "../index.html";
        }
    });
}

monitorAuthState();

logout_button.addEventListener("click", async function () {
    try {
        await logout();
    } catch (error) {

    }
});

async function logout() {
    await signOut(auth);
    window.location.href = "../index.html";
}

async function setupStats() {
    // Wait for the authentication state to initialize and get the current user
    const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Unsubscribe after getting the user
            if (user) {
                resolve(user);
            } else {
                reject(new Error('No user is currently signed in.'));
            }
        }, (error) => {
            reject(error);
        });
    });

    const userId = user.uid;
    const userRef = databaseRef(database, `users/${userId}`);

    try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Display user data with fallback for missing properties
            const pointsDisplay = document.getElementById("points");
            pointsDisplay.innerText = userData.points || 0;

            const casesSolved = userData.solvedCases || [];
            const solved = document.getElementById("solved");
            solved.innerText = casesSolved.length; // Will be 0 if solvedCases is not present

            const difficulty = calculateAverageDifficulty(casesSolved);
            document.getElementById("rank").innerText = calculateRank(userData.points || 0);

        } else {
            // User data does not exist; create a new user with default properties
            const defaultUserData = {
                points: 0,
                solvedCases: []
            };

            await set(userRef, defaultUserData);

            // Display default data
            const pointsDisplay = document.getElementById("points");
            pointsDisplay.innerText = defaultUserData.points;

            const solved = document.getElementById("solved");
            solved.innerText = defaultUserData.solvedCases.length;

            document.getElementById("rank").innerText = defaultUserData.rank;
            window.location.href = "../HTML/profile.html";
        }
    } catch (error) {
        console.error('Error checking or creating user data:', error);
        throw error;
    }
}
async function calculateAverageDifficulty(casesSolved) {

    const casesRef = databaseRef(database, `cases/`);

    try {
        const snapshot = await get(casesRef);

        if (snapshot.exists()) {

            var difficulty = 0;

            // Iterate over the children using snapshot.forEach()
            snapshot.forEach((childSnapshot) => {

                for (let index = 0; index < casesSolved.length; index++) {
                    const solved = casesSolved[index];
                    const key = childSnapshot.key; // Get the key of the child
                    const element = childSnapshot.val(); // Get the value of the child

                    if (solved == key) {
                        difficulty += element.difficulty;
                    }

                }

            });


            document.getElementById("difficulty").innerText = difficulty / casesSolved.length;

            document.querySelector(".profile-container").style.display = "block";


        } else {

            return false;
        }
    } catch (error) {
        console.error('Error checking solved cases:', error);
        throw error;
    }

}

function calculateRank(value) {

    switch (true) {
        case (value >= 500):
            return "Commissioner";

        case (value >= 400):
            return "Chief of Detectives";

        case (value >= 300):
            return "Chief Inspector";

        case (value >= 250):
            return "Detective Inspector";

        case (value >= 200):
            return "Lieutenant Detective";

        case (value >= 150):
            return "Lead Investigator";

        case (value >= 100):
            return "Senior Detective";

        case (value >= 50):
            return "Junior Detective";

        default:
            return "Private Eye";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    setupStats();
});