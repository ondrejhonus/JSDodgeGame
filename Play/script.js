// Save and retrieve top level
function saveTopLevel(level) {
    localStorage.setItem('topLevel', level.toString());
}

function getTopLevel() {
    const savedLevel = localStorage.getItem('topLevel');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
}

// Increase level when spacebar is pressed
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        let currentLevel = parseInt(document.getElementById('currentLevelDisplay').textContent.split(":")[1].trim(), 10) || 0;
        let topLevel = getTopLevel();

        currentLevel++;

        if (currentLevel > topLevel) {
            topLevel = currentLevel;
            saveTopLevel(topLevel);
            updateLevelDisplay('top', topLevel);
        }

        updateLevelDisplay('current', currentLevel);
    }
});

// Update the <p> element with the specified type and level
function updateLevelDisplay(type, level) {
    const displayElement = document.getElementById(type + 'LevelDisplay');
    displayElement.textContent = (type === 'current' ? 'Current Level: ' : 'Top Level: ') + level;
}

// Initial display
const initialTopLevel = getTopLevel();
updateLevelDisplay('top', initialTopLevel);