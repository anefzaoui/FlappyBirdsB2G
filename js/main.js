var DEBUG = false;
var SPEED = 250;
var GRAVITY = 20;
var FLAP = 300;
var SPAWN_RATE = 1 / 1;
var OPENING = 100;


function main() {

	var state = {
		preload: preload,
		create: create,
		update: update,
		render: render
	};

	var parent = document.querySelector('#screen');

	var game = new Phaser.Game(
		0,
		0,
		Phaser.CANVAS,
		parent,
		state,
		false,
		false
	);

	function preload() {
		var assets = {
			spritesheet: {
				birdie: ['assets/movingbirdie.png', 34, 32],
				clouds: ['assets/clouds.png', 128, 64]
			},
			image: {
				finger: ['assets/tunnel.png'],
				redfinger: ['assets/shitjustgotreal.png'],
				fence: ['assets/fences.png'],
				daybg: ['assets/day.png'],
				nightbg: ['assets/night.png'],
				gameOverText: ['assets/gameover.png'],
				getReady: ['assets/getready.png'],
				board: ['assets/board.png'],
				tuto: ['assets/tuto.png']
			},
			audio: {
				flap: ['assets/res/sfx_wing.ogg'],
				score: ['assets/res/sfx_point.ogg'],
				hurt: ['assets/res/sfx_hit.ogg']
			}
		};
		Object.keys(assets).forEach(function(type) {
			Object.keys(assets[type]).forEach(function(id) {
				game.load[type].apply(game.load, [id].concat(assets[type][id]));
			});
		});
	}

	var gameStarted,
		gameOver,
		score,
		bg,
		credits,
		clouds,
		fingers,
		invs,
		birdie,
		fence,
		scoreText,
		instText,
		gameOverText,
		gameOverScore,
		flapSnd,
		scoreSnd,
		hurtSnd,
		fingersTimer,
		cloudsTimer,
		dnBg,
		gameOverT,
		getReady,
		gameOverScore,
		board,
		tunnel,
		tuto;

	function create() {
		// Set world dimensions
		var screenWidth = parent.clientWidth > window.innerWidth ? window.innerWidth : parent.clientWidth;
		var screenHeight = parent.clientHeight > window.innerHeight ? window.innerHeight : parent.clientHeight;
		game.world.width = screenWidth;
		game.world.height = screenHeight;
		// Add Day Background
		var hr = (new Date()).getHours();
		if((hr >= 7) && (hr <= 17)){
			dnBg = game.add.tileSprite(0, 0, game.world.width, game.world.height - 32, 'daybg');
		}
		else{
			dnBg = game.add.tileSprite(0, 0, game.world.width, game.world.height - 32, 'nightbg');
		}
		
		// Credits 'yo
		credits = game.add.text(
			game.world.width / 2,
			10,
			'',
			{
				font: '8px "Press Start 2P"',
				fill: '#fff',
				align: 'center'
			}
		);
		credits.anchor.x = 0.5;
		// Add clouds group
		clouds = game.add.group();
		// Add fingers
		fingers = game.add.group();
		// Add invisible thingies
		invs = game.add.group();
		// Add birdie
		birdie = game.add.sprite(0, 0, 'birdie');
		birdie.anchor.setTo(0.5, 0.5);
		birdie.animations.add('fly', [0, 1, 2], 10, true);
		birdie.inputEnabled = true;
		birdie.body.collideWorldBounds = true;
		birdie.body.gravity.y = GRAVITY;
		// Add fence
		fence = game.add.tileSprite(0, game.world.height - 32, game.world.width, 32, 'fence');
		fence.tileScale.setTo(1, 1);
		// Add score text
		scoreText = game.add.text(
			game.world.width / 2,
			game.world.height / 4,
			"",
			{
				font: '12px "Press Start 2P"',
				fill: '#fff',
				stroke: '#000',
				strokeThickness: 4,
				align: 'center'
			}
		);
		scoreText.anchor.setTo(0.5, 0.5);
		// Add instructions text
		instText = game.add.text(
			game.world.width / 2,
			game.world.height - game.world.height / 4,
			"",
			{
				font: '8px "Press Start 2P"',
				fill: '#fff',
				stroke: '#000',
				strokeThickness: 4,
				align: 'center'
			}
		);
		instText.anchor.setTo(0.5, 0.5);
		gameOverT = game.add.tileSprite((game.world.width / 2) - 98,(game.world.height / 2) - 80, 192, 50, 'gameOverText');
		board = game.add.tileSprite((game.world.width / 2) - 116,(game.world.height / 2) - 20, 233, 117, 'board');
		getReady = game.add.tileSprite((game.world.width / 2) - 98,(game.world.height / 2) - 180, 192, 50, 'getReady');
		tuto = game.add.tileSprite((game.world.width / 2) - 70,(game.world.height / 2) - 120, 119, 102, 'tuto');
		
		// Add game over text
		gameOverText = game.add.text(
			game.world.width / 2 + 73,
			game.world.height / 2 + 70,
			"",
			{
				font: '8px "Press Start 2P"',
				fill: '#fff',
				stroke: '#000',
				strokeThickness: 1,
				align: 'center'
			}
		);
		// Add game over text
		gameOverScore = game.add.text(
			game.world.width / 2 + 73,
			game.world.height / 2 + 27,
			"",
			{
				font: '8px "Press Start 2P"',
				fill: '#fff',
				stroke: '#000',
				strokeThickness: 1,
				align: 'center'
			}
		);

		gameOverText.anchor.setTo(0.5, 0.5);
		gameOverText.scale.setTo(2, 2);
		// Add sounds
		flapSnd = game.add.audio('flap');
		scoreSnd = game.add.audio('score');
		hurtSnd = game.add.audio('hurt');
		// Add controls
		game.input.onDown.add(flap);
		// Start clouds timer
		cloudsTimer = new Phaser.Timer(game);
		cloudsTimer.onEvent.add(spawnCloud);
		cloudsTimer.start();
		cloudsTimer.add(Math.random());
		// RESET!
		reset();
	}

	function reset() {
		gameStarted = false;
		gameOver = false;
		score = 0;
		credits.renderable = true;
		gameOverT.renderable = false;
		board.renderable = false;
		gameOverText.renderable = false;
		gameOverScore.renderable = false;
		birdie.body.allowGravity = false;
		birdie.angle = 0;
		birdie.reset(game.world.width / 4, game.world.height / 2);
		birdie.scale.setTo(1, 1);
		birdie.animations.play('fly');
		fingers.removeAll();
		invs.removeAll();
	}

	function start() {
		gameOverT.renderable = false;
		board.renderable = false;
		credits.renderable = false;
		birdie.body.allowGravity = true;
		// SPAWN FINGERS!
		fingersTimer = new Phaser.Timer(game);
		fingersTimer.onEvent.add(spawnFingers);
		fingersTimer.start();
		fingersTimer.add(1);
		// Show score
		scoreText.setText(score);
		instText.renderable = false;
		getReady.renderable = false;
		tuto.renderable = false;
		// START!
		gameStarted = true;
	}

	function flap() {
		if (!gameStarted) {
			start();
		}
		if (!gameOver) {
			birdie.body.velocity.y = -FLAP;
			flapSnd.play();
			
		}
	}

	function spawnCloud() {
		cloudsTimer.stop();

		var cloudY = Math.random() * game.height / 2;
		var cloud = clouds.create(
			game.width,
			cloudY,
			'clouds',
			Math.floor(4 * Math.random())
		);
		var cloudScale = 2 + 2 * Math.random();
		cloud.alpha = 2 / cloudScale;
		cloud.scale.setTo(cloudScale, cloudScale);
		cloud.body.allowGravity = false;
		cloud.body.velocity.x = -SPEED / cloudScale;
		cloud.anchor.y = 0;

		cloudsTimer.start();
		cloudsTimer.add(4 * Math.random());
	}

	function o() {
		return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
	}

	function spawnFinger(fingerY, flipped) {
		var tunnel = "finger";
		if (score>=15) tunnel = "redfinger";
		var finger = fingers.create(
			game.width,
			fingerY + (flipped ? -o() : o()) / 2,
			tunnel
		);
		finger.body.allowGravity = false;

		// Flip finger! *GASP*
		finger.scale.setTo(1.5, flipped ? -2 : 2);
		finger.body.offset.y = flipped ? -finger.body.height * 2 : 0;

		// Move to the left
		finger.body.velocity.x = -SPEED+5;

		return finger;
	}

	function spawnFingers() {
		fingersTimer.stop();

		var fingerY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
		// Bottom finger
		var botFinger = spawnFinger(fingerY);
		// Top finger (flipped)
		var topFinger = spawnFinger(fingerY, true);

		// Add invisible thingy
		var inv = invs.create(topFinger.x + topFinger.width, 0);
		inv.width = 2;
		inv.height = game.world.height;
		inv.body.allowGravity = false;
		inv.body.velocity.x = -SPEED;

		fingersTimer.start();
		fingersTimer.add(1 / SPAWN_RATE);
	}

	function addScore(_, inv) {
		invs.remove(inv);
		score += 1;
		scoreText.setText(score);
		scoreSnd.play();
	}
/* ********************** Game over ******************************* */
	function setGameOver() {
		gameOver = true;
		var hiscore = window.localStorage.getItem('hiscore');
		hiscore = hiscore ? hiscore : score;
		hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
		window.localStorage.setItem('hiscore', hiscore);
		gameOverT.renderable = true;
		board.renderable = true;
		gameOverText.setText(hiscore);
		gameOverText.renderable = true;
		
		gameOverScore.anchor.setTo(0.5, 0.5);
		gameOverScore.scale.setTo(2, 2);
		gameOverScore.setText(score);
		gameOverScore.renderable = true;
		// Stop all fingers
		fingers.forEachAlive(function(finger) {
			finger.body.velocity.x = 0;
		});
		invs.forEach(function(inv) {
			inv.body.velocity.x = 0;
		});
		// Stop spawning fingers
		fingersTimer.stop();
		// Make birdie reset the game
		birdie.events.onInputDown.addOnce(reset);
		hurtSnd.play();
	}

	function update() {
		if (gameStarted) {
			// Make birdie dive
			var dvy = FLAP + birdie.body.velocity.y;
			birdie.angle = (90 * dvy / FLAP) - 180;
			if (birdie.angle < -30) {
				birdie.angle = -30;
			}
			if (
				gameOver ||
				birdie.angle > 90 ||
				birdie.angle < -90
			) {
				birdie.angle = 90;
				birdie.animations.stop();
				birdie.frame = 3;
			} else {
				birdie.animations.play('fly');
			}
			// Birdie is DEAD!
			if (gameOver) {
				if (birdie.scale.x < 4) {
					birdie.scale.setTo(1.5, 1.5);
				}
			} else {
				// Check game over
				game.physics.overlap(birdie, fingers, setGameOver);
				if (!gameOver && birdie.body.bottom >= game.world.bounds.bottom) {
					setGameOver();
				}
				// Add score
				game.physics.overlap(birdie, invs, addScore);
			}
			// Remove offscreen fingers
			fingers.forEachAlive(function(finger) {
				if (finger.x + finger.width < game.world.bounds.left) {
					finger.kill();
				}
			});
			// Update finger timer
			fingersTimer.update();
		} else {
			birdie.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
		}
		if (!gameStarted || gameOver) {
			// Shake instructions text
			instText.scale.setTo(
				2 + 0.1 * Math.sin(game.time.now / 100),
				2 + 0.1 * Math.cos(game.time.now / 100)
			);
		}
		// Shake score text
		scoreText.scale.setTo(
			2 + 0.1 * Math.cos(game.time.now / 100),
			2 + 0.1 * Math.sin(game.time.now / 100)
		);
		// Update clouds timer
		cloudsTimer.update();
		// Remove offscreen clouds
		clouds.forEachAlive(function(cloud) {
			if (cloud.x + cloud.width < game.world.bounds.left) {
				cloud.kill();
			}
		});
		// Scroll fence and background
		if (!gameOver) {
			fence.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
			dnBg.tilePosition.x -= game.time.physicsElapsed * SPEED / 8;
			
			
			
		}
	}

	function render() {
		if (DEBUG) {
			game.debug.renderSpriteBody(birdie);
			fingers.forEachAlive(function(finger) {
				game.debug.renderSpriteBody(finger);
			});
			invs.forEach(function(inv) {
				game.debug.renderSpriteBody(inv);
			});
		}
	}

};

window.addEventListener('load', function readerOnLoad(evt) {
  window.removeEventListener('load', readerOnLoad);
  main();  
});
