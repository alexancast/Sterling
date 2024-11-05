import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, get, push, onValue, update, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

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

let currentCaseKey = null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const allCases = [];

const logout_button = document.getElementById("logout");

function monitorAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            loadCases(); // Load cases after user is authenticated
        } else {
            window.location.href = "../HTML/index.html";
        }
    });
}

monitorAuthState();

logout_button.addEventListener("click", async function () {
    try {
        await logout();
    } catch (error) {
        // Handle any errors here
    }
});

async function logout() {
    await signOut(auth);
    window.location.href = "../HTML/index.html";
}

function loadCases() {
    const casesRef = ref(database, 'cases');
    allCases.length = 0;

    onValue(casesRef, (snapshot) => {

        const data = snapshot.val();

        if (data) {
            allCases.length = 0; // Clear the array before adding new data

            for (const caseKey in data) {
                const caseObject = data[caseKey];

                // Add the case to the allCases array
                allCases.push({
                    caseKey: caseKey,
                    ...caseObject
                });
            }
            displayCases();
        } else {
            console.warn('No data available at the "cases" path.');
        }
    }, (error) => {
        console.error('Error fetching data:', error);
    });
}



async function displayCases() {

    if (allCases.length > 0) {

        for (let i = 0; i < allCases.length; i++) {
            const element = allCases[i];
            displayCase(element, i);
        }
    }

    document.getElementById("cases-grid").style.display = "flex";
}

function displayCase(caseDetails, i) {
    // Create div with class 'case-card'
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('case-card');
    cardDiv.dataset.caseKey = caseDetails.caseKey;

    if (caseDetails.locked) {
        cardDiv.classList.add('locked');
        const classifiedStamp = document.createElement('div');
        classifiedStamp.innerHTML = "CLASSIFIED";
        classifiedStamp.classList.add('classified');
        cardDiv.appendChild(classifiedStamp);
    }

    // Create and append h3 for case name
    const caseName = document.createElement('h3');
    caseName.id = 'case-name';
    caseName.textContent = caseDetails.name || 'Unknown Case';
    cardDiv.appendChild(caseName);

    // Create and append p for case year
    const caseYear = document.createElement('p');
    caseYear.id = 'case-year';
    caseYear.innerHTML = `Year: ${caseDetails.year || 'Unknown'}`;
    cardDiv.appendChild(caseYear);

    // Create and append p for case difficulty
    const caseDifficulty = document.createElement('p');
    caseDifficulty.id = 'case-difficulty';
    var stars = getStars(caseDetails.difficulty);
    caseDifficulty.innerHTML = `Difficulty: <span class="stars">${stars || '★★★☆☆'}</span>`;
    cardDiv.appendChild(caseDifficulty);

    // Create and append p for case uploaded date
    const caseUploaded = document.createElement('p');
    caseUploaded.id = 'case-uploaded';
    caseUploaded.innerHTML = `Uploaded: ${caseDetails.uploaded || 'Unknown'}`;
    cardDiv.appendChild(caseUploaded);

    // Create and append p for case location
    const caseLocation = document.createElement('p');
    caseLocation.id = 'case-location';
    caseLocation.innerHTML = `Location: ${caseDetails.location || 'Unknown'}`;
    cardDiv.appendChild(caseLocation);

    // Create and append button for investigation
    const button = document.createElement('button');
    button.textContent = 'Investigate';
    button.onclick = function () {
        location.href = `case_details.html?id=${caseDetails.caseKey || 1}`;
    };
    // cardDiv.appendChild(button);

    // Append the cardDiv to the cases grid
    document.getElementById("cases-grid").appendChild(cardDiv);

    cardDiv.dataset.caseDetails = caseDetails.caseKey;
}

function getStars(difficulty) {
    var stars = "";
    for (let index = 0; index < 5; index++) {

        stars += difficulty < index + 1 ? "☆" : "★";

    }

    return stars;
}


// Modal Functionality
async function openModal(evidenceItem) {
    const caseKey = evidenceItem.dataset.caseKey;
    currentCaseKey = caseKey; // Store the caseKey for later use

    const casesRef = ref(database, 'cases');
    try {
        const snapshot = await get(child(casesRef, caseKey));
        if (snapshot.exists()) {
            const caseDetails = snapshot.val();

            const modal = document.getElementById('evidenceModal');
            const modalContent = document.getElementById('modalContent');
            modalContent.children[0].innerHTML = caseDetails.name;
            modalContent.children[1].children[0].innerHTML = caseDetails.year + " " + caseDetails.location;
            modalContent.children[1].children[2].innerHTML = getStars(caseDetails.difficulty);
            modalContent.children[2].innerHTML = caseDetails.description;
            modalContent.children[3].disabled = caseDetails.locked;
            modalContent.children[3].innerHTML = caseDetails.locked ? "Locked" : "Investigate";


            modal.style.display = "block";


        } else {
            alert("No data available");
        }
    } catch (error) {
        alert(error);
    }
}



function closeModal() {
    const modal = document.getElementById('evidenceModal');
    modal.style.display = "none";
    const modalContent = document.getElementById('modalContent');
    // modalContent.innerHTML = ''; // Clear previous content
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('closeButton').addEventListener('click', closeModal);

    // Now only listen to clicks on .case-card elements
    document.addEventListener('mouseup', function (event) {
        // Check if the clicked target is inside a .case-card element
        const clickedCard = event.target.closest(".case-card");

        if (clickedCard) {
            // Open the modal with the specific card that was clicked
            openModal(clickedCard);
        }
    });
});

document.getElementById('start-game-btn').addEventListener('click', function () {
    if (currentCaseKey) {
        window.location.href = `../HTML/case_details.html?id=${currentCaseKey}`;
    } else {
        alert('No case selected. Please select a case to start.');
    }
});