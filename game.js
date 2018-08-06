"use strict";
/* global $ */

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

var NOTGUESSED = 0;
var GUESSED = 1;
var FLAGGED = 2;
var MOUSEDOWN = 3;
var MARKED = 4;
var squaresCleared = 0;
var squaresFlagged = 0;
var seconds = 0;
var tmr = 0;
var mousebtnheld = 0;

var GAMESTATUS = 0;
var NOGAME = 0;
var GAMEPLAYING = 1;
var GAMELOST = 2;
var GAMEWON = 3;

var MARKSON = 0;

var SUBMITTINGSCORE = 0;

var NOTCHECKED = 0;
var CHECKED = 1;

var clickX, clickY;

var squares = [];			// array that holds bombs and neighbouring counts
var guesses = [];			// array that holds players changes to board
var checks = [];			// array that holds whether square has been checked this turn

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

function resetArrays() {
	var randomX, randomY, count;

	squaresCleared = 0;
	squaresFlagged = 0;

	squares = [];
	guesses = [];
	checks = [];
    for (x = 0; x < FIELDWIDTH; x += 1) {
		squares[x] = [];
		guesses[x] = [];
		checks[x] = [];
        for (y = 0; y < FIELDHEIGHT; y += 1) {
            squares[x][y] = EMPTY;
			guesses[x][y] = NOTGUESSED;
			checks[x][y] = NOTCHECKED;
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
}

function countSquares(type) {
	var result = 0;
	for (x = 0; x < FIELDWIDTH; x += 1) {
		for (y = 0; y < FIELDHEIGHT; y += 1) {
			if (guesses[x][y] === type) {
				result += 1;
			}
		}
	}
	return result;
}

var canvas;
var context;
var sprite;

function drawFrame() {
	var COUNTERWIDTH = CANVASWIDTH - (WINDOWBORDER * 2);

	// Draw top border
    context.drawImage(sprite, 208, 0,            WINDOWBORDER, WINDOWBORDER, 0,                          0,                            WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 219, 0,            1,            WINDOWBORDER, WINDOWBORDER,               0,                            CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 222, 0,            WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, 0,                            WINDOWBORDER,                     WINDOWBORDER);
	// Draw scoreheader sides
    context.drawImage(sprite, 208, WINDOWBORDER, WINDOWBORDER, 1,            0,                          WINDOWBORDER,                 WINDOWBORDER,                     SCOREHEIGHT);
    context.drawImage(sprite, 222, WINDOWBORDER, WINDOWBORDER, 1,            CANVASWIDTH - WINDOWBORDER, WINDOWBORDER,                 WINDOWBORDER,                     SCOREHEIGHT);
	// Draw middle border
    context.drawImage(sprite, 208, WINDOWBORDER, WINDOWBORDER, WINDOWBORDER, 0,                          WINDOWBORDER+SCOREHEIGHT,     WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 219, WINDOWBORDER, 1,            WINDOWBORDER, WINDOWBORDER,               WINDOWBORDER+SCOREHEIGHT,     CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 222, WINDOWBORDER, WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, WINDOWBORDER+SCOREHEIGHT,     WINDOWBORDER,                     WINDOWBORDER);
	// Draw minefield sides
    context.drawImage(sprite, 208, WINDOWBORDER, WINDOWBORDER, 1,            0,                          (WINDOWBORDER*2)+SCOREHEIGHT, WINDOWBORDER,                     (16 * FIELDHEIGHT));
    context.drawImage(sprite, 222, WINDOWBORDER, WINDOWBORDER, 1,            CANVASWIDTH - WINDOWBORDER, (WINDOWBORDER*2)+SCOREHEIGHT, WINDOWBORDER,                     (16 * FIELDHEIGHT));
	// Draw bottom border
    context.drawImage(sprite, 208, (WINDOWBORDER*2)+3, WINDOWBORDER, WINDOWBORDER, 0,                          (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     WINDOWBORDER,                     WINDOWBORDER);
    context.drawImage(sprite, 219, (WINDOWBORDER*2)+3, 1,            WINDOWBORDER, WINDOWBORDER,               (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     CANVASWIDTH - (WINDOWBORDER * 2), WINDOWBORDER);
    context.drawImage(sprite, 222, (WINDOWBORDER*2)+3, WINDOWBORDER, WINDOWBORDER, CANVASWIDTH - WINDOWBORDER, (WINDOWBORDER*2)+SCOREHEIGHT+(16 * FIELDHEIGHT),     WINDOWBORDER,                     WINDOWBORDER);

	// Drawing background for counters
    context.drawImage(sprite, 5, 5, 6, 6, WINDOWBORDER, WINDOWBORDER, COUNTERWIDTH, SCOREHEIGHT);

	// Drawing housings for counters
	context.drawImage(sprite, 0, 39, 41, 25, WINDOWBORDER+5, WINDOWBORDER+4, 41, 25);
	context.drawImage(sprite, 0, 39, 41, 25, COUNTERWIDTH-35, WINDOWBORDER+4, 41, 25);
}

function drawBombCount() {
	var strRemainingBombCount;
	var strlen;

	// Drawing count of identified bombs
	squaresFlagged = countSquares(FLAGGED);
	strRemainingBombCount = String(NUMBEROFBOMBS-squaresFlagged);
	strlen = strRemainingBombCount.length;
	if (strlen === 3) {
		if (strRemainingBombCount[0] === "-") {
			context.drawImage(sprite, 130, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
			context.drawImage(sprite, (parseInt(strRemainingBombCount[1], 10))*13, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		} else {
			context.drawImage(sprite, (parseInt(strRemainingBombCount[0], 10))*13, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
			context.drawImage(sprite, (parseInt(strRemainingBombCount[1], 10))*13, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		}
		context.drawImage(sprite, (parseInt(strRemainingBombCount[2], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 2) {
		if (strRemainingBombCount[0] === "-") {
			context.drawImage(sprite, 130, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
			context.drawImage(sprite,   0, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		} else {
			context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
			context.drawImage(sprite, (parseInt(strRemainingBombCount[0], 10))*13, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		}
		context.drawImage(sprite, (parseInt(strRemainingBombCount[1], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	} else if (strlen === 1) {
		context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+6, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, 0, 16, 13, 23, WINDOWBORDER+19, WINDOWBORDER+5, 13, 23);
		context.drawImage(sprite, (parseInt(strRemainingBombCount[0], 10))*13, 16, 13, 23, WINDOWBORDER+32, WINDOWBORDER+5, 13, 23);
	}
}

function drawSecondCount() {
	var strlen;
	var strSeconds;

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
}

function drawSmiley() {
	var COUNTERWIDTH = CANVASWIDTH - (WINDOWBORDER * 2);

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
}

function drawField() {
	var srcX = 0;
	var srcY = 0;
	// Drawing actual minefield
    for (x = 0; x < FIELDWIDTH; x += 1) {
        for (y = 0; y < FIELDHEIGHT; y += 1) {
			// Adding 33 to give space for the bombs and time counters
			// Add 13 to x and y to give space for border
            if (guesses[x][y] === MOUSEDOWN) {
                srcX = 16;
                srcY = 0;
            } else if (guesses[x][y] === MARKED) {
                srcX = 143;
                srcY = 16;
            } else if (guesses[x][y] === FLAGGED) {
                srcX = 64;
                srcY = 0;
            } else if (guesses[x][y] === GUESSED) {
                srcX = squares[x][y] * 16;
                srcY = 0;
            } else {
                srcX = 0;
                srcY = 0;
            }
            context.drawImage(sprite, srcX, srcY, 16, 16, (x * 16) + WINDOWBORDER, (y * 16) + (WINDOWBORDER * 2) + SCOREHEIGHT, 16, 16);
        }
    }
}

function checkForAdjacentBlanks(r, s) {
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
	drawFrame();
	drawBombCount();
	drawSecondCount();
	drawSmiley();
    drawField();
}

function setMarks() {
	if(MARKSON === 1) {
		MARKSON = 0;
		document.getElementById("marksanchor").innerHTML = "<u>M</u>arks (?)";
	} else {
		MARKSON = 1;
		document.getElementById("marksanchor").innerHTML = "&#10003;&nbsp;<u>M</u>arks (?)";
	}
}

function showScores() {
	if(document.getElementById("scorediv").style.display === "none") {
		document.getElementById("scorediv").style.display = "block";
	} else {
		document.getElementById("scorediv").style.display = "none";
	}
}

function hideScores() {
	document.getElementById("scorediv").style.display = "none";
}

function userMousedOut() {
	if (GAMESTATUS !== GAMELOST && mousebtnheld) {
		guesses[clickX][clickY] = NOTGUESSED;
		mousebtnheld = 0;
	}
	drawFrame();
	drawBombCount();
	drawSecondCount();
	drawSmiley();
    drawField();
}

function loadScores() {
    $.ajax({
		url: 'get_scores.php', data: "", dataType: 'json',  success(rows)
		{
			var currentLevel = 0;
			$("table#scoretable tbody tr").remove();
			for(var i = 0; i < rows.length; i++) {
				if (currentLevel !== rows[i].level) {
					switch(rows[i].level) {
						case "1":
							$("table#scoretable tbody").append("<tr><th>Beginner</th></tr>");
							break;
						case "2":
							$("table#scoretable tbody").append("<tr><th>Intermediate</th></tr>");
							break;
						case "3":
							$("table#scoretable tbody").append("<tr><th>Expert</th></tr>");
							break;
					}
					currentLevel = rows[i].level;
				}
				var t = rows[i].date.split(/[- :]/);
				var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
				var strWithoutFlags = "";
				if (rows[i].withoutflags === "1") {
					strWithoutFlags = "<td><img src=\"sunglasses.png\" width=12 height=12 alt=\"Completed without using flags\" title=\"Completed without using flags\" /></td>";
				} else {
					strWithoutFlags = "<td></td>";
				}
				$("table#scoretable tbody").append("<tr><td></td><td>" + rows[i].time + " seconds</td>" + strWithoutFlags + "<td>" + rows[i].name + "</td><td>" + ( d.getHours() < 10 ? "0" : "" ) + d.getHours() + ":" + ( d.getMinutes() < 10 ? "0" : "" ) + d.getMinutes() + " " + ( d.getDate() < 10 ? "0" : "" ) + d.getDate() + "/" + ( (d.getMonth()+1) < 10 ? "0" : "" ) + (d.getMonth()+1) + "/" + d.getFullYear() + "</td></tr>");
			}
		}
	});
}

function saveScore() {
	var currentlevel, withoutflags;
	switch (CURRENTGAME) {
		case 10:
			currentlevel = 1;
			break;
		case 40:
			currentlevel = 2;
			break;
		case 99:
			currentlevel = 3;
			break;
		default:
			break;
	}
	if (squaresFlagged === 0) {
		withoutflags = 1;
	} else {
		withoutflags = 0;
	}
	$.ajax({
		url: "save_score.php", data: { level: currentlevel, name: document.getElementById("nomdeplume").value, time: seconds, withoutflags: withoutflags }, dataType: "json",  success(rows)
		{
			// Do stuff
		}
	});
	document.getElementById("newscorediv").style.display = "none";
	SUBMITTINGSCORE = 0;
	setTimeout(function () {
		loadScores();
    }, 2500);
}

function withinBounds(evt) {
	if ((evt.pageX - canvas.offsetLeft) > WINDOWBORDER &&
		(evt.pageX - canvas.offsetLeft) < CANVASWIDTH-WINDOWBORDER &&
		(evt.pageY - canvas.offsetTop) > 55 &&
		(evt.pageY - canvas.offsetTop) < CANVASHEIGHT-WINDOWBORDER ) {
		return true;
	} else {
		return false;
	}
}

function userMousedDown(evt) {
	evt.preventDefault();

	clickX = Math.floor(((evt.pageX - canvas.offsetLeft) - WINDOWBORDER) / 16);
	clickY = Math.floor(((evt.pageY - canvas.offsetTop) - (WINDOWBORDER * 2) - SCOREHEIGHT) / 16);

	if ( withinBounds(evt) ) {
		if (GAMESTATUS === GAMEPLAYING) {
			if (guesses[clickX][clickY] === NOTGUESSED) {
				guesses[clickX][clickY] = MOUSEDOWN;
			}
			mousebtnheld = 1;
		}
	}
	drawFrame();
	drawBombCount();
	drawSecondCount();
	drawSmiley();
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
		// If right-click
		if (evt.button === 2) {
			// If clicked on game board
			if ( withinBounds(evt) ) {
				if (GAMESTATUS === GAMEPLAYING) { // Only let the player make changes when the game is still going
					if (guesses[clickX][clickY] === MARKED) {
						guesses[clickX][clickY] = NOTGUESSED;
					} else if (guesses[clickX][clickY] === FLAGGED) {
						if (MARKSON) {
							guesses[clickX][clickY] = MARKED;
						} else {
							guesses[clickX][clickY] = NOTGUESSED;
						}
					} else {
						guesses[clickX][clickY] = FLAGGED;
					}
				}
			}
			/*
			*/
		// If left-click
		} else {
			// If clicked on face
			if ((evt.pageX - canvas.offsetLeft) > (CANVASWIDTH/2)-13 &&
				(evt.pageX - canvas.offsetLeft) < (CANVASWIDTH/2)+13 &&
				(evt.pageY - canvas.offsetTop) > WINDOWBORDER+3 &&
				(evt.pageY - canvas.offsetTop) < WINDOWBORDER+29 ) {
				newGame(CURRENTGAME);
			} else {
				// If this is the first move, start the timer
				if (GAMESTATUS !== GAMEPLAYING) {
					// If this is the first move, start the timer
					GAMESTATUS = GAMEPLAYING;
					tmr = setInterval(function(){clock();},1000);
				}

				if (GAMESTATUS === GAMEPLAYING) {
					if (squares[clickX][clickY] === BOMB) {
						for (x = 0; x < FIELDWIDTH; x += 1) {
							for (y = 0; y < FIELDHEIGHT; y += 1) {
								guesses[x][y] = GUESSED;
							}
						}
						squares[clickX][clickY] = EXPLODED;
						GAMESTATUS = GAMELOST;
						clearInterval(tmr);
					} else if (guesses[clickX][clickY] !== GUESSED) {
						guesses[clickX][clickY] = GUESSED;
						// Check for adjacent blanks is clicked square is empty
						if(squares[clickX][clickY] === EMPTY) {
							checkForAdjacentBlanks(clickX, clickY);
						}
						squaresCleared = countSquares(GUESSED);
					}
				}
			}
		}

		if(squaresCleared === (FIELDWIDTH*FIELDHEIGHT)-NUMBEROFBOMBS) {
			GAMESTATUS = GAMEWON;
			clearInterval(tmr);

			// Run this now, so we know whether player completed without using flags
			// before we mark all the bombs with flags
			squaresFlagged = countSquares(FLAGGED);

			// Flag remaining hidden bombs
			for (x = 0; x < FIELDWIDTH; x += 1) {
				for (y = 0; y < FIELDHEIGHT; y += 1) {
					if (squares[x][y] === BOMB) {
						guesses[x][y] = FLAGGED;
					}
				}
			}

			if (seconds < 999) {
				SUBMITTINGSCORE = 1;
				document.getElementById("newscorediv").style.display = "block";
			}
		}
	}
	drawFrame();
	drawBombCount();
	drawSecondCount();
	drawSmiley();
    drawField();
}

function userRightClicked(evt) {
	evt.preventDefault();
}

function userKeyUp(evt) {
	if (SUBMITTINGSCORE === 0) {
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
}

function newGame(size) {
	seconds = 0;
	if(tmr) {
		clearInterval(tmr);
	}
	GAMESTATUS = NOGAME;

    canvas = document.getElementById("canvas");
	document.getElementById("beginneranchor").innerHTML = "<u>B</u>eginner";
	document.getElementById("intermediateanchor").innerHTML = "<u>I</u>ntermediate";
	document.getElementById("expertanchor").innerHTML = "<u>E</u>xpert";

	if (size === 40) {
		FIELDWIDTH = 16;
		FIELDHEIGHT = 16;
		CURRENTGAME = NUMBEROFBOMBS = 40;
		document.getElementById("intermediateanchor").innerHTML = "&#10003;&nbsp;<u>I</u>ntermediate";
	} else if (size === 99) {
		FIELDWIDTH = 30;
		FIELDHEIGHT = 16;
		CURRENTGAME = NUMBEROFBOMBS = 99;
		document.getElementById("expertanchor").innerHTML = "&#10003;&nbsp;<u>E</u>xpert";
	} else {
		FIELDWIDTH = 9;
		FIELDHEIGHT = 9;
		CURRENTGAME = NUMBEROFBOMBS = 10;
		document.getElementById("beginneranchor").innerHTML = "&#10003;&nbsp;<u>B</u>eginner";
	}
	CANVASWIDTH = (16 * FIELDWIDTH) + (WINDOWBORDER * 2);
	CANVASHEIGHT = (16 * FIELDHEIGHT) + (WINDOWBORDER * 3) + SCOREHEIGHT;

	document.getElementById("menubar").style.width = CANVASWIDTH + "px";
	document.getElementById("field").style.width = CANVASWIDTH + "px";
	document.getElementById("field").style.height = CANVASHEIGHT + "px";

	canvas.width = CANVASWIDTH;
	canvas.height = CANVASHEIGHT;
    context = canvas.getContext("2d");

	resetArrays();

    canvas.addEventListener("contextmenu", userRightClicked, false);
    canvas.addEventListener("mousedown", userMousedDown, false);
    canvas.addEventListener("mouseout", userMousedOut, false);
    canvas.addEventListener("mouseup", userMousedUp, false);
    window.addEventListener("keyup", userKeyUp, false);

    sprite = new Image();
    sprite.src = "mines.png";

    // Draw minefield
    sprite.onload = function() {
        drawFrame();
        drawBombCount();
        drawSecondCount();
        drawSmiley();
        drawField();
    };
}
