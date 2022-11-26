
const MINE = '💣'
const FLAG = '🚩'
const LIFE = '💚'

var gBoard
var gGame
var gInterval
var gTimeControl = {
    pageLoadTime: Date.now(),
    isTimerOff: true,
    delta: 0
}

gLevel = {
    SIZE: 4, MINES: 2
}

function onInitGame(boardSideZise = 4) {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        explodedMineCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gTimeControl = {
        pageLoadTime: Date.now(),
        isTimerOff: true,
        delta: 0
    }
    gInterval = 0
    onDifficultyPress()
    onCellMarked()
    gBoard = builBoard(gLevel.SIZE)
    renderBoard(gBoard)
    rendLives()
}

function builBoard(boardSideZise = 4) {
    var board = []

    for (var i = 0; i < boardSideZise; i++) {
        board.push([])
        for (var j = 0; j < boardSideZise; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}
//
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) continue
            if (currCell.isMarked) continue
            var currCellCount = cellCountNegs(board, i, j)
            currCell.minesAroundCount = currCellCount
        }
    }
}
//
function cellCountNegs(board, idxI, idxJ) {
    var negsCount = 0

    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue

            var currCell = board[i][j]
            if (currCell.isMine === true) negsCount++
        }
    }
    return negsCount
}

function renderBoard(board) {
    var strHTML = ''
    var cellFilling = ''
    var className = ''
    var color = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]

            color = rendColor(cell.minesAroundCount)
            cellFilling = `<span style="color: ${color}">${cell.minesAroundCount}</span>`

            if (!cell.minesAroundCount) cellFilling = ''
            if (cell.isMine) cellFilling = MINE

            if (cell.isShown) {
                className = 'exposed'
            } else {
                className = 'not-exposed'
                if (cell.isMarked) {
                    className += ` flag`
                    cellFilling = FLAG
                }
            }

            strHTML += `<td class="cell" onclick="onCellClicked(this,${i}, ${j})"><div class="${className} i-${i}-j-${j}">${cellFilling}</div></td>`
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, cellIdxI, cellIdxJ) {
    var elCurrEmptyCell = elCell.querySelector(`.not-exposed`)
    var currCell = gBoard[cellIdxI][cellIdxJ]

    if (gTimeControl.isTimerOff) {

        gTimeControl.pageLoadTime = Date.now()
        gInterval = setInterval(timer, 1000)
    }

    if (!gGame.isOn) return // game is not active
    if (currCell.isMarked) return // this cell is a flag
    if (currCell.isShown) return // this cell already shown
    if (currCell.isMine) { // this cell is a mine
        gGame.explodedMineCount++
        gGame.lives -= 1
        rendLives()
        checkGameOver()
        if (!gGame.lives) {
            revealMines()
            renderBoard(gBoard)
            rendGameOver()
            return
        }
        currCell.isShown = true
        elCurrEmptyCell.style.opacity = '1'
        gGame.shownCount++
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

    expandShown(elCell, cellIdxI, cellIdxJ)

    checkGameOver()
}

function onCellMarked() {
    var elBoard = document.querySelector(`.board`);
    elBoard.addEventListener('contextmenu', (event) => {

        var classes = event.target.classList // class list function return an array
        event.preventDefault()
        rendFlag(event, classes)
    });
}

function checkGameOver() {
    var elgameModal = document.querySelector('.status-text')
    var numOfCells = gBoard.length ** 2

    if ((gGame.markedCount + gGame.shownCount) === numOfCells && gGame.explodedMineCount === 0) {
        elgameModal.innerText = 'Winner!'
        stopTimer()
    }
    else if ((gGame.markedCount + gGame.shownCount) === numOfCells) {
        elgameModal.innerText = 'Game over..'
        stopTimer()
    }
}

function expandShown(elCell, i, j) {

    var negs = cellCountEmptyNegs(gBoard, i, j)
    if (negs.minesIndexs.length > 0) return

    for (var k = 0; k < negs.emtyIndexs.length; k++) {

        var negsI = negs.emtyIndexs[k].i
        var negsj = negs.emtyIndexs[k].j
        var currEmptyCell = gBoard[negsI][negsj]

        var elCurrEmptyCell = document.querySelector(`.i-${negsI}-j-${negsj}`)

        if (!currEmptyCell.isShown && !currEmptyCell.isMarked) {
            gGame.shownCount++
            currEmptyCell.isShown = true
            elCurrEmptyCell.style.opacity = '1'
        }
    }
}

function onDifficultyPress() {
    var elCurrDifficulty = document.querySelector('.difficulty')

    elCurrDifficulty.addEventListener('change', (event) => {
        elCurrDifficulty = Number(event.target.value)
        gLevel.SIZE = elCurrDifficulty
        playAgain(gLevel.SIZE)
    });
}

function playAgain(boardSideZise) {
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = '😃'
    stopTimer()
    onInitGame(boardSideZise)
}

function getMines(board, numOfMines) {
    for (var i = 0; i < numOfMines; i++) {
        var idxI = getRandomInt(0, board.length)
        var idxj = getRandomInt(0, board.length)
        if (board[idxI][idxj].isShown) {
            numOfMines += 1
            continue
        }
        console.log('Mine', idxI, idxj)
        board[idxI][idxj].isMine = true
    }
}

function rendGameOver() {
    stopTimer()
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `Game Over!`
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = '🤯'
    gGame.isOn = false
}

function rendLives() {
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `${LIFE.repeat(gGame.lives)}`
}

function cellCountEmptyNegs(board, idxI, idxJ) {
    var emtyIndexs = []
    var minesIndexs = []

    for (var i = idxI - 1; i <= idxI + 1; i++) {

        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            // if (i === idxI)
            if (j < 0 || j >= board[0].length) continue
            var elCurrDiv = document.querySelector(`.i-${i}-j-${j}`)
            if (elCurrDiv.innerText !== MINE && !gBoard[i][j].isShown) emtyIndexs.push({ i, j })
            if (elCurrDiv.innerText === MINE) minesIndexs.push({ i, j })
        }
    }
    return { emtyIndexs, minesIndexs }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
}

function rendColor(cellFilling) {
    var numberColor = ''

    var colors = ['blue', 'green', 'red', 'darkblue', 'darkgreen', 'darkred']
    for (var x = 1; x <= cellFilling + 1; x++) {
        if (cellFilling === x) {
            numberColor = colors[x - 1]
            break
        }
    }
    return numberColor
}



function timer() {

    if (gGame.isOn) {
        var start = Date.now();
        var elField = document.querySelector('.clockText')
        gTimeControl.delta = start - gTimeControl.pageLoadTime;
        gTimeControl.delta = Math.floor(gTimeControl.delta / 1000); // in seconds
        elField.innerText = `Time: ${gTimeControl.delta}s'`
        gTimeControl.isTimerOff = false;
    }
}

function rendFlag(event, classes) {
    var currCellIndexs = classes[1].split('-') // to get td indexs
    var i = currCellIndexs[1] // array classes: [[i][0][j][0]]
    var j = currCellIndexs[3] // need the second and the last
    var currCell = gBoard[i][j]

    if (currCell.isShown) return

    if (currCell.isMarked) {
        currCell.isMarked = false // MODEL
        gGame.markedCount-- //MODEL

        event.target.innerText = '' // DOM
        classes.remove('flag') // DOM

        if (currCell.isMine) event.target.innerText = MINE //DOM

    } else {
        currCell.isMarked = true // MODEL
        gGame.markedCount++ //MODEL

        event.target.innerText = FLAG // DOM
        classes.add('flag') // DOM
    }
}