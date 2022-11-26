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
    console.log(board)
    return board
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

function expandShown(i, j) {

    var negs = cellCountEmptyNegs(gBoard, i, j) // if cell have mine negs return
    if (negs.minesIndexs.length > 0) return

    for (var k = 0; k < negs.emtyIndexs.length; k++) { // loop on empty cell locations
        var negsI = negs.emtyIndexs[k].i
        var negsj = negs.emtyIndexs[k].j
        var currEmptyCell = gBoard[negsI][negsj]

        var elCurrEmptyCell = document.querySelector(`.i-${negsI}-j-${negsj}`)


        if (!currEmptyCell.isShown && !currEmptyCell.isMarked) { // if cell not shown or marked open him
            gGame.shownCount++
            currEmptyCell.isShown = true
            elCurrEmptyCell.style.opacity = '1'
        }
        if (currEmptyCell.minesAroundCount === 0) expandShown(negsI, negsj)
    }
}

function cellCountEmptyNegs(board, idxI, idxJ) {
    var emtyIndexs = []
    var minesIndexs = []

    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue

            var elCurrDiv = document.querySelector(`.i-${i}-j-${j}`)

            if (elCurrDiv.innerText !== MINE && !gBoard[i][j].isShown) emtyIndexs.push({ i, j })
            if (gBoard[i][j] === MINE) minesIndexs.push({ i, j })
        }
    }
    return { emtyIndexs, minesIndexs }
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

function exposeNegs(idxI, idxJ) {
    var currCell = null
    var exposedCells = []

    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            // if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var elCurrCell = document.querySelector(`.i-${i}-j-${j}`)
            currCell = gBoard[i][j]

            if (currCell.isShown || currCell.isMarked) continue
            elCurrCell.style.opacity = '1'
            exposedCells.push(elCurrCell)
        }
    }
    setTimeout(() => {
        for (var x = 0; x < exposedCells.length; x++) {
            exposedCells[x].style.opacity = '0'
        }
    }, "1000")

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

function searchEmptyCell() {
    var emptyCellsLocation = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            currCell = gBoard[i][j]
            if (currCell.isMine || currCell.isMarked || currCell.isShown) continue
            emptyCellsLocation.push({ i, j })
        }
    }
    return emptyCellsLocation
}

