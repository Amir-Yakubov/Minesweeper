const MINE = '💣'
const FLAG = '🚩'
const LIFE = '💚'
const PLAYER = '😃'
const HINT = '💡'
const SAFE_CLICK = '🚨'

var gBoard
var gGame
var gInterval
var gTimeControl = {
    pageLoadTime: Date.now(),
    isTimerOff: true,
    delta: 0
}

gLevel = {
    SIZE: 4, MINES: 2, HINTS: 3
}

var gIsMarkEventAlowed = true
var gIsChangeDifEventAlowed = true
var gIsHintOn

function onInitGame(boardSideZise = 4) {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        markedMineCount: 0,
        secsPassed: 0,
        safeClick: 3,
        lives: 3
    }
    gTimeControl = {
        pageLoadTime: Date.now(),
        isTimerOff: true,
        delta: 0
    }
    gInterval = 0

    pageLoad()
    onDifficultyChange()
    onCellMarked()
    gBoard = builBoard(gLevel.SIZE)
    renderBoard(gBoard)
    rendLives()
    rendHints()
}

function onCellClicked(elCell, cellIdxI, cellIdxJ) {
    var elCurrEmptyCell = elCell.querySelector(`.not-exposed`)
    var currCell = gBoard[cellIdxI][cellIdxJ]

    if (gIsHintOn) {
        exposeNegs(cellIdxI, cellIdxJ)
        gLevel.HINTS--
        rendHints()
        var elHintBtn = document.querySelector('.hint')
        elHintBtn.classList.remove('light-on')
        gIsHintOn = false
        renderBoard()
        return
    }

    if (gTimeControl.isTimerOff) {
        gTimeControl.pageLoadTime = Date.now()
        gInterval = setInterval(timer, 1000)
    }

    if (!gGame.isOn) return
    if (currCell.isMarked) return
    if (currCell.isShown) return

    if (currCell.isMine) {
        gGame.lives--
        rendLives()

        if (checkGameOver()) {
            return
        }

        currCell.isShown = true
        gGame.shownCount++
        elCurrEmptyCell.style.opacity = '1'
        checkGameOver()
        return
    }

    if (gGame.shownCount === 0) {
        currCell.isShown = true
        getMines(gBoard, gLevel.MINES)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
    }

    currCell.isShown = true
    elCurrEmptyCell.style.opacity = '1'
    gGame.shownCount++
    console.log('cell clicked count', gGame.shownCount)

    if (currCell.minesAroundCount === 0) expandShown(cellIdxI, cellIdxJ)
    checkGameOver()
}

function onCellMarked() {
    var elBoard = document.querySelector(`.board`);
    elBoard.addEventListener('contextmenu', (event) => {
        event.preventDefault()
        if (!gGame.isOn) return
        if (gIsMarkEventAlowed) {

            var classes = event.target.classList // class list function return an array
            if (classes.length < 1) return

            var currCell = getCellFromClass(classes)
            rendFlag(event, classes, currCell)
            if (currCell.isMine)
                console.log('gGame.markedMineCount++', gGame.markedMineCount)
            checkGameOver()

            gIsMarkEventAlowed = false
            if (gLevel.SIZE < 5) gIsMarkEventAlowed = true
        } else gIsMarkEventAlowed = true
    });

}

function onHintClick(btnElement) {
    if (!gGame.shownCount) return
    if (!gLevel.HINTS) return

    var classes = btnElement.classList
    if (classes[1] === 'light-on') {
        classes.remove('light-on')
    } else {
        gIsHintOn = true // in this position ocCellClick know to reveal for 1 sec only
        classes.add('light-on')
    }
}

function onSafeClick() {
    if (!gGame.shownCount) return
    if (!gGame.safeClick) return

    var emptyCellsLocation = searchEmptyCell()
    var randLocation = getRandomInt(0, emptyCellsLocation.length)
    var randEmptyLocation = emptyCellsLocation[randLocation]

    var elCurrCell = document.querySelector(`.i-${randEmptyLocation.i}-j-${randEmptyLocation.j}`)
    elCurrCell.style.opacity = '1'

    setTimeout(() => {
        elCurrCell.style.opacity = '0'
    }, "1500")
    gGame.safeClick--
    rendSafeClick()
}

function onDifficultyChange() {
    var elCurrDifficulty = document.querySelector('.difficulty')
    elCurrDifficulty.addEventListener('change', (event) => {
        if (gIsChangeDifEventAlowed) {
            elCurrDifficulty = Number(event.target.value)
            gLevel.SIZE = elCurrDifficulty
            gLevel.MINES = elCurrDifficulty

            playAgain(gLevel.SIZE)
            gIsChangeDifEventAlowed = false
        } else gIsChangeDifEventAlowed = true
    });
}

function checkGameOver() {
    var isGameOver = renderGameStatus()
    if (!isGameOver) return false
    else {
        gGame.isOn = false
        clearInterval(gInterval)
        if (gGame.lives > 0) {
            var userName = localStorage.getItem('Name');
            var record = localStorage.getItem(userName);

            // If no record, take 'delta' = 0
            if (record === null) {
                localStorage.setItem(userName, gTimeControl.delta);
            }
            // If the result is faster than the record put it into storage
            if (gTimeControl.delta < record) {
                localStorage.setItem(userName, gTimeControl.delta);
            }
        }
        return true
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
}

function playAgain(boardSideZise) {
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = PLAYER

    clearInterval(gInterval)
    var elField = document.querySelector('.clockText')
    elField.innerText = `Time:`

    onInitGame(boardSideZise)
    renderGameStatus()
    gIsMarkEventAlowed = true
}

function timer() {

    if (gGame.isOn) {
        if (gGame.shownCount < 1 && gGame.markedCount < 1) return
        var start = Date.now();
        var elField = document.querySelector('.clockText')
        gTimeControl.delta = start - gTimeControl.pageLoadTime;
        gTimeControl.delta = Math.floor(gTimeControl.delta / 1000); // in seconds
        elField.innerText = `Time: ${gTimeControl.delta}`
        gTimeControl.isTimerOff = false;
    }
}

function getCellFromClass(classes) {
    var classIdx = 1
    var currCellIndexs = classes[classIdx].split('-') // to get td indexs
    if (currCellIndexs === 'flag' || !currCellIndexs) currCellIndexs = classes[classIdx + 1].split('-') // to get td indexs
    var i = currCellIndexs[1] // array classes: [[i][0][j][0]]
    var j = currCellIndexs[3] // need the second and the last
    var currCell = gBoard[i][j]
    return currCell
}

function pageLoad() {
    var userName = localStorage.getItem('Name')

    if (!userName) {
        userName = prompt('Name?')
        localStorage.setItem('Name', userName)
    }
    rendUserName(userName);
    showRecord();
}

function rendUserName(userName) {
    var userNameField = document.querySelector('.userNameField')
    userNameField.innerText = `Player: ${userName}`
}

function showRecord() {
    var userRecordField = document.querySelector('.recordField')
    var userName = localStorage.getItem('Name')
    var record = localStorage.getItem(userName)
    if (!record) record = 0;
    userRecordField.innerText = `Best Time: ${record}⏲️`
}

function changeUser() {
    userName = prompt('Name?')
    if (!userName) userName = 'guest'
    localStorage.setItem('Name', userName)
    rendUserName(userName)
    showRecord()
    playAgain()
}

