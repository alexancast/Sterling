// Import and initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getStorage, ref as storageRef, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getDatabase, get, set, ref as databaseRef, push, onValue, update, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


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
const storage = getStorage(app);
const database = getDatabase(app);

function setSiblingIndex(element, newIndex) {
    const parent = element.parentNode;
    if (!parent) {
        console.error('Element has no parent');
        return;
    }

    const siblings = Array.from(parent.children);
    const totalSiblings = siblings.length;

    // Ensure the newIndex is within valid range
    newIndex = Math.max(0, Math.min(newIndex, totalSiblings - 1));

    // Remove the element from its current position
    parent.removeChild(element);

    if (newIndex >= totalSiblings - 1) {
        // Append to the end
        parent.appendChild(element);
    } else {
        // Insert before the child at newIndex
        parent.insertBefore(element, siblings[newIndex]);
    }
}


// document.getElementById('start-button').addEventListener('click', function () {
//     window.location.href = '../HTML/dashboard.html';
// });

// The hash function as previously defined
async function computeUniqueHash(input1, input2, input3) {
    const combinedInput = `${input1}|${input2}|${input3}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // Convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Convert bytes to hex string
    return hashHex;
}

// Get references to the DOM elements
const input1 = document.getElementById('suspect-name');
const input2 = document.getElementById('crime-scene');
const input3 = document.getElementById('time');
const hashLabel = document.getElementById('hash');

// Function to update the hash label
async function updateHash() {
    const value1 = input1.value.toLowerCase().replaceAll(/\s/g, '');
    const value2 = input2.value.toLowerCase().replaceAll(/\s/g, '');
    const value3 = input3.value.toLowerCase().replaceAll(/\s/g, '');

    // Compute the hash
    const hash = await computeUniqueHash(value1, value2, value3);

    // Update the label with the new hash
    hashLabel.textContent = hash;
}

// Add event listeners to call updateHash whenever an input changes
input1.addEventListener('input', updateHash);
input2.addEventListener('input', updateHash);
input3.addEventListener('input', updateHash);

// Initialize the hash when the page loads
window.addEventListener('load', updateHash);

var caseKey;

document.addEventListener('DOMContentLoaded', () => {
    // Call getAllFilesInFolder with your folder path in Firebase Storage

    // Function to get query parameter by name
    function getParameterByName(name) {
        const url = window.location.search;
        const params = new URLSearchParams(url);
        return params.get(name);
    }

    caseKey = getParameterByName('id');

    if (caseKey) {
        // Use the caseKey to load case details from Firebase
        getAllFilesInFolder(`Cases/${caseKey}`)
            .then(files => {
                loadRandomEvidenceFiles(files).then(() => {
                    // const loadingScreen = document.getElementById("loading-screen");
                    // loadingScreen.style.display = 'none'
                });
            })
            .catch(error => console.error("Error:", error));


    } else {
        alert('No caseKey provided in the URL.');
    }

});

async function getAllFilesInFolder(folderPath) {
    const storage = getStorage();
    const folderRef = storageRef(storage, folderPath);

    try {
        // List all items in the folder
        const folderContents = await listAll(folderRef);
        const filePromises = folderContents.items.map(async (itemRef) => {
            // Get the download URL for each file
            const url = await getDownloadURL(itemRef);
            return { name: itemRef.name, url };
        });

        // Wait for all download URLs to resolve
        const files = await Promise.all(filePromises);
        return files;

    } catch (error) {
        console.error("Error retrieving files:", error);
        return []; // Return an empty array if there's an error
    }
}

async function loadRandomEvidenceFiles(images) {
    const workspace = document.getElementById('workspace');

    for (const path of images) {
        const evidenceDiv = document.createElement('div');
        evidenceDiv.classList.add('evidence-item', 'minimized');

        // Store the image URL in a data attribute
        evidenceDiv.setAttribute('data-image-url', path.url);

        const lineDiv = document.createElement('div');
        lineDiv.classList.add('lineBorder');
        evidenceDiv.appendChild(lineDiv);

        const img = document.createElement('img');
        img.src = path.url;
        img.alt = "Evidence Image";
        img.style.width = '90%';
        img.style.height = 'auto';
        img.style.objectFit = 'cover';

        evidenceDiv.appendChild(img);
        workspace.appendChild(evidenceDiv);

        evidenceDiv.addEventListener('click', function () {
            openModal(evidenceDiv);
        });
    }
}

function openModal(evidenceItem) {
    const modal = document.getElementById('evidenceModal');
    const modalContent = document.getElementById('modalContent');

    modal.style.display = "block";

    // Retrieve the image URL from the data attribute
    const imageUrl = evidenceItem.getAttribute('data-image-url');

    // Display the image in the modal
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Evidence Image";
    img.style.width = '100%';
    img.style.height = 'auto';

    // Clear previous content and append the new image
    modalContent.innerHTML = '';
    modalContent.appendChild(img);

    // Ensure the close button event listener is only added once
    const closeButton = document.getElementById("close-button");
    closeButton.removeEventListener('mouseup', closeModal);
    closeButton.addEventListener('mouseup', closeModal);
}

function closeModal() {
    const modal = document.getElementById('evidenceModal');
    modal.style.display = "none";
    modalContent.innerHTML = ''; // Clear modal content
}


document.getElementById('submit').addEventListener('click', function () {
    submitFlag();
});

async function submitFlag() {

    submit.disabled = true;
    const casesRef = databaseRef(database, 'cases');

    const currentSolution = document.getElementById("hash").innerText;

    try {
        const snapshot = await get(child(casesRef, caseKey));
        if (snapshot.exists()) {
            const caseDetails = snapshot.val();

            if (caseDetails.solution == currentSolution) {
                showSuccessModal();
            } else {
                showFailureModal();
            }

        } else {
            alert("No data available");
        }
    } catch (error) {
        console.error(error);
    }
}



document.getElementById("home").addEventListener("click", function () {
    window.location.href = '../HTML/dashboard.html';
});

document.getElementById("successDashboardButton").addEventListener("click", function () {
    document.getElementById("submit").disabled = false;
});

async function showSuccessModal() {
    const modal = document.getElementById('successModal');

    modal.setAttribute('tabindex', '-1');
    modal.focus();

    const isSolved = await isCaseSolved(caseKey);
    document.getElementById("success-title").innerText = "Achievement";
    document.getElementById("check").style.backgroundImage = "url('../Resources/Images/trophy.png')";

    if (isSolved) {
        document.getElementById("points").innerText = "+ 0 points";
        document.getElementById("popup-message").innerText = "Great work! Since you already solved the case, no points will be awarded.";
        document.getElementById("successDashboardButton").innerText = "Dashboard";
        document.getElementById('successDashboardButton').addEventListener('click', async function () {
            try {
                document.getElementById("points").innerText = "+ 0 points";
                window.location.href = '../HTML/dashboard.html';
            } catch (error) {
                alert('An error occurred while updating your points. Please try again.');
            }
        });
    } else {
        document.getElementById("points").innerText = "+ 20 points";
        document.getElementById("popup-message").innerText = "Congratulations, detective! You've successfully solved the case.";
        document.getElementById("successDashboardButton").innerText = "Collect reward";
        document.getElementById('successDashboardButton').addEventListener('click', async function () {
            try {
                await checkAndAddPoints(caseKey);
                window.location.href = '../HTML/dashboard.html';
            } catch (error) {
                alert('An error occurred while updating your points. Please try again.');
            }
        });
    }

    modal.style.display = 'block';


}

async function showFailureModal() {
    const modal = document.getElementById('successModal');

    modal.setAttribute('tabindex', '-1');
    modal.focus();
    document.getElementById("success-title").innerText = "Defeat";
    document.getElementById("popup-message").innerText = "Tough luck, detective. This case has slipped through your fingers.";
    document.getElementById("successDashboardButton").innerText = "Try again";
    document.getElementById("check").style.backgroundImage = "url('../Resources/Images/fail.png')";

    const isSolved = await isCaseSolved(caseKey);
    if (isSolved) {
        document.getElementById("points").innerText = "- 0 points";
        document.getElementById('successDashboardButton').addEventListener('click', async function () {
            try {
                modal.style.display = "none";
            } catch (error) {
                alert('An error occurred while updating your points. Please try again.');
            }
        });
    } else {
        document.getElementById("points").innerText = "- 5 points";
        document.getElementById('successDashboardButton').addEventListener('click', async function () {
            try {
                await checkAndSubtractPoints();
                modal.style.display = "none";
            } catch (error) {
                alert('An error occurred while updating your points. Please try again.');
            }
        });
    }

    modal.style.display = 'block';

}


const submit = document.getElementById('submit');




async function isCaseSolved(caseKey) {
    const auth = getAuth(app);

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
            const solvedCases = userData.solvedCases || [];

            // Check if the caseKey is in the solvedCases array
            return solvedCases.includes(caseKey);
        } else {
            // User data does not exist, so the case cannot be solved yet
            return false;
        }
    } catch (error) {
        console.error('Error checking solved cases:', error);
        throw error;
    }
}

async function checkAndAddPoints(caseKey) {
    const auth = getAuth(app);

    // Wait for the authentication state to initialize
    const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('No user is currently signed in.'));
            }
        }, (error) => {
            reject(error);
        });
    });

    try {
        const isSolved = await isCaseSolved(caseKey);

        if (isSolved) {
            return; // Exit the function without adding points
        }

        const userId = user.uid;
        const userRef = databaseRef(database, `users/${userId}`);

        const snapshot = await get(userRef);
        let userData = snapshot.exists() ? snapshot.val() : {};

        // Update points and add caseKey to solved cases
        const currentPoints = userData.points || 0;
        const newPoints = currentPoints + 20;

        const solvedCases = userData.solvedCases || [];
        solvedCases.push(caseKey); // Add the current caseKey to the solved cases list

        // Update the user's data in the database
        await update(userRef, {
            points: newPoints,
            solvedCases: solvedCases
        });


    } catch (error) {
        console.error('Error in checkAndAddPoints:', error);
        throw error;
    }
}

async function checkAndSubtractPoints() {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (user) {

        const userId = user.uid;
        const userPostRef = databaseRef(database, `users/${userId}`);

        try {
            const snapshot = await get(userPostRef);

            if (snapshot.exists()) {
                // Post exists, subtract 5 points
                const currentPoints = snapshot.val().points || 0;
                const newPoints = currentPoints - 5;

                // Ensure points do not go negative
                if (newPoints < 0) {
                    await update(userPostRef, {
                        points: 0
                    });
                } else {
                    await update(userPostRef, {
                        points: newPoints
                    });
                }
            } else {
                // Post does not exist, create a new one with 0 points
                await set(userPostRef, {
                    points: 0,
                    createdAt: Date.now()
                });
            }
        } catch (error) {
            console.error('Error updating points:', error);
            throw error;
        }
    } else {
        alert('No user is currently signed in.');
    }
}

document.addEventListener("keydown", (event) => {
    const sound = document.getElementById("key-sound");

    // Check if the pressed key is a letter (a-z) or a number (0-9)
    if (/^[a-z0-9]$/i.test(event.key)) {
        sound.currentTime = 0; // Reset to start in case sound is already playing

        // Randomize playback rate between 0.9 and 1.1 for slight pitch variation
        sound.playbackRate = 0.9 + Math.random() * 0.2;

        sound.play();
    }
});

document.getElementById("evidenceModal").addEventListener("click", function (event) {
    const modal = document.getElementById('evidenceModal');
    const modalContent = document.querySelector('.modal-content');

    // Only close the modal if the click happened outside of modalContent
    if (event.target === modal) {
        modal.style.display = "none";
    }
});