// Define variables
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = []; // Store user answers in the original order
let score = 0; // Track the user's score
let maxScore = 0; // Maximum possible score

// Fetch JSON data
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data; // Store the questions
    calculateMaxScore(); // Calculate the maximum possible score
    displayQuestion(); // Display the first question
  })
  .catch(error => console.error('Error loading questions:', error));

// Function to calculate the maximum possible score
function calculateMaxScore() {
  maxScore = questions.reduce((total, question) => {
    return total + (Array.isArray(question.answer) ? 10 : 5);
  }, 0);
}

// Display the first question after pressing the "Start Quiz" button
document.getElementById('start-quiz').addEventListener('click', () => {
  document.getElementById('question-box').style.display = 'block';
  document.getElementById('nav-buttons').style.display = 'flex';
  document.getElementById('start-quiz').style.display = 'none';
  displayQuestion();
});


// Function to display a question
function displayQuestion() {
  const questionBox = document.getElementById('question-box');
  const nextButton = document.getElementById('next-question');
  const skipButton = document.getElementById('skip-question');
  const resultBox = document.getElementById('result-box');

  // Clear previous results
  resultBox.textContent = '';

  if (currentQuestionIndex < questions.length) {
    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];

    // Check if it's a multiple-choice question
    const isMultipleChoice = Array.isArray(currentQuestion.answer);

    // Create question HTML
    questionBox.innerHTML = `
      <h2>${currentQuestion.question}</h2>
      <ul>
        ${currentQuestion.options.map((option, index) => `
          <li>
            <input type="${isMultipleChoice ? 'checkbox' : 'radio'}" 
                   id="option${index}" 
                   name="option" 
                   value="${option}">
            <label for="option${index}">${option}</label>
          </li>
        `).join('')}
      </ul>
    `;

    nextButton.style.display = 'block';
    skipButton.style.display = 'block';

    nextButton.onclick = () => saveAnswer(isMultipleChoice);
    skipButton.onclick = skipQuestion;
  } else {
    // Grade and display results at the end
    gradeQuiz();
  }
}

// Function to save the user's answer
function saveAnswer(isMultipleChoice) {
  const selectedOptions = document.querySelectorAll('input[name="option"]:checked');

  // Collect user answers
  const userResponse = Array.from(selectedOptions).map(option => option.value);
  userAnswers[currentQuestionIndex] = userResponse.length > 0 ? userResponse : null; // Update userAnswers at the current index

  currentQuestionIndex++;
  displayQuestion();
}

// Function to skip the current question
function skipQuestion() {
  // Move the current question to the end of the array
  const skippedQuestion = questions.splice(currentQuestionIndex, 1)[0];
  questions.push(skippedQuestion);

  // Do not increment `currentQuestionIndex` so that the next question is displayed
  displayQuestion();
}

// Function to grade the quiz
function gradeQuiz() {
  const questionBox = document.getElementById('question-box');
  const resultBox = document.getElementById('result-box');
  let resultHTML = '';

  // Reset score
  score = 0;

  // Grade each question
  questions.forEach((question, index) => {
    const correctAnswers = question.answer;
    const userResponse = userAnswers[index] || []; // Default to empty array for skipped questions
    const isMultipleChoice = Array.isArray(correctAnswers);

    // Check correctness
    let isCorrect;
    if (isMultipleChoice) {
      isCorrect = userResponse.length > 0 &&
                  correctAnswers.every(answer => userResponse.includes(answer)) &&
                  userResponse.every(answer => correctAnswers.includes(answer));
    } else {
      isCorrect = userResponse.length > 0 && userResponse[0] === correctAnswers;
    }

    // Update score
    if (isCorrect) {
      score += isMultipleChoice ? 10 : 5;
    }

    // Add question and answers to the results display
    resultHTML += `
      <div>
        <h3>${index + 1}. ${question.question}</h3>
        <p>Your answer: <strong>${userResponse.length > 0 ? userResponse.join(', ') : 'No answer'}</strong></p>
        <p>Correct answer: <strong>${Array.isArray(correctAnswers) ? correctAnswers.join(', ') : correctAnswers}</strong></p>
        <p>${isCorrect ? '<span style="color: green;">Correct!</span>' : '<span style="color: red;">Incorrect.</span>'}</p>
      </div>
      <hr>
    `;
  });

  // Display final results
  questionBox.innerHTML = `<h2>Quiz Completed!</h2>`;
  resultBox.style.display = 'block'; // Ensure result box is visible
  resultBox.innerHTML = `
    <p>Your final score is: <strong>${score}/${maxScore}</strong> points.</p>
    <p>You earned ${((score / maxScore) * 100).toFixed(1)}% of the total points!</p>
    ${resultHTML}
  `;
}
