const boardElement = document.getElementById("board");
const moveNumberElement = document.getElementById("moveNumber");
const turnElement = document.getElementById("turn");
const ruleSetElement = document.getElementById("ruleSet");
const rulesElement = document.getElementById("rules");
const messageElement = document.getElementById("message");
const resetButton = document.getElementById("resetButton");


/*
====================================================
WRONG CHESS RULES
====================================================

Normal piece -> movement it is ALLOWED to make

Queen  -> Pawn
King   -> Knight
Rook   -> Bishop
Bishop -> Rook
Knight -> King
Pawn   -> Queen
*/

const baseMapping = {
    queen: "pawn",
    king: "knight",
    rook: "bishop",
    bishop: "rook",
    knight: "king",
    pawn: "queen"
};


// Unicode chess pieces
const symbols = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};


let board = [];
let selectedSquare = null;
let currentTurn = "white";
let moveNumber = 0;


/*
====================================================
CREATE BOARD
====================================================
*/

function createBoard() {

    board = [

        // BLACK PIECES
        [
            createPiece("black", "rook"),
            createPiece("black", "knight"),
            createPiece("black", "bishop"),
            createPiece("black", "queen"),
            createPiece("black", "king"),
            createPiece("black", "bishop"),
            createPiece("black", "knight"),
            createPiece("black", "rook")
        ],

        [
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn")
        ],

        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],

        [
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn")
        ],

        [
            createPiece("white", "rook"),
            createPiece("white", "knight"),
            createPiece("white", "bishop"),
            createPiece("white", "queen"),
            createPiece("white", "king"),
            createPiece("white", "bishop"),
            createPiece("white", "knight"),
            createPiece("white", "rook")
        ]
    ];
}


/*
====================================================
CREATE PIECE
====================================================
*/

function createPiece(color, type) {

    return {
        color: color,
        type: type
    };
}


/*
====================================================
GET CURRENT RULE SET
====================================================

Every 8 moves, we rotate the wrong rules.

Example:

RULE SET 1
Queen -> Pawn
King -> Knight
Rook -> Bishop
...

After move 8:

RULE SET 2
Queen -> Knight
King -> Bishop
Rook -> Rook
...

The mappings keep changing.
====================================================
*/

function getCurrentMapping() {

    const pieces = [
        "pawn",
        "knight",
        "bishop",
        "rook",
        "queen",
        "king"
    ];

    const movements = [
        "queen",
        "pawn",
        "king",
        "bishop",
        "rook",
        "knight"
    ];

    const ruleSet = Math.floor(moveNumber / 8);

    let mapping = {};

    pieces.forEach((piece, index) => {

        let movementIndex =
            (index + ruleSet) % movements.length;

        mapping[piece] = movements[movementIndex];

    });

    return mapping;
}


/*
====================================================
DISPLAY RULES
====================================================
*/

function displayRules() {

    const mapping = getCurrentMapping();

    rulesElement.innerHTML = "";

    const displayNames = {
        queen: "Queen",
        king: "King",
        rook: "Rook",
        bishop: "Bishop",
        knight: "Knight",
        pawn: "Pawn"
    };

    Object.keys(mapping).forEach(piece => {

        const div = document.createElement("div");

        div.className = "rule";

        div.innerHTML =
            `<b>${displayNames[piece]}</b>
             → ${displayNames[mapping[piece]]}`;

        rulesElement.appendChild(div);
    });

    ruleSetElement.textContent =
        Math.floor(moveNumber / 8) + 1;
}


/*
====================================================
DRAW BOARD
====================================================
*/

function drawBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            const piece = board[row][col];

            if (piece) {

                square.textContent =
                    symbols[piece.color][piece.type];

                square.classList.add(
                    piece.color === "white"
                        ? "white-piece"
                        : "black-piece"
                );
            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {

                square.classList.add("selected");
            }

            square.addEventListener("click", () => {
                handleSquareClick(row, col);
            });

            boardElement.appendChild(square);
        }
    }
}


/*
====================================================
HANDLE CLICK
====================================================
*/

function handleSquareClick(row, col) {

    const piece = board[row][col];

    // Nothing selected yet
    if (!selectedSquare) {

        if (!piece) {
            return;
        }

        if (piece.color !== currentTurn) {

            messageElement.textContent =
                "That's not your piece!";

            return;
        }

        selectedSquare = {
            row: row,
            col: col
        };

        messageElement.textContent =
            "Choose where to move it.";

        drawBoard();

        return;
    }


    // Clicking same square cancels selection
    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        selectedSquare = null;

        messageElement.textContent =
            `${capitalize(currentTurn)}'s turn`;

        drawBoard();

        return;
    }


    // Try to move
    if (
        isValidMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        )
    ) {

        makeMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        );

    } else {

        messageElement.textContent =
            "❌ That's an illegal WRONG move!";

        selectedSquare = null;

        drawBoard();
    }
}


/*
====================================================
HIGHLIGHT VALID MOVES
====================================================
*/

function highlightValidMoves() {

    const squares =
        boardElement.querySelectorAll(".square");

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            if (
                isValidMove(
                    selectedSquare.row,
                    selectedSquare.col,
                    row,
                    col
                )
            ) {

                const index = row * 8 + col;

                squares[index].classList.add("valid");
            }
        }
    }
}


/*
====================================================
VALIDATE MOVE
====================================================
*/

function isValidMove(fromRow, fromCol, toRow, toCol) {

    if (
        fromRow === toRow &&
        fromCol === toCol
    ) {
        return false;
    }

    const piece = board[fromRow][fromCol];

    if (!piece) {
        return false;
    }

    // Can't move onto own piece
    const target = board[toRow][toCol];

    if (
        target &&
        target.color === piece.color
    ) {
        return false;
    }

    const dx = toCol - fromCol;
    const dy = toRow - fromRow;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const mapping = getCurrentMapping();

    const movementType =
        mapping[piece.type];


    /*
    ================================================
    WRONG MOVEMENT TYPES
    ================================================
    */

    // QUEEN movement
    if (movementType === "queen") {

        if (
            dx === 0 ||
            dy === 0 ||
            absX === absY
        ) {

            return pathIsClear(
                fromRow,
                fromCol,
                toRow,
                toCol
            );
        }

        return false;
    }


    // ROOK movement
    if (movementType === "rook") {

        if (
            dx === 0 ||
            dy === 0
        ) {

            return pathIsClear(
                fromRow,
                fromCol,
                toRow,
                toCol
            );
        }

        return false;
    }


    // BISHOP movement
    if (absX === absY) {

        return pathIsClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // KNIGHT movement
    if (
        (absX === 2 && absY === 1) ||
        (absX === 1 && absY === 2)
    ) {

        return true;
    }


    // KING movement
    if (
        absX <= 1 &&
        absY <= 1
    ) {

        return true;
    }


    // PAWN movement
    if (movementType === "pawn") {

        const direction =
            piece.color === "white"
                ? -1
                : 1;

        // Normal pawn move
        if (
            dx === 0 &&
            dy === direction &&
            !target
        ) {
            return true;
        }

        // Pawn capture
        if (
            absX === 1 &&
            dy === direction &&
            target
        ) {
            return true;
        }

        return false;
    }


    return false;
}


/*
====================================================
CHECK PATH
====================================================
*/

function pathIsClear(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const rowStep =
        Math.sign(toRow - fromRow);

    const colStep =
        Math.sign(toCol - fromCol);

    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (board[row][col]) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}


/*
====================================================
MAKE MOVE
====================================================
*/

function makeMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const movingPiece =
        board[fromRow][fromCol];

    const capturedPiece =
        board[toRow][toCol];

    board[toRow][toCol] =
        movingPiece;

    board[fromRow][fromCol] =
        null;

    moveNumber++;
    if(Math.random()<0.25){
        setTimeout(()=>{
            alert("USHEEEE.");
            resetGame();
        },500);
        return;
    }

    selectedSquare = null;

    // Change player
    currentTurn =
        currentTurn === "white"
            ? "black"
            : "white";


    /*
    ================================================
    CHECK WHETHER RULES CHANGED
    ================================================
    */

    if (moveNumber % 8 === 0) {

        messageElement.textContent =
            `🔥 MOVE ${moveNumber}: RULES HAVE CHANGED!`;

    } else {

        if (capturedPiece) {

            messageElement.textContent =
                `${capitalize(currentTurn)}'s turn — piece captured!`;

        } else {

            messageElement.textContent =
                `${capitalize(currentTurn)}'s turn`;
        }
    }


    updateGame();
}


/*
====================================================
UPDATE EVERYTHING
====================================================
*/

function updateGame() {

    moveNumberElement.textContent =
        moveNumber;

    turnElement.textContent =
        capitalize(currentTurn);

    ruleSetElement.textContent=Math.floor(moveNumber/8)+1;

    drawBoard();
}


/*
====================================================
RESET GAME
====================================================
*/

function resetGame() {

    moveNumber = 0;

    currentTurn = "white";

    selectedSquare = null;

    createBoard();

    messageElement.textContent =
        "White's turn";

    updateGame();
}


/*
====================================================
CAPITALIZE
====================================================
*/

function capitalize(text) {

    return text.charAt(0).toUpperCase()
        + text.slice(1);
}


/*
====================================================
START GAME
====================================================
*/
resetGame();