
const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gGame
var interval
var timeControl = {
    pageLoadTime: Date.now(),
    isTimerOff: true,
    delta: 0
}

gLevel = {
    MINES: 2
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

    timeControl = {
        pageLoadTime: Date.now(),
        isTimerOff: true,
        delta: 0
    }
    interval = 0
    onDifficultyPress()
    onCellMarked()
    gBoard = builBoard(boardSideZise)
    renderBoard(gBoard)
    renderLives()
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

    if (timeControl.isTimerOff) {

        timeControl.pageLoadTime = Date.now()
        interval = setInterval(timer, 1000)
    }

    if (!gGame.isOn) return // game is not active
    if (currCell.isMarked) return // this cell is a flag
    if (currCell.isShown) return // this cell already shown
    if (currCell.isMine) { // this cell is a mine
        gGame.explodedMineCount++
        gGame.lives -= 1
        renderLives()
        checkGameOver()
        if (!gGame.lives) {
            revealMines()
            renderBoard(gBoard)
            gameOver()
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
        event.preventDefault()

        var classes = event.target.classList // class list function return an array
        console.log(event.target)
        var currCellIndexs = classes[1].split('-') // to get td indexs
        var i = currCellIndexs[1] // array classes: [[i][0][j][0]]
        var j = currCellIndexs[3] // need the second and the last
        var currCell = gBoard[i][j]

        if (currCell.isShown) return

        if ((classes.contains('flag'))) {
            currCell.isMarked = false
            classes.remove('flag')
        }
        else {
            currCell.isMarked = true
            classes.add('flag')
        }

        if (classes.contains('flag')) { // after the shift check if flag
            event.target.innerText = FLAG
            gGame.markedCount++
            gBoard[i][j].isMarked = true

        } else if (gBoard[currCellIndexs[1]][currCellIndexs[3]].isMine) {
            event.target.innerText = MINE
            gGame.markedCount--
            gBoard[i][j].isMarked = false

        } else {
            (event.target.innerText = '')
            gGame.markedCount--
            gBoard[i][j].isMarked = false
        }

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

        playAgain(elCurrDifficulty)
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
    console.log(' ')
}

function gameOver() {
    stopTimer()
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `Game Over!`
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = '🤯'
    gGame.isOn = false
}

function renderLives() {
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `Lives: ${gGame.lives}`
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

function stopTimer() {
    clearInterval(interval);
}

function timer() {

    if (gGame.isOn) {
        var start = Date.now();
        var elField = document.querySelector('.clockText')
        timeControl.delta = start - timeControl.pageLoadTime;
        timeControl.delta = Math.floor(timeControl.delta / 1000); // in seconds
        elField.innerText = `Time: ${timeControl.delta}s'`
        timeControl.isTimerOff = false;
    }
}