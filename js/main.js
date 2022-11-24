
const MINE = '&#10038'

//  A Matrix containing cell objects: Each cell: 
var gBoard
var gGame
// This is an object by which the board size is set
// (in this case: 4x4 board and how many mines to put)

gLevel = {
    SIZE: 4, MINES: 2
}

// This is an object in which you can keep and update the current game state: 
// isOn: Boolean, when true we let the user play
// shownCount: How many cells are shown
// markedCount: How many cells are marked (with a flag)
// secsPassed: How many seconds passed

function onInitGame() {
    // This is called when page loads

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }

    onDifficultyPress()
    // cellMarked()
    gBoard = builBoard()
    console.log(gBoard)
    renderBoard(gBoard)

}

function builBoard(boardSideZise = 4) {
    // Builds the board
    // Set mines at random locations
    // Call setMinesNegsCount()
    // Return the created board

    var board = []

    for (var i = 0; i < boardSideZise; i++) {
        board.push([])
        for (var j = 0; j < boardSideZise; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: true
            }
        }
    }
    return board
}

function setMinesNegsCount(board) {
    // Count mines around each cell and set the cell's minesAroundCount.
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) continue
            var currCellCount = cellCountNegs(board, i, j)
            currCell.minesAroundCount = currCellCount
            // console.log('currCell.minesAroundCount', currCell.minesAroundCount)
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
    // console.log('negsCount', negsCount)
    return negsCount
}

function renderBoard(board) {
    // Render the board as a <table> to the page
    var strHTML = ''
    var CellFilling = ''
    var className = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {

            var cell = board[i][j]
            if (cell.isMine) CellFilling = MINE
            else CellFilling = cell.minesAroundCount
            if (!CellFilling) CellFilling = ''

            className = (!cell.isShown) ? 'not-exposed' : 'exposed'

            strHTML += `<td class="cell" onclick="onCellClicked(this,${i}, ${j})"><div class="${className} i-${i}-j-${j}">${CellFilling}</div></td>`
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, cellIdxI, cellIdxJ) {

    if (!gGame.isOn) return
    if (cellIdxI < 0 || cellIdxI >= gBoard.length || cellIdxJ < 0 || cellIdxJ >= gBoard[0].length) return
    var currCell = gBoard[cellIdxI][cellIdxJ]
    if (currCell.isShown) return

    if (gGame.shownCount === 0) {
        currCell.isShown = true
        gGame.shownCount++
        getMines(gBoard, 2)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
    }

    currCell.isShown = true
    gGame.shownCount++

    var elCurrEmptyCell = elCell.querySelector(`.not-exposed`)
    elCurrEmptyCell.style.opacity = '1'

    expandShown(elCell, cellIdxI, cellIdxJ)

    if (gBoard[cellIdxI][cellIdxJ].isMine) {
        gGame.lives -= 1
        renderLives()
        if (!gGame.lives) {
            gameOver()
            return
        }
    }

}

function cellMarked() {
    // Called on right click to mark a cell (suspected to be a mine)
    // Search the web (and implement) how to hide the context menu on right click
    const noContext = document.getElementById(`.board`);

    noContext.addEventListener('contextmenu', (e) => {
        console.log(e)
    });
}

function checkGameOver() {
    // Game ends when all mines are marked, and all the other cells are shown
}

function expandShown(elCell, i, j) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
    // NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
    // BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
    var elCurrEmptyCell = elCell.querySelector(`.not-exposed`)
    var emetyCellsIdxs = cellCountEmptyNegs(gBoard, i, j)
    if (!emetyCellsIdxs) return

    for (var k = 0; k < emetyCellsIdxs.length; k++) {
        var negsI = emetyCellsIdxs[k].i
        var negsj = emetyCellsIdxs[k].j
        var currEmptyCell = gBoard[negsI][negsj]
        currEmptyCell.isShown = true
        elCurrEmptyCell = document.querySelector(`.i-${negsI}-j-${negsj}`)
        elCurrEmptyCell.style.opacity = (elCurrEmptyCell.innerText === MINE) ? '0' : '1'
    }
}

function onDifficultyPress() {
    var elCurrDifficulty = document.querySelector('.difficulty')

    elCurrDifficulty.addEventListener('change', (event) => {
        var elCurrDifficulty = Number(event.target.value)

        console.log(elCurrDifficulty)
        playAgain(elCurrDifficulty)
    });
}

function playAgain(boardSideZise) {
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = '😃'
    onInitGame()
}

function getMines(board, numOfMines) {

    for (var i = 0; i < numOfMines; i++) {
        var idxI = getRandomInt(0, board.length)
        var idxj = getRandomInt(0, board.length)
        console.log(idxI, idxj)
        board[idxI][idxj].isMine = true
    }
}

function gameOver() {
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `Game Over!`
    elbtn = document.querySelector('.playAgain')
    elbtn.innerText = '🤯'
    gGame.isOn = false
}

function win() {

}

function renderLives() {
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `Lives: ${gGame.lives}`
}

function cellCountEmptyNegs(board, idxI, idxJ) {
    var emtyIndexs = []
    var mineNegs = []

    for (var i = idxI - 1; i <= idxI + 1; i++) {

        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue
            var elCurrDiv = document.querySelector(`.i-${i}-j-${j}`)
            if (elCurrDiv.innerText === '✶') mineNegs.push({ i, j })
            else emtyIndexs.push({ i, j })
        }
    }
    return emtyIndexs
}



