// Data Loader strictly for local file compatibility (No CORS)
window.PROBLEM_RAW_DATA = window.PROBLEM_RAW_DATA || {};

// Function to register data
window.addProblemData = function(level, textData) {
    window.PROBLEM_RAW_DATA[level] = textData;
};
