/* =========================================================
   CORAL REEF - CODING CHALLENGES
========================================================= */


/*
    Temporary frontend challenge data.

    Later this will come from:

    Django Backend
          ↓
    MySQL Database
          ↓
    Randomized Questions
*/


const challenge = {

    title: "Reverse a String",

    tests: [
        {
            input: "hello",
            expected: "olleh"
        },

        {
            input: "Coral Reef",
            expected: "feeR laroC"
        },

        {
            input: "JavaScript",
            expected: "tpircSavaJ"
        }
    ],

    hint:
        "Try using JavaScript's split(), reverse(), and join() methods."

};


/* ================= ELEMENTS ================= */

const codeEditor =
    document.getElementById("codeEditor");

const runCode =
    document.getElementById("runCode");

const resetCode =
    document.getElementById("resetCode");

const resultPanel =
    document.getElementById("resultPanel");

const resultTitle =
    document.getElementById("resultTitle");

const resultStatus =
    document.getElementById("resultStatus");

const testResults =
    document.getElementById("testResults");

const showHint =
    document.getElementById("showHint");

const hintText =
    document.getElementById("hintText");

const scoreText =
    document.getElementById("scoreText");


/* ================= DEFAULT CODE ================= */

const defaultCode =
`function reverseString(str) {
    // Write your code here

}`;


/* ================= RUN CODE ================= */

runCode.addEventListener("click", () => {

    const userCode =
        codeEditor.value.trim();


    if (!userCode) {

        alert("Please write some code first.");

        return;
    }


    /*
        For this frontend prototype we execute
        the submitted function locally.

        IMPORTANT:
        We will NOT use this approach in the
        final production system.

        The final architecture will use a
        secure backend code execution system.
    */

    try {

        const functionMatch =
            userCode.match(
                /function\s+reverseString\s*\(([^)]*)\)\s*\{([\s\S]*)\}/
            );


        if (!functionMatch) {

            showExecutionError(
                "Could not find the reverseString() function."
            );

            return;
        }


        const functionBody =
            functionMatch[2];


        const reverseString =
            new Function(
                "str",
                functionBody
            );


        evaluateTests(reverseString);


    } catch (error) {

        showExecutionError(
            "Your code contains an error: " +
            error.message
        );

    }

});


/* ================= TEST EVALUATION ================= */

function evaluateTests(reverseString) {

    let passed = 0;

    let resultsHTML = "";


    challenge.tests.forEach((test, index) => {

        let actual;

        let passedTest = false;


        try {

            actual =
                reverseString(test.input);

            passedTest =
                actual === test.expected;

        } catch (error) {

            actual =
                "Runtime Error: " +
                error.message;

        }


        if (passedTest) {

            passed++;

            resultsHTML += `

                <div class="test-result correct">

                    <strong class="correct-text">
                        ✓ Test Case ${index + 1} — Correct
                    </strong>

                    <p>
                        Input:
                        <code>${escapeHTML(test.input)}</code>
                    </p>

                    <p>
                        Expected:
                        <code>${escapeHTML(test.expected)}</code>
                    </p>

                    <p>
                        Your Output:
                        <code>${escapeHTML(actual)}</code>
                    </p>

                </div>

            `;

        } else {

            resultsHTML += `

                <div class="test-result wrong">

                    <strong class="wrong-text">
                        ✕ Test Case ${index + 1} — Wrong
                    </strong>

                    <p>
                        Input:
                        <code>${escapeHTML(test.input)}</code>
                    </p>

                    <p>
                        Expected:
                        <code>${escapeHTML(test.expected)}</code>
                    </p>

                    <p>
                        Your Output:
                        <code>${escapeHTML(String(actual))}</code>
                    </p>

                </div>

            `;
        }

    });


    testResults.innerHTML =
        resultsHTML;


    resultPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });


    /* ================= SCORE ================= */

    const percentage =
        Math.round(
            (passed / challenge.tests.length) * 100
        );


    if (percentage === 100) {

        resultTitle.textContent =
            "All Test Cases Passed 🎉";

        resultStatus.textContent =
            "Correct";

        resultStatus.className =
            "correct-text";

        scoreText.textContent =
            `Excellent! You passed all ${challenge.tests.length} test cases.`;

        showHint.disabled = true;

    } else {

        resultTitle.textContent =
            `${passed}/${challenge.tests.length} Test Cases Passed`;

        resultStatus.textContent =
            "Needs Improvement";

        resultStatus.className =
            "wrong-text";

        scoreText.textContent =
            `You scored ${percentage}%. Review the failed test cases and use your hint.`;

        /*
            Hint becomes available only
            after an incorrect submission.
        */

        showHint.disabled = false;

    }

}


/* ================= HINT ================= */

showHint.addEventListener("click", () => {

    hintText.textContent =
        challenge.hint;

    showHint.textContent =
        "Hint Used ✓";

    showHint.disabled = true;

});


/* ================= RESET ================= */

resetCode.addEventListener("click", () => {

    codeEditor.value =
        defaultCode;

    resultTitle.textContent =
        "Test Results";

    resultStatus.textContent =
        "";

    testResults.innerHTML = `

        <p class="empty-result">
            Run your code to see the test results.
        </p>

    `;

    hintText.textContent =
        "The hint will become available after an incorrect submission.";

    showHint.textContent =
        "Show Hint";

    showHint.disabled = true;

    scoreText.textContent =
        "Solve the challenge to earn your score.";

});


/* ================= ERROR ================= */

function showExecutionError(message) {

    resultTitle.textContent =
        "Execution Error";

    resultStatus.textContent =
        "Error";

    resultStatus.className =
        "wrong-text";


    testResults.innerHTML = `

        <div class="test-result wrong">

            <strong class="wrong-text">
                ✕ Code could not be executed
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

            <p>
                Check your function name and JavaScript syntax.
            </p>

        </div>

    `;


    showHint.disabled = false;

}


/* ================= SECURITY HELPER ================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}