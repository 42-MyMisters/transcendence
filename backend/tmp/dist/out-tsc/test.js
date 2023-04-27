var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        return __awaiter(this, void 0, void 0, function () {
            var interval;
            var _this = this;
            return __generator(this, function (_a) {
                interval = setInterval(function () {
                    _this.update();
                    if (_this.isRunning() == false) {
                        // save data to db
                        clearInterval(interval);
                    }
                }, this.fps);
                return [2 /*return*/];
            });
        });
    };
    Game.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.time += this.fps;
                if (this.time > 0 && this.isRunning() == true) {
                    this.ballX += this.ballSpeedX;
                    this.ballY += this.ballSpeedY;
                    console.log("update: id: ".concat(this.id, ", time: ").concat(this.time, ", ").concat(this.ballX, ", ").concat(this.ballY));
                }
                if (this.p1_score > this.score_max || this.p2_score > this.score_max) {
                    this.running = false;
                }
                return [2 /*return*/];
            });
        });
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
while (Date.now() - now < 10000) {
}
(_b = map.get(2)) === null || _b === void 0 ? void 0 : _b.gameStart();
console.log('dddddddddd');
//# sourceMappingURL=test.js.map