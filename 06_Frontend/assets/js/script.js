/* =========================================================
   SKILL COMPATIBILITY SCORE
   ========================================================= */

const learningSkills = document.querySelectorAll(
    "#learningSkills .skill-option"
);

const partnerSkills = document.querySelectorAll(
    "#partnerSkills .skill-option"
);


// Select / unselect skills
function setupSkillSelection(buttons) {

    buttons.forEach(button => {

        button.addEventListener("click", () => {
            button.classList.toggle("selected");
        });

    });

}

setupSkillSelection(learningSkills);
setupSkillSelection(partnerSkills);


// Calculate compatibility
const calculateMatchButton =
    document.getElementById("calculateMatch");

calculateMatchButton.addEventListener("click", () => {

    const learning = [...learningSkills]
        .filter(button => button.classList.contains("selected"))
        .map(button => button.dataset.skill);

    const partner = [...partnerSkills]
        .filter(button => button.classList.contains("selected"))
        .map(button => button.dataset.skill);


    // Validation
    const validationMessage =
        document.getElementById("matchValidationMessage");

    if (learning.length === 0 || partner.length === 0) {

        if (validationMessage) {
            validationMessage.textContent =
                "Please select at least one skill from both sections.";
            validationMessage.classList.add("show");
        }

        return;
    }

    if (validationMessage) {
        validationMessage.textContent = "";
        validationMessage.classList.remove("show");
    }


    // Find common skills
    const matched = learning.filter(skill =>
        partner.includes(skill)
    );


    // Calculate score
    const score = Math.round(
        (matched.length / learning.length) * 100
    );


    // Result elements
    const result =
        document.getElementById("matchResult");

    const scoreValue =
        document.getElementById("scoreValue");

    const matchTitle =
        document.getElementById("matchTitle");

    const matchMessage =
        document.getElementById("matchMessage");

    const matchedSkills =
        document.getElementById("matchedSkills");


    // Display score
    scoreValue.textContent = `${score}%`;


    // Title and message
    if (score >= 80) {

        matchTitle.textContent =
            "Excellent Compatibility! 🎯";

        matchMessage.textContent =
            "This person is highly compatible with your learning goals.";

    } else if (score >= 50) {

        matchTitle.textContent =
            "Good Compatibility 👍";

        matchMessage.textContent =
            "You have several matching skills and can learn together.";

    } else if (score > 0) {

        matchTitle.textContent =
            "Partial Compatibility";

        matchMessage.textContent =
            "There are some matching skills, but more suitable partners may exist.";

    } else {

        matchTitle.textContent =
            "Low Compatibility";

        matchMessage.textContent =
            "No matching teaching skills were found for your selected goals.";
    }


    // Show matched skills
    matchedSkills.innerHTML = "";

    matched.forEach(skill => {

        const skillTag =
            document.createElement("span");

        skillTag.textContent = skill;

        matchedSkills.appendChild(skillTag);

    });


    // Show result
    result.classList.add("show");

});

/* =========================================================
   SKILL VERIFICATION QUIZ
   ========================================================= */


/*
    Temporary frontend question bank.

    Later:
    Django → MySQL → Questions
    JavaScript → receives randomized questions
*/

const questionBank = {

    HTML: [
       {
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: "<a>",
    hint: "Think about the HTML element used to create clickable links."
},
        {
    question: "Which tag is used for the largest heading?",
    options: ["<h6>", "<heading>", "<h1>", "<head>"],
    answer: "<h1>",
    hint: "HTML heading levels range from h1 to h6."
},
       {
    question: "Which HTML element is used to display an image?",
    options: ["<image>", "<img>", "<src>", "<picture>"],
    answer: "<img>",
    hint: "The element name is a short three-letter abbreviation."
},
       {
    question: "Which attribute specifies an image path?",
    options: ["href", "src", "link", "path"],
    answer: "src",
    hint: "Think of the attribute that represents the source of the image."
}
    ],

    CSS: [
        {
            question: "Which property changes text color?",
            options: ["font-color", "text-color", "color", "foreground"],
            answer: "color"
        },
        {
            question: "Which property is used to change the background color?",
            options: ["background-color", "bgcolor", "background", "color"],
            answer: "background-color"
        },
        {
            question: "Which CSS layout system is commonly used for one-dimensional layouts?",
            options: ["Grid", "Flexbox", "Float", "Position"],
            answer: "Flexbox"
        },
        {
            question: "Which property controls the space inside an element?",
            options: ["margin", "padding", "spacing", "border"],
            answer: "padding"
        },
        {
            question: "Which symbol represents a class selector?",
            options: ["#", ".", "*", "&"],
            answer: "."
        }
    ],

    JavaScript: [
        {
            question: "Which keyword declares a block-scoped variable?",
            options: ["var", "let", "define", "variable"],
            answer: "let"
        },
        {
            question: "Which method selects an element by its ID?",
            options: [
                "getElementById()",
                "selectById()",
                "queryId()",
                "findId()"
            ],
            answer: "getElementById()"
        },
        {
            question: "Which symbol is used for strict equality?",
            options: ["=", "==", "===", "!="],
            answer: "==="
        },
        {
            question: "Which method adds an item to the end of an array?",
            options: ["add()", "push()", "append()", "insert()"],
            answer: "push()"
        },
        {
            question: "Which keyword is used to define a function?",
            options: ["function", "def", "func", "method"],
            answer: "function"
        }
    ],

    Python: [
        {
            question: "Which symbol is used to create a comment in Python?",
            options: ["//", "#", "/*", "--"],
            answer: "#"
        },
        {
            question: "Which function displays output?",
            options: ["display()", "output()", "print()", "show()"],
            answer: "print()"
        },
        {
            question: "Which data type stores key-value pairs?",
            options: ["List", "Tuple", "Dictionary", "Set"],
            answer: "Dictionary"
        },
        {
            question: "Which keyword defines a function?",
            options: ["function", "def", "func", "define"],
            answer: "def"
        },
        {
            question: "Which symbol is used for exponentiation?",
            options: ["^", "**", "//", "%%"],
            answer: "**"
        }
    ]

};


/* ---------------------------------------------------------
   Elements
   --------------------------------------------------------- */

const verificationSkills =
    document.querySelectorAll(".verification-skill");

const startQuiz =
    document.getElementById("startQuiz");

const skillSelection =
    document.getElementById("skillSelection");

const quizContainer =
    document.getElementById("quizContainer");

const verificationResult =
    document.getElementById("verificationResult");

const questionText =
    document.getElementById("questionText");

const answerOptions =
    document.getElementById("answerOptions");

const nextQuestion =
    document.getElementById("nextQuestion");

const questionNumber =
    document.getElementById("questionNumber");

const quizSkill =
    document.getElementById("quizSkill");

const quizProgress =
    document.getElementById("quizProgress");

const verificationScore =
    document.getElementById("verificationScore");

const verificationTitle =
    document.getElementById("verificationTitle");

const verificationMessage =
    document.getElementById("verificationMessage");

const retakeQuiz =
    document.getElementById("retakeQuiz");


/* ---------------------------------------------------------
   Skill Selection
   --------------------------------------------------------- */

let selectedSkill = null;

verificationSkills.forEach(button => {

    button.addEventListener("click", () => {

        verificationSkills.forEach(btn =>
            btn.classList.remove("selected")
        );

        button.classList.add("selected");

        selectedSkill = button.dataset.skill;

        startQuiz.disabled = false;
    });

});


/* ---------------------------------------------------------
   Quiz Variables
   --------------------------------------------------------- */

let questions = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;

let userAnswers = [];


/* ---------------------------------------------------------
   Shuffle Questions
   --------------------------------------------------------- */

function shuffleArray(array) {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}


/* ---------------------------------------------------------
   Start Quiz
   --------------------------------------------------------- */

startQuiz.addEventListener("click", () => {

    questions =
        shuffleArray(questionBank[selectedSkill]);

    currentQuestion = 0;
    score = 0;
    userAnswers = [];

    skillSelection.style.display = "none";
    quizContainer.style.display = "block";

    loadQuestion();
});


/* ---------------------------------------------------------
   Load Question
   --------------------------------------------------------- */

function loadQuestion() {

    const question = questions[currentQuestion];

    selectedAnswer = null;

    nextQuestion.disabled = true;

    questionNumber.textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    quizSkill.textContent =
        selectedSkill;

    quizProgress.style.width =
        `${((currentQuestion + 1) / questions.length) * 100}%`;

    questionText.textContent =
        question.question;

    answerOptions.innerHTML = "";


    question.options.forEach(option => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "answer-option";

        button.textContent =
            option;


        button.addEventListener("click", () => {

            document
                .querySelectorAll(".answer-option")
                .forEach(btn =>
                    btn.classList.remove("selected")
                );

            button.classList.add("selected");

            selectedAnswer = option;

            nextQuestion.disabled = false;
        });


        answerOptions.appendChild(button);

    });

}


/* ---------------------------------------------------------
   Next Question
   --------------------------------------------------------- */

nextQuestion.addEventListener("click", () => {

   const question =
    questions[currentQuestion];


/*
    Save the user's answer so we can show
    correct/wrong details after the test.
*/

userAnswers.push({
    question: question.question,
    selectedAnswer: selectedAnswer,
    correctAnswer: question.answer,
    hint: question.hint,
    isCorrect: selectedAnswer === question.answer
});


if (selectedAnswer === question.answer) {
    score++;
}


    currentQuestion++;


    if (currentQuestion < questions.length) {

        loadQuestion();

    } else {

        showVerificationResult();

    }

});


/* ---------------------------------------------------------
   Result
   --------------------------------------------------------- */

function showVerificationResult() {

    quizContainer.style.display = "none";

    verificationResult.classList.add("show");


    const percentage =
        Math.round(
            (score / questions.length) * 100
        );


    verificationScore.textContent =
        `${percentage}%`;


    if (percentage >= 80) {

        verificationTitle.textContent =
            "MCQ Assessment Passed! ✅";

        verificationMessage.textContent =
            `You scored ${score} out of ${questions.length}. Review your answers below and continue to the coding challenge.`;

    } else if (percentage >= 60) {

        verificationTitle.textContent =
            "Good Attempt 👍";

        verificationMessage.textContent =
            `You scored ${score} out of ${questions.length}. Review the incorrect answers before continuing.`;

    } else {

        verificationTitle.textContent =
            "Keep Learning 📚";

        verificationMessage.textContent =
            `You scored ${score} out of ${questions.length}. Review the answers and try again to improve your score.`;
    }


    /*
        Remove old review if the quiz is taken again.
    */

    const oldReview =
        document.getElementById("answerReview");

    if (oldReview) {
        oldReview.remove();
    }


    /*
        Create answer review section.
    */

    const review =
        document.createElement("div");

    review.id =
        "answerReview";

    review.className =
        "answer-review";


    const reviewTitle =
        document.createElement("h3");

    reviewTitle.textContent =
        "Review Your Answers";

    review.appendChild(reviewTitle);


    /*
        Display every question.
    */

    userAnswers.forEach((item, index) => {

        const answerCard =
            document.createElement("div");

        answerCard.className =
            item.isCorrect
                ? "answer-review-card correct"
                : "answer-review-card wrong";


        const status =
            document.createElement("div");

        status.className =
            "answer-status";

        status.textContent =
            item.isCorrect
                ? `✓ Question ${index + 1} — Correct`
                : `✕ Question ${index + 1} — Wrong`;

        answerCard.appendChild(status);


        const question =
            document.createElement("p");

        question.className =
            "review-question";

        question.textContent =
            item.question;

        answerCard.appendChild(question);


        const yourAnswer =
            document.createElement("p");

        yourAnswer.innerHTML =
            `<strong>Your answer:</strong> ${escapeReviewHTML(item.selectedAnswer)}`;

        answerCard.appendChild(yourAnswer);


        /*
            Show correct answer only for wrong answers.
        */

        if (!item.isCorrect) {

            const correctAnswer =
                document.createElement("p");

            correctAnswer.innerHTML =
                `<strong>Correct answer:</strong> ${escapeReviewHTML(item.correctAnswer)}`;

            answerCard.appendChild(correctAnswer);


            /*
                One hint for the incorrect question.
            */

            const hint =
                document.createElement("div");

            hint.className =
                "review-hint";

            hint.innerHTML =
                `<strong>💡 Hint:</strong> ${escapeReviewHTML(item.hint)}`;

            answerCard.appendChild(hint);
        }


        review.appendChild(answerCard);

    });


    verificationResult.appendChild(review);


    /*
        Coding challenge button.
    */

    const oldCodingButton =
        document.getElementById("codingChallengeBtn");

    if (oldCodingButton) {
        oldCodingButton.remove();
    }


    const codingButton =
        document.createElement("button");

    codingButton.id =
        "codingChallengeBtn";

    codingButton.type =
        "button";

    codingButton.className =
        "retake-btn";

    codingButton.textContent =
        "Continue to Coding Challenge →";


    codingButton.addEventListener("click", () => {

        window.location.href =
            "coding-challenges/coding-challenges.html";

    });


    verificationResult.appendChild(codingButton);

}


/* ---------------------------------------------------------
   Retake
   --------------------------------------------------------- */

retakeQuiz.addEventListener("click", () => {

    verificationResult.classList.remove("show");

    skillSelection.style.display = "block";

    quizContainer.style.display = "none";

});

function escapeReviewHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}