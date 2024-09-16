var canvas
var context
var intervalNum
var debugMode = false
const fps = 60

var isGameOver = false
var isLevelComplete = false

var canvasMiddleX
var canvasMiddleY

var gameAreaWidth = 500
var gameAreaHeight = 450

var uiAreaHeight = 70


const TIMER_DANGER = 0.1 // percentage of time where timer colour changes to danger color
const TIMER_WARN = 0.25 // percentage of time where timer colour changes to warning color

var levelLengthFrames = 30
var levelHitsIncrease = 5
var levelHits = 10
var level = 1
var timerLevelMultiplier = 0.9
var molePopupTimeLevelMultiplier = 0.9

var mouseX = 0
var mouseY = 0

var misses = 0
var hits = 0
var escapedMoles = 0

var totalHits = 0
var totalMisses = 0
var totalEscapedMoles = 0
var accuracyPercent = 100
var totalClicks = 0

var timeRemainingFrames = 2000
var timeTotalFrames = 2000
var startingTimeTotalFrames = 2000
var timeRemainingPercentage
var missPenaltyFrames = 30

const levelCompleteScreenFramesTotal = 120
var levelCompleteScreenFramesRemaining = 120

const gameOverScreenFramesTotal = 240
var gameOverScreenFramesRemaining = 240
var canRestart = false

var mole = {
	x: 0,
	y: 0,
	w: 150,
	h: 150,
	middleX: 0,
	middleY: 0,
	nextX: 0,
	nextY: 0,
	nextMiddleX: 0,
	nextMiddleY: 0,
	framesSincePopup: 0,
	popupFrames: 100,
	img: new Image(),
}
mole.img.src = "images/mole.png"

bgImg = new Image()
bgImg.src = "images/grass.jpg"

cursorImg = new Image()
cursorImg.src = "images/cursor.png"

var audio = {
	bgm: new Audio(),
	moleHit: new Audio(),
	moleMissed: new Audio(),
	moleRunaway: new Audio(),
	gameOver: new Audio(),
	levelComplete: new Audio(),
}


//Event listeners
mole.img.onload = start
document.onkeydown = thingPressed
document.onclick = thingPressed

function start() {
	canvas = document.getElementById("canvas")
	context = canvas.getContext("2d")

	context.imageSmoothingEnabled = false

	canvas.addEventListener("mousemove", function (event) {
		var rect = canvas.getBoundingClientRect()
		mouseX = event.clientX - rect.left
		mouseY = event.clientY - rect.top
	})
	mole.nextX = randomRange(0, gameAreaWidth - mole.w)
	mole.nextY = randomRange(0, gameAreaHeight - mole.h)

	resetGame()
	//Start game update loop with the framerate of 'fps'
	setInterval(update, 1000 / fps)
}
function update() {
	//Calculates various useful canvas and ui values
	canvasMiddleX = canvas.width / 2
	canvasMiddleY = canvas.height / 2
	gameAreaWidth = canvas.width
	gameAreaHeight = canvas.height - uiAreaHeight

	// Updates canvas size based on window shape & zoom
	canvas.width = canvas.parentNode.clientWidth
	canvas.height = window.innerHeight - 20

	// Determines and runs the correct update method
	if (isGameOver) {
		gameOverDraw()
		gameOverUpdate()
	} else if (isLevelComplete) {
		levelCompleteDraw()
		levelCompleteUpdate()

	} else {
		gamingDraw()
		gamingUpdate()
	}
	//Shows the hitboxes and other debug info
	if (debugMode) {
		drawDebugInfo()
	}


}
function thingPressed() {
	if (isGameOver && canRestart) {
		resetGame()
	}
	if (!isGameOver && !isLevelComplete) {
		totalClicks += 1
		if (checkMoleCollision(mouseX, mouseY) == true) {
			mole.framesSincePopup = 0
			hits += 1
			totalHits += 1
			moveMole()
		} else {
			misses += 1
			totalMisses += 1
			timeRemainingFrames -= missPenaltyFrames
		}
	}
}
function checkMoleCollision(x, y) { // Returns true if the x,y coordinates fall inside the mole"s hitbox 
	if (x >= mole.x && x <= mole.x + mole.w && y >= mole.y && y <= mole.y + mole.h) {
		return true
	}
	return false
}
function randomRange(min, max) {
	return ((Math.random() * (max - min)) + min)
}






function drawTimer(x, y, width, height, timeRemaining, totalTime, changeColor = false) {
	timeRemainingPercentage = timeRemaining / totalTime
	if (changeColor) {
		if (timeRemainingPercentage < TIMER_DANGER) {
			context.fillStyle = "red"
		} else if (timeRemainingPercentage < TIMER_WARN) {
			context.fillStyle = "orange"
		} else {
			context.fillStyle = "green"
		}
	}
	context.fillRect(x, y, width * (timeRemaining / totalTime), height)
}





function moveMole() {
	mole.x = mole.nextX
	mole.y = mole.nextY
	mole.nextX = randomRange(0, gameAreaWidth - mole.w)
	mole.nextY = randomRange(0, gameAreaHeight - mole.h)
}
function drawLine(x1, y1, x2, y2, thickness, color) {
	context.fillStyle = color
	// Start a new Path
	context.beginPath()
	context.lineWidth = thickness
	context.moveTo(x1, y1)
	context.lineTo(x2, y2)

	// Draw the Path
	context.stroke();
}
function drawCircle(x, y, radius, color, fill = true, half_circle = false) {
	context.beginPath()
	if (half_circle) {
		context.arc(x, y, radius, 0, 1 * Math.PI)
	} else {
		context.arc(x, y, radius, 0, 2 * Math.PI)
	}
	context.closePath()
	context.fillStyle = color
	if (fill) {
		context.fill()
	} else {
		context.stroke()
	}
}
function resetLevel() {
	// Change difficulty based on level
	mole.popupFrames = Math.pow(molePopupTimeLevelMultiplier, level) * 100
	timeTotalFrames = Math.pow(timerLevelMultiplier, level) * startingTimeTotalFrames

	// Reset Values and move the mole
	hits = 0
	misses = 0
	escapedMoles = 0
	timeRemainingFrames = timeTotalFrames
	moveMole()
}
function resetGame() {
	timeTotalFrames = startingTimeTotalFrames
	isGameOver = false
	level = 1
	resetLevel()
}
function gameOverUpdate() {
	// Calculates player accuracy
	accuracyPercent = ((totalHits / totalClicks) * 100).toFixed(2)
	//adds an extra delay to prevent accidental restarting
	gameOverScreenFramesRemaining -= 1
	if (gameOverScreenFramesRemaining <= 0) { canRestart = true }
}
function gameOverDraw() {
	fillCanvas("black", 1.0)

	context.fillStyle = "red"
	context.font = "80px smw"
	context.textAlign = "center"
	context.fillText("GAME OVER", canvasMiddleX, 150)

	context.font = "30px smw"
	if (canRestart) {
		context.fillText("Press Any Key to Restart", canvasMiddleX, canvas.height - 100)
	}
	var message = "Skill issue"
	if (level >= 5) {
		message = "Not bad but still not good"
	}
	if (level >= 10) {
		message = "Honestly pretty good"
	}
	if (level >= 15) {
		message = "wow"
	}
	if (level >= 20) {
		message = "literally just cheating"
	}
	if (level == 69) {
		message = "nice"
	}
	context.fillText('"' + message + '"', canvasMiddleX, 250)


	context.textAlign = "right"
	var leftOffset = 10
	context.fillText("Level:", canvasMiddleX - leftOffset, (canvas.height / 2) - 50)
	context.fillText("Total Hits:", canvasMiddleX - leftOffset, (canvas.height / 2))
	context.fillText("Total Misses:", canvasMiddleX - leftOffset, (canvas.height / 2) + 50)
	context.fillText("Escaped Moles:", canvasMiddleX - leftOffset, (canvas.height / 2) + 100)
	context.fillText("Hit Accuracy:", canvasMiddleX - leftOffset, (canvas.height / 2) + 150)

	context.textAlign = "left"
	var rightOffset = 10
	context.fillText(level, canvasMiddleX + rightOffset, (canvas.height / 2) - 50)
	context.fillText(totalHits, canvasMiddleX + rightOffset, (canvas.height / 2))
	context.fillText(totalMisses, canvasMiddleX + rightOffset, (canvas.height / 2) + 50)
	context.fillText(totalEscapedMoles, canvasMiddleX + rightOffset, (canvas.height / 2) + 100)
	context.fillText(accuracyPercent + " %", canvasMiddleX + rightOffset, (canvas.height / 2) + 150)


	drawTimer(0, canvas.height - 10, canvas.width, 10, gameOverScreenFramesRemaining, gameOverScreenFramesTotal)
}
function levelCompleteUpdate() {
	levelCompleteScreenFramesRemaining -= 1
	if (levelCompleteScreenFramesRemaining <= 0) {
		level += 1
		resetLevel()
		isLevelComplete = false
	}
}
function levelCompleteDraw() {
	fillCanvas("black", 1.0)
	context.fillStyle = "green"
	context.font = "80px smw"
	context.textAlign = "center"
	drawTimer(0, canvas.height - 10, canvas.width, 10, levelCompleteScreenFramesRemaining, levelCompleteScreenFramesTotal)
	context.fillText("LEVEL " + level + " COMPLETE!", canvasMiddleX, (canvas.height / 2) - 30)
	context.font = "40px smw"
	context.fillText("Next Level starting soon", canvasMiddleX, canvas.height / 2 + 30)
}
function gamingUpdate() {
	// Decrement level timer
	timeRemainingFrames -= 1

	// Check for win
	if (hits >= levelHits) {
		levelCompleteScreenFramesRemaining = levelCompleteScreenFramesTotal
		isLevelComplete = true
	}

	// Check for loss
	if (timeRemainingFrames <= 0) {
		gameOverScreenFramesRemaining = gameOverScreenFramesTotal
		canRestart = false
		isGameOver = true
	}

	//Determine Middle of the mole
	mole.middleX = mole.x + mole.w / 2
	mole.middleY = mole.y + mole.h / 2
	mole.nextMiddleX = mole.nextX + mole.w / 2
	mole.nextMiddleY = mole.nextY + mole.h / 2

	//Increments the timer for mole movement
	mole.framesSincePopup += 1

	// Moves the mole when the timer expires
	if (mole.framesSincePopup >= mole.popupFrames) {
		mole.framesSincePopup = 0
		escapedMoles += 1
		totalEscapedMoles += 1
		moveMole()
	}
}
function gamingDraw() {
	//Reset the canvas
	fillCanvas("white", 1.0)

	//Draw Background
	context.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

	//Draw line to next position
	context.fillStyle = "black"
	drawLine(mole.middleX, mole.middleY, mole.nextMiddleX, mole.nextMiddleY, 5, "blue")
	drawCircle(mole.nextMiddleX, mole.nextMiddleY, 10, "red", true, false)

	// Draw the mole
	context.drawImage(mole.img, mole.x, mole.y, mole.w, mole.h)

	drawUserInterface()
}
function drawUserInterface() {
	//Set Font
	context.font = "40px smw"

	//Draw UI Box
	context.fillStyle = "#4d4f4e"
	context.fillRect(0, gameAreaHeight, canvas.width, canvas.height)

	//Draw UI Text
	context.fillStyle = "white"
	context.textAlign = "center"

	context.fillText("Level: " + level + " Hits: " + hits + "/" + levelHits + " Misses: " + misses + " Escaped: " + escapedMoles, canvasMiddleX, gameAreaHeight + 50)

	//Draw Timer Bar
	context.fillStyle = "green"
	drawTimer(0, canvas.height - 10, canvas.width, 10, timeRemainingFrames, timeTotalFrames, true)

}
function fillCanvas(color, alpha = 1.0) {
	context.fillStyle = color
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.globalAlpha = alpha
}
function drawDebugInfo() {
	context.font = "40px smw"
	context.fillStyle = "white"
	// Label indicating debug mode
	context.textAlign = "center"
	context.fillText("~DEBUG MODE~", canvasMiddleX, 40)
	// Mouse Position
	context.textAlign = "left"
	context.fillText("X: " + mouseX.toFixed(1), 5, 40)
	context.fillText("Y: " + mouseY.toFixed(1), 5, 80)

	// Current and next hitbox
	context.globalAlpha = 0.5
	context.fillStyle = "red"
	context.fillRect(mole.x, mole.y, mole.w, mole.h)
	context.fillStyle = "white"
	context.fillRect(mole.nextX, mole.nextY, mole.w, mole.h)
	context.globalAlpha = 1.0
}
