const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const thesaurusUrl = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";
const apiKey = "fea881cf-354b-4aa8-8125-e08e1bc03a17";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");
const wordOfTheDayContainer = document.getElementById("word-of-the-day");

// Define a function to handle the search logic
function searchWord() {
    console.log("Search button clicked"); // Log a message to check if the event listener is triggered
    let inpWord = document.getElementById("inp-word").value;
    fetch(`${url}${inpWord}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log(data); // Log the API response
            if (data.length > 0) {
                let html = '';
                data.forEach(entry => {
                    let partOfSpeech = '';
                    let definition = '';
                    let examples = ''; // New variable for examples

                    entry.meanings.forEach(meaning => {
                        partOfSpeech += `${meaning.partOfSpeech}, `;
                        definition += `${meaning.definitions[0].definition}, `;
                        if (meaning.definitions[0].example) { // Check if example exists
                            examples += `${meaning.definitions[0].example}, `;
                        }
                    });

                    // Fetch synonyms and antonyms
                    fetch(`${thesaurusUrl}${inpWord}?key=${apiKey}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Thesaurus API response was not ok');
                            }
                            return response.json();
                        })
                        .then(thesaurusData => {
                            let synonyms = '';
                            let antonyms = '';

                            if (thesaurusData.length > 0 && thesaurusData[0].meta) {
                                synonyms = thesaurusData[0].meta.syns && thesaurusData[0].meta.syns[0] ? thesaurusData[0].meta.syns[0].slice(0, 5).join(", ") : "No synonyms available";
                                antonyms = thesaurusData[0].meta.ants && thesaurusData[0].meta.ants[0] ? thesaurusData[0].meta.ants[0].slice(0, 5).join(", ") : "No antonyms available";
                            } else {
                                synonyms = "No synonyms available";
                                antonyms = "No antonyms available";
                            }

                            // Construct HTML for this definition
                            html += `
                                <div class="definition">
                                    <div class="word">
                                        <h3>${inpWord}</h3>
                                        <button onclick="playSound('${entry.phonetics[0].audio}')">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                    </div>
                                    <div class="details">
                                        <p>${partOfSpeech}</p>
                                        <p>/${entry.phonetics[0].text}/</p>
                                        <p><strong>Definition:</strong> ${definition}</p>
                                        ${examples ? `<p><strong>Examples:</strong> ${examples}</p>` : ''} <!-- Display examples only if they exist -->
                                        <div class="synonyms">
                                            <p><strong>Synonyms:</strong> ${synonyms}</p>
                                        </div>
                                        <div class="antonyms">
                                            <p><strong>Antonyms:</strong> ${antonyms}</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                            result.innerHTML = html; // Update the result container with synonyms and antonyms
                        })
                        .catch(error => {
                            console.error('Error fetching synonyms and antonyms:', error);
                        });
                });
                // Display all definitions in the result container
                result.innerHTML = html;
                // Set sound source
                if (data[0].phonetics && data[0].phonetics[0] && data[0].phonetics[0].audio) {
                    sound.setAttribute("src", data[0].phonetics[0].audio);
                }

                // Store the searched word
                storeSearchedWord(inpWord); // Add this line
            } else {
                result.innerHTML = `<h3 class="error">Couldn't Find The Word</h3>`;
            }
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
            result.innerHTML = `<h3 class="error">An error occurred while fetching the data</h3>`;
        });
}



async function getRandomWord() {
    const apiUrl = 'https://api.api-ninjas.com/v1/randomword';
    const apiKey = 'bLWlHKdk7wjVvpy9BxOvVw==Hk4TuKDw9lwqj0EG';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.word;
    } catch (error) {
        console.error('Error fetching random word:', error);
        return null;
    }
}






// Function to fetch the word of the day
async function getWordOfTheDay() {
    try {
        // Fetch a random word
        const randomWord = await getRandomWord();
        if (!randomWord) {
            throw new Error('Failed to fetch random word');
        }

        // Return the randomly fetched word as the word of the day
        return randomWord;
    } catch (error) {
        console.error('Error fetching word of the day:', error);
        return null;
    }
}

async function displayWordOfTheDay() {
    try {
        const randomWord = await getRandomWord();
        if (randomWord) {
            const response = await fetch(`${url}${randomWord}`);
            if (!response.ok) {
                throw new Error('Dictionary API response was not ok');
            }
            const data = await response.json();

            if (data.length > 0) {
                const thesaurusData = await fetch(`${thesaurusUrl}${randomWord}?key=${apiKey}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Thesaurus API response was not ok');
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error('Error fetching synonyms and antonyms:', error);
                        return null;
                    });

                let synonyms = '';
                let antonyms = '';

                if (thesaurusData && thesaurusData.length > 0 && thesaurusData[0].meta) {
                    synonyms = thesaurusData[0].meta.syns && thesaurusData[0].meta.syns[0] ? thesaurusData[0].meta.syns[0].slice(0, 5).join(", ") : "No synonyms available";
                    antonyms = thesaurusData[0].meta.ants && thesaurusData[0].meta.ants[0] ? thesaurusData[0].meta.ants[0].slice(0, 5).join(", ") : "No antonyms available";
                } else {
                    synonyms = "No synonyms available";
                    antonyms = "No antonyms available";
                }

                const wordDetails = {
                    word: randomWord,
                    partOfSpeech: data[0].meanings[0].partOfSpeech,
                    phoneticText: data[0].phonetics[0].text,
                    definition: data[0].meanings[0].definitions[0].definition,
                    example: data[0].meanings[0].definitions[0].example || '',
                    synonyms: synonyms,
                    antonyms: antonyms,
                    audio: data[0].phonetics[0].audio
                };

                // Now you can use this object to update the UI accordingly
                updateWordOfTheDayUI(wordDetails);
            } else {
                wordOfTheDayContainer.innerHTML = `<h3 class="error">Couldn't Find Definitions for the Word</h3>`;
            }
        } else {
            wordOfTheDayContainer.innerHTML = "Unable to fetch word of the day.";
        }
    } catch (error) {
        console.error('Error displaying word of the day:', error);
        wordOfTheDayContainer.innerHTML = "An error occurred while fetching the word of the day.";
    }
}

function updateWordOfTheDayUI(wordDetails) {
    const html = `
        <div class="definition">
            <h2 class="word-of-the-day-title">Word of the Day:</h2>
            <div class="word">
                <h3>${wordDetails.word}</h3>
                <button onclick="playSound('${wordDetails.audio}')">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            <div class="details">
                <p>${wordDetails.partOfSpeech}</p>
                <p>/${wordDetails.phoneticText}/</p>
                <p><strong>Definition:</strong> ${wordDetails.definition}</p>
                ${wordDetails.example ? `<p><strong>Examples:</strong> ${wordDetails.example}</p>` : ''}
                <div class="synonyms">
                    <p><strong>Synonyms:</strong> ${wordDetails.synonyms}</p>
                </div>
                <div class="antonyms">
                    <p><strong>Antonyms:</strong> ${wordDetails.antonyms}</p>
                </div>
            </div>
        </div>
    `;
    wordOfTheDayContainer.innerHTML = html;
}











// Function to play sound
function playSound(audioFileName) {
    const audio = new Audio(audioFileName);
    audio.play();
}

// Define a function to store the searched word in local storage
function storeSearchedWord(word) {
    // Get the existing searched words from local storage or initialize an empty array if it doesn't exist
    let searchedWords = JSON.parse(localStorage.getItem('searchedWords')) || [];
    
    // Add the new word to the beginning of the array
    searchedWords.unshift(word);

    // Limit the number of stored words to, for example, 10
    const maxStoredWords = 10;
    searchedWords = searchedWords.slice(0, maxStoredWords);

    // Store the updated array in local storage
    localStorage.setItem('searchedWords', JSON.stringify(searchedWords));
}


// Add an event listener to the search button
btn.addEventListener("click", searchWord);

// Call the function to display word of the day when the page loads
displayWordOfTheDay();


function displayRecentSearchedWords() {
    const recentWordsContainer = document.getElementById("recent-words-container");
    const searchedWords = JSON.parse(localStorage.getItem('searchedWords')) || [];

    if (searchedWords.length === 0) {
        recentWordsContainer.innerHTML = "<p>No recent searches.</p>";
        return;
    }

    // Clear previous content
    recentWordsContainer.innerHTML = "";

    // Create a list to display recent words
    const ul = document.createElement('ul');

    // Loop through searched words and create list items
    searchedWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;

        // Add click event listener to each list item
        li.addEventListener('click', () => {
            // When a word is clicked, perform a search with that word
            document.getElementById("inp-word").value = word;
            searchWord(); // Call the searchWord function to search for the clicked word
        });

        ul.appendChild(li);
    });

    // Append the list to the container
    recentWordsContainer.appendChild(ul);
}

// Call the function to display recent searched words when the page loads
displayRecentSearchedWords();

