var _a, _b;
var Game = /** @class */ (function () {
    function Game(id) {
        this.fps = 41;
        this.canvasWidth = 600;
        this.canvasHeight = 400;
        this.ballRadius = 10;
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddleSpeed = 10;
        this.ballSpeedX = 5;
        this.ballSpeedY = 0;
        this.score_max = 5;
        this.id = id;
        this.ballX = 50;
        this.ballY = 50;
        this.paddle1Y = 250;
        this.paddle2Y = 250;
        this.running = true;
        this.time = -3000;
        this.p1_score = 0;
        this.p2_score = 0;
    }
    Game.prototype.isRunning = function () {
        return this.running;
    };
    Game.prototype.gameStart = function () {
        var _this = this;
        var interval = setInterval(function () {
            _this.update();
            if (_this.isRunning() == false) {
                // save data to db
                clearInterval(interval);
            }
        }, this.fps);
    };
    Game.prototype.update = function () {
        this.time += this.fps;
        if (this.time > 0 && this.isRunning() == true) {
            this.ballX += this.ballSpeedX;
            this.ballY += this.ballSpeedY;
            console.log("update: ".concat(this.time, ", ").concat(this.ballX, ", ").concat(this.ballY));
            this.p1_score += 1;
        }
        if (this.p1_score == this.score_max || this.p2_score == this.score_max) {
            this.running = false;
        }
    };
    Game.prototype.collisionDetect = function () {
    };
    Game.prototype.getState = function () {
        return {
            ballX: this.ballX,
            ballY: this.ballY,
            paddle1Y: this.paddle1Y,
            paddle2Y: this.paddle2Y,
        };
    };
    return Game;
}());
// const game = new Game(1);
// const interval = setInterval(() => {
//   game.update();
//   if (game.tmp > 10) {
//     clearInterval(interval);
//   }
// }, 500);
// let ballX = 0;
// let ballY = 0;
// let tmp = 0;
// function update() {
//   if (tmp < 100) {
//       console.log(`update: ${tmp}, ${ballX}, ${ballY}`);
//       tmp += 1
//       ballX += 1
//       ballY += 1
//   }
// }
var map = new Map();
// const map = new Map<number, Game>();
map.set(1, new Game(1));
map.set(2, new Game(2));
(_a = map.get(1)) === null || _a === void 0 ? void 0 : _a.gameStart();
var now = Date.now();
console.log('asdfasdfasdf');
console.log('asdfasdfasdf');
while (Date.now() - now < 3000) {
}
(_b = map.get(2)) === null || _b === void 0 ? void 0 : _b.gameStart();
console.log('asdfasdfasdf');
console.log('dddddddddd');
