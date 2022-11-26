
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

function rendLives() {
    var elLIvesText = document.querySelector('.lives')
    elLIvesText.innerText = `${LIFE.repeat(gGame.lives)}`
}

function rendFlag(event, classes, currCell) {
    if (currCell.isShown) return

    if (currCell.isMarked) {
        currCell.isMarked = false // MODEL
        gGame.markedCount-- //MODEL

        event.target.innerText = '' // DOM
        classes.remove('flag') // DOM

        if (currCell.isMine) {
            event.target.innerText = MINE //DOM
            gGame.markedMineCount--
        }
    } else {
        currCell.isMarked = true // MODEL
        gGame.markedCount++ //MODEL

        event.target.innerText = FLAG // DOM
        classes.add('flag') // DOM

        if (currCell.isMine) gGame.markedMineCount++
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

function renderGameStatus() {
    var elgameModal = document.querySelector('.status-text')
    var numOfCells = gBoard.length ** 2

    if ((gGame.markedMineCount + gGame.shownCount) === numOfCells) {
        elgameModal.innerText = 'Winner!'
        return true
    }

    if (!gGame.lives) {
        elbtn = document.querySelector('.playAgain')
        elbtn.innerText = '🤯'

        elgameModal.innerText = 'Game over..'
        return true
    }

    if (gGame.shownCount === 0) elgameModal.innerText = ``
    return false
}

function rendHints() {
    var elLIvesText = document.querySelector('.hints-num')
    elLIvesText.innerText = `${HINT.repeat(gLevel.HINTS)}`
}

function rendSafeClick() {
    var elLIvesText = document.querySelector('.safes-num')
    elLIvesText.innerText = `${SAFE_CLICK.repeat(gGame.safeClick)}`
}