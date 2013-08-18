"use strict";

var x, y;

// B:  9 ×  9 field with 10 mines and 144 x 144 grid
// I: 16 × 16 field with 40 mines and 256 x 256 grid
// E: 30 × 16 field with 99 mines and 480 x 256 grid

var FIELDWIDTH = 9;
var FIELDHEIGHT = 9;
var NUMBEROFBOMBS = 10;
var SCOREHEIGHT = 33;
var WINDOWBORDER = 11;
var CANVASWIDTH = (16 * FIELDWIDTH) + (WINDOWBORDER*2);
var CANVASHEIGHT = (16 * FIELDHEIGHT) + (WINDOWBORDER*2);

var CURRENTGAME = 9;

var EMPTY = 1;
var BOMB = 2;
var EXPLODED = 3;

var squares = [];
for (x = 0; x < FIELDWIDTH; x += 1) {
    squares[x] = [];
}

var NOTGUESSED = 0;
var GUESSED = 1;
var FLAGGED = 2;
var MOUSEDOWN = 3;
var guesses;				// array that holds players changes to board
var bombsIdentified = 0;
var seconds = 0;
var tmr = 0;
var mousebtnheld = 0;

var GAMESTATUS = 0;
var NOGAME = 0;
var GAMEPLAYING = 1;
var GAMELOST = 2;
var GAMEWON = 3;

var clickX, clickY;

function resetGuesses() {
	guesses = [];
	for (x = 0; x < FIELDWIDTH; x += 1) {
		guesses[x] = [];
		for (y = 0; y < FIELDHEIGHT; y += 1) {
			guesses[x][y] = NOTGUESSED;
		}
	}
}

var checks;					// array that holds whether square has been checked this turn
var NOTCHECKED = 0;
var CHECKED = 1;

function resetChecks() {
	checks = [];
	for (x = 0; x < FIELDWIDTH; x += 1) {
		checks[x] = [];
		for (y = 0; y < FIELDHEIGHT; y += 1) {
			checks[x][y] = NOTCHECKED;
		}
	}
}

function isBomb(i, j) {
	var retVal = 0;
    // We don't want to check off the side of the grid
    if (i > -1 && i < FIELDWIDTH && j > -1 && j < FIELDHEIGHT) {
        if (squares[i][j] === BOMB) {
            retVal = 1;
        }
    }
    return retVal;
}

var canvas;
var context;
var sprite;
function drawField() {
	var COUNTERWIDTH = CANVASWIDTH - (WINDOWBORDER * 2), strBombsIdentified = String(bombsIdentified), strlen = strBombsIdentified.length, strSeconds;

	// Draw top border
    context.drawImage(sprite, 176, 0,            WINDOWBORDER, WINDOWBORDER, 0,                          0,                            WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 187, 0,            1,            WINDOWBORDER, WINDOWBORDER,               0,                            CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 190, 0,            WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, 0,                            WINDOWBORDER,                     WINDOWBORDER);
	// Draw scoreheader sides
    context.drawImage(sprite, 176, WINDOWBORDER, WINDOWBORDER, 1,            0,                          WINDOWBORDER,                 WINDOWBORDER,                     SCOREHEIGHT);
    context.drawImage(sprite, 190, WINDOWBORDER, WINDOWBORDER, 1,            CANVASWIDTH - WINDOWBORDER, WINDOWBORDER,                 WINDOWBORDER,                     SCOREHEIGHT);
	// Draw middle border
    context.drawImage(sprite, 176, WINDOWBORDER, WINDOWBORDER, WINDOWBORDER, 0,                          WINDOWBORDER+SCOREHEIGHT,     WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 187, WINDOWBORDER, 1,            WINDOWBORDER, WINDOWBORDER,               WINDOWBORDER+SCOREHEIGHT,     CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 190, WINDOWBORDER, WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, WINDOWBORDER+SCOREHEIGHT,     WINDOWBORDER,                     WINDOWBORDER);
	// Draw minefield sides
    context.drawImage(sprite, 176, WINDOWBORDER, WINDOWBORDER, 1,            0,                          (WINDOWBORDER*2)+SCOREHEIGHT, WINDOWBORDER,                     (16 * FIELDHEIGHT));
    context.drawImage(sprite, 190, WINDOWBORDER, WINDOWBORDER, 1,            CANVASWIDTH - WINDOWBORDER, (WINDOWBORDER*2)+SCOREHEIGHT, WINDOWBORDER,                     (16 * FIELDHEIGHT));
	// Draw bottom border
    context.drawImage(sprite, 176, (WINDOWBORDER*2)+3, WINDOWBORDER, WINDOWBORDER, 0,                          (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 187, (WINDOWBORDER*2)+3, 1,            WINDOWBORDER, WINDOWBORDER,               (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 190, (WINDOWBORDER*2)+3, WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     WINDOWBORDER,                     WINDOWBORDER);

	// Drawing background for counters
    context.drawImage(sprite, 5, 5, 6, 6, WINDOWBORDER, WINDOWBORDER, COUNTERWIDTH, SCOREHEIGHT);

	// Drawing housings for counters
	context.drawImage(sprite, 0, 39, 41, 25, WINDOWBORDER+5, WINDOWBORDER+4, 41, 25);
	context.drawImage(sprite, 0, 39, 41, 25, COUNTERWIDTH-35, WINDOWBORDER+4, 41, 25);

	// Drawing count of identified bombs
	if (strlen === 3) {
		context.drawImage(sprite, (parseInt(strBombsIdentified[0], 10))*13, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
    	context.drawImage(sprite, (parseInt(strBombsIdentified[1], 10))*13, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
	    context.drawImage(sprite, (parseInt(strBombsIdentified[2], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 2) {
		context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strBombsIdentified[0], 10))*13, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
    	context.drawImage(sprite, (parseInt(strBombsIdentified[1], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 1) {
		context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strBombsIdentified[0], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	}

	// Drawing seconds counter
	if(seconds < 1000) {
	    strSeconds = String(seconds);
    } else {
		strSeconds = String(999);
    }
   	strlen = strSeconds.length;
	if (strlen === 3) {
		context.drawImage(sprite, (parseInt(strSeconds[0], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-45, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strSeconds[1], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-32, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strSeconds[2], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-19, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 2) {
		context.drawImage(sprite, 0, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-45, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strSeconds[0], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-32, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strSeconds[1], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-19, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 1) {
		context.drawImage(sprite, 0, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-45, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, 0, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-32, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strSeconds[0], 10))*13, 16, 13, 23, CANVASWIDTH-WINDOWBORDER-19, WINDOWBORDER+5, 13, 23);
	}

	// Drawing game status smiley
	switch (GAMESTATUS)  {
		case GAMELOST:
			context.drawImage(sprite, 68, 39, 27, 27, (COUNTERWIDTH/2)+WINDOWBORDER-13, WINDOWBORDER+2, 27, 27);
			break;
		case GAMEWON:
			context.drawImage(sprite, 95, 39, 27, 27, (COUNTERWIDTH/2)+WINDOWBORDER-13, WINDOWBORDER+2, 27, 27);
			break;
		default:
			context.drawImage(sprite, 41, 39, 27, 27, (COUNTERWIDTH/2)+WINDOWBORDER-13, WINDOWBORDER+2, 27, 27);
	}

	// Drawing actual minefield
    for (x = 0; x < FIELDWIDTH; x += 1) {
        for (y = 0; y < FIELDHEIGHT; y += 1) {
        	// Adding 33 to give space for the bombs and time counters
        	// Add 13 to x and y to give space for border
            if (guesses[x][y] === MOUSEDOWN) {
                context.drawImage(sprite, 16, 0, 16, 16, (x * 16) + WINDOWBORDER, (y * 16) + (WINDOWBORDER * 2) + SCOREHEIGHT, 16, 16);
            } else if (guesses[x][y] === FLAGGED) {
                context.drawImage(sprite, 64, 0, 16, 16, (x * 16) + WINDOWBORDER, (y * 16) + (WINDOWBORDER * 2) + SCOREHEIGHT, 16, 16);
            } else if (guesses[x][y] === GUESSED) {
                context.drawImage(sprite, squares[x][y] * 16, 0, 16, 16, (x * 16) + WINDOWBORDER, (y * 16) + (WINDOWBORDER * 2) + SCOREHEIGHT, 16, 16);
            } else {
                context.drawImage(sprite, 0, 0, 16, 16, (x * 16) + WINDOWBORDER, (y * 16) + (WINDOWBORDER * 2) + SCOREHEIGHT, 16, 16);
            }
        }
    }
}

var nest = 0;
function checkForAdjacentBlanks(r, s) {
	nest += 1;
	if(s > 0) {
		if (r > 0) {
			if(squares[r - 1][s - 1] === EMPTY || squares[r - 1][s - 1] > 4) {
				guesses[r - 1][s - 1] = GUESSED;
				if (checks[r - 1][s - 1] === NOTCHECKED) {
					checks[r - 1][s - 1] = CHECKED;
					if(squares[r - 1][s - 1] === EMPTY) {
						checkForAdjacentBlanks(r - 1, s - 1);
					}
				}
			}
		}
		if(squares[r][s - 1] === EMPTY || squares[r][s - 1] > 4) {
			if (checks[r][s - 1] === NOTCHECKED) {
				checks[r][s - 1] = CHECKED;
				guesses[r][s - 1] = GUESSED;
				if(squares[r][s - 1] === EMPTY) {
					checkForAdjacentBlanks(r, s - 1);
				}
			}
		}
		if (r < FIELDWIDTH-1) {
			if(squares[r + 1][s - 1] === EMPTY || squares[r + 1][s - 1] > 4) {
				guesses[r + 1][s - 1] = GUESSED;
				if (checks[r + 1][s - 1] === NOTCHECKED) {
					checks[r + 1][s - 1] = CHECKED;
					if(squares[r + 1][s - 1] === EMPTY) {
						checkForAdjacentBlanks(r + 1, s - 1);
					}
				}
			}
		}
	}

	if (r > 0) {
		if(squares[r - 1][s] === EMPTY || squares[r - 1][s] > 4) {
			guesses[r - 1][s] = GUESSED;
			if (checks[r - 1][s] === NOTCHECKED) {
				checks[r - 1][s] = CHECKED;
				if(squares[r - 1][s] === EMPTY) {
					checkForAdjacentBlanks(r - 1, s);
				}
			}
		}
	}

	if(squares[r][s] === EMPTY || squares[r][s] > 4) {
		guesses[r][s] = GUESSED;
		if (checks[r][s] === NOTCHECKED) {
			checks[r][s] = CHECKED;
		}
	}

	if (r < FIELDWIDTH-1) {
		if(squares[r + 1][s] === EMPTY || squares[r + 1][s] > 4) {
			guesses[r + 1][s] = GUESSED;
			if (checks[r + 1][s] === NOTCHECKED) {
				checks[r + 1][s] = CHECKED;
				if(squares[r + 1][s] === EMPTY) {
					checkForAdjacentBlanks(r + 1, s);
				}
			}
		}
	}

	if(s < FIELDHEIGHT-1) {
		if (r > 0) {
			if(squares[r - 1][s + 1] === EMPTY || squares[r - 1][s + 1] > 4) {
				guesses[r - 1][s + 1] = GUESSED;
				if (checks[r - 1][s + 1] === NOTCHECKED) {
					checks[r - 1][s + 1] = CHECKED;
					if(squares[r - 1][s + 1] === EMPTY) {
						checkForAdjacentBlanks(r - 1, s + 1);
					}
				}
			}
		}
		if(squares[r][s + 1] === EMPTY || squares[r][s + 1] > 4) {
			guesses[r][s + 1] = GUESSED;
			if (checks[r][s + 1] === NOTCHECKED) {
				checks[r][s + 1] = CHECKED;
				if(squares[r][s + 1] === EMPTY) {
					checkForAdjacentBlanks(r, s + 1);
				}
			}
		}
		if (r < FIELDWIDTH-1) {
			if(squares[r + 1][s + 1] === EMPTY || squares[r + 1][s + 1] > 4) {
				guesses[r + 1][s + 1] = GUESSED;
				if (checks[r + 1][s + 1] === NOTCHECKED) {
					checks[r + 1][s + 1] = CHECKED;
					if(squares[r + 1][s + 1] === EMPTY) {
						checkForAdjacentBlanks(r + 1, s + 1);
					}
				}
			}
		}
	}
}

function clock() {
	seconds += 1;
    drawField();
}

function userMousedOut() {
	if (GAMESTATUS !== GAMELOST && mousebtnheld) {
		guesses[clickX][clickY] = NOTGUESSED;
		mousebtnheld = 0;
	}
	drawField();
}

function userMousedDown(evt) {
	evt.preventDefault();

	clickX = Math.floor(((evt.pageX - canvas.offsetLeft) - WINDOWBORDER) / 16);
	clickY = Math.floor(((evt.pageY - canvas.offsetTop) - (WINDOWBORDER * 2) - SCOREHEIGHT) / 16);

	if (GAMESTATUS === GAMEPLAYING) {
		if (guesses[clickX][clickY] === NOTGUESSED) {
			guesses[clickX][clickY] = MOUSEDOWN;
		}
		mousebtnheld = 1;
	}
    drawField();
}

function userMousedUp(evt) {
	evt.preventDefault();

	mousebtnheld = 0;

	// If mouse has been moved to a new square, release previous square and do nothing
	if ((clickX !==Math.floor(((evt.pageX - canvas.offsetLeft) - WINDOWBORDER) / 16)) ||
		(clickY !==Math.floor(((evt.pageY - canvas.offsetTop) - (WINDOWBORDER * 2) - SCOREHEIGHT) / 16))) {
		if (GAMESTATUS !== GAMELOST) {
			guesses[clickX][clickY] = NOTGUESSED;
		}
	} else {
		// If this is the first move, start the timer
		if (GAMESTATUS === NOGAME) {
			GAMESTATUS = GAMEPLAYING;
			tmr = setInterval(function(){clock();},1000);
		}

		// If right-click
		if (evt.button === 2) {
			// Only let the player make changes when the game is still going
			if (GAMESTATUS === GAMEPLAYING) {
				if (guesses[clickX][clickY] === FLAGGED) {
					guesses[clickX][clickY] = NOTGUESSED;
					bombsIdentified -= 1;
				} else if (guesses[clickX][clickY] === GUESSED) {
					// Do nothing to squares that have already been cleared
				} else {
					guesses[clickX][clickY] = FLAGGED;
					bombsIdentified += 1;
				}
			}
		// If left-click
		} else {
			if ((evt.pageX - canvas.offsetLeft) > (CANVASWIDTH/2)-13 && (evt.pageX - canvas.offsetLeft) < (CANVASWIDTH/2)+13 && (evt.pageY - canvas.offsetTop) > WINDOWBORDER+3 && (evt.pageY - canvas.offsetTop) < +WINDOWBORDER+29 ) {
				newGame(CURRENTGAME);
			} else if (squares[clickX][clickY] === BOMB) {
				if (GAMESTATUS === GAMEPLAYING) {
					for (x = 0; x < FIELDWIDTH; x += 1) {
						for (y = 0; y < FIELDHEIGHT; y += 1) {
							guesses[x][y] = GUESSED;
						}
					}
					squares[clickX][clickY] = EXPLODED;
					GAMESTATUS = GAMELOST;
					clearInterval(tmr);
				}
			} else {
				// if game isn't over and
				// square is currently hidden
				if (GAMESTATUS === GAMEPLAYING && guesses[clickX][clickY] !== GUESSED) {
					guesses[clickX][clickY] = GUESSED;
					// Check for adjacent blanks is clicked square is empty
					if(squares[clickX][clickY] === EMPTY) {
						checkForAdjacentBlanks(clickX, clickY);
					}
				}
			}
		}

		if(bombsIdentified === NUMBEROFBOMBS) {
			GAMESTATUS = GAMEWON;
			clearInterval(tmr);

			// Clear remaining hidden squares
			for (x = 0; x < FIELDWIDTH; x += 1) {
				for (y = 0; y < FIELDHEIGHT; y += 1) {
					if (guesses[x][y] === NOTGUESSED) {
						guesses[x][y] = GUESSED;
					}
				}
			}

		}
	}
    drawField();
}

function userRightClicked(evt) {
	evt.preventDefault();
}

function userKeyUp(evt) {
	if (evt.keyCode === 66 ) { // beginner
		newGame(10);
	} else if (evt.keyCode === 69 ) { // expert
		newGame(99);
	} else if (evt.keyCode === 73 ) { // intermediate
		newGame(40);
	} else if (evt.keyCode === 78 ) { // new
		newGame(CURRENTGAME);
	}
}

// B:  9 ×  9 field with 10 mines and 144 x 144 grid
// I: 16 × 16 field with 40 mines and 256 x 256 grid
// E: 30 × 16 field with 99 mines and 480 x 256 grid
function newGame(size) {
    var randomX, randomY, count;

	bombsIdentified = 0;
	seconds = 0;
	if(tmr) {
		clearInterval(tmr);
	}
	GAMESTATUS = NOGAME;

    canvas = document.getElementById('canvas');
	if (size === 40) {
		FIELDWIDTH = 16;
		FIELDHEIGHT = 16;
		CURRENTGAME = NUMBEROFBOMBS = 40;
	} else if (size === 99) {
		FIELDWIDTH = 30;
		FIELDHEIGHT = 16;
		CURRENTGAME = NUMBEROFBOMBS = 99;
	} else {
		FIELDWIDTH = 9;
		FIELDHEIGHT = 9;
		CURRENTGAME = NUMBEROFBOMBS = 10;
	}
	CANVASWIDTH = (16 * FIELDWIDTH) + (WINDOWBORDER * 2);
	CANVASHEIGHT = (16 * FIELDHEIGHT) + (WINDOWBORDER * 3) + SCOREHEIGHT;

	document.getElementById('menubar').style.width = CANVASWIDTH + "px";
	document.getElementById('field').style.width = CANVASWIDTH + "px";
	document.getElementById('field').style.height = CANVASHEIGHT + "px";

	canvas.width = CANVASWIDTH;
	canvas.height = CANVASHEIGHT;
    context = canvas.getContext('2d');

	squares = [];
	for (x = 0; x < FIELDWIDTH; x += 1) {
		squares[x] = [];
	}
	resetGuesses();

	resetChecks();

    canvas.addEventListener("contextmenu", userRightClicked, false);
    canvas.addEventListener("mousedown", userMousedDown, false);
    canvas.addEventListener("mouseout", userMousedOut, false);
    canvas.addEventListener("mouseup", userMousedUp, false);
    window.addEventListener("keyup", userKeyUp, false);

    sprite = new Image();
    sprite.src = 'mines.png';

    for (x = 0; x < FIELDWIDTH; x += 1) {
        for (y = 0; y < FIELDHEIGHT; y += 1) {
            squares[x][y] = EMPTY;
        }
    }

    // Generate bomb locations
    x = 0;
    while (x < NUMBEROFBOMBS) {
        randomX = Math.floor(Math.random() * FIELDWIDTH);
        randomY = Math.floor(Math.random() * FIELDHEIGHT);
        if (squares[randomX][randomY] !== BOMB) {
            squares[randomX][randomY] = BOMB;
            x += 1;
        }
    }

    // Generate neighbour counts
    for (x = 0; x < FIELDWIDTH; x += 1) {
        for (y = 0; y < FIELDHEIGHT; y += 1) {
            if (squares[x][y] !== BOMB) {
                count = 0;
                count = count + isBomb(x - 1, y - 1);
                count = count + isBomb(x, y - 1);
                count = count + isBomb(x + 1, y - 1);

                count = count + isBomb(x - 1, y);
                count = count + isBomb(x + 1, y);

                count = count + isBomb(x - 1, y + 1);
                count = count + isBomb(x, y + 1);
                count = count + isBomb(x + 1, y + 1);
                if (count > 0) {
                	squares[x][y] = 4 + count;
                }
            }
        }
    }

    // Draw minefield
    sprite.onload = function() {
        drawField();
    };

}
