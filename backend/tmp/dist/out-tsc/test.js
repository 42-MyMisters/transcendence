var _a;
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
        this.now = Date.now();
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
            console.log("update: id: ".concat(this.id, ", ingame time: ").concat(this.time, ", time from start: ").concat(Date.now() - this.now));
        }
        if (this.p1_score > this.score_max || this.p2_score > this.score_max) {
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
var map = new Map();
map.set(1, new Game(1));
map.set(2, new Game(2));
(_a = map.get(1)) === null || _a === void 0 ? void 0 : _a.gameStart();
setTimeout(function () {
    var _a;
    (_a = map.get(2)) === null || _a === void 0 ? void 0 : _a.gameStart();
}, 5000);
console.log('dddddddddd');
//# sourceMappingURL=test.js.map