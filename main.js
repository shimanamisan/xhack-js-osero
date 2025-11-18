// ========================================
// 定数定義
// ========================================
const CONSTANTS = {
  STONE: {
    WHITE: 1,
    BLACK: 2,
    EMPTY: 0
  },
  BOARD: {
    SIZE: 8,
    FIELD_WIDTH: 320,
    FIELD_HEIGHT: 320,
    LINE_WIDTH: 1
  },
  STONE_RENDER: {
    CELL_SIZE: 40,
    OFFSET: 20,
    RADIUS: 18
  },
  DIRECTIONS: [
    { name: "上方向", x: 0, y: -1 },
    { name: "下方向", x: 0, y: 1 },
    { name: "左方向", x: -1, y: 0 },
    { name: "右方向", x: 1, y: 0 },
    { name: "左上方向", x: -1, y: -1 },
    { name: "左下方向", x: -1, y: 1 },
    { name: "右下方向", x: 1, y: 1 },
    { name: "右上方向", x: 1, y: -1 }
  ],
  DELAY: {
    CPU_TURN: 1000,
    GAME_END_CHECK: 1000
  }
};

// ========================================
// Board クラス（盤面状態管理）
// ========================================
class Board {
  constructor() {
    this.grid = this.createInitialGrid();
  }

  // 初期盤面を作成
  createInitialGrid() {
    const grid = Array(CONSTANTS.BOARD.SIZE)
      .fill(null)
      .map(() => Array(CONSTANTS.BOARD.SIZE).fill(CONSTANTS.STONE.EMPTY));

    // 初期配置（中央の4つの石）
    const center = CONSTANTS.BOARD.SIZE / 2;
    grid[center - 1][center - 1] = CONSTANTS.STONE.BLACK;
    grid[center - 1][center] = CONSTANTS.STONE.WHITE;
    grid[center][center - 1] = CONSTANTS.STONE.WHITE;
    grid[center][center] = CONSTANTS.STONE.BLACK;

    return grid;
  }

  // 指定座標に石を配置
  setStone(x, y, color) {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = color;
    }
  }

  // 指定座標の石を取得
  getStone(x, y) {
    return this.isValidPosition(x, y) ? this.grid[y][x] : null;
  }

  // 座標が盤面内かチェック
  isValidPosition(x, y) {
    return x >= 0 && x < CONSTANTS.BOARD.SIZE && y >= 0 && y < CONSTANTS.BOARD.SIZE;
  }

  // 盤面が満杯かチェック
  isFull() {
    for (let y = 0; y < CONSTANTS.BOARD.SIZE; y++) {
      for (let x = 0; x < CONSTANTS.BOARD.SIZE; x++) {
        if (this.grid[y][x] === CONSTANTS.STONE.EMPTY) {
          return false;
        }
      }
    }
    return true;
  }

  // 石の数をカウント
  countStones() {
    let white = 0;
    let black = 0;

    for (let y = 0; y < CONSTANTS.BOARD.SIZE; y++) {
      for (let x = 0; x < CONSTANTS.BOARD.SIZE; x++) {
        if (this.grid[y][x] === CONSTANTS.STONE.WHITE) {
          white++;
        } else if (this.grid[y][x] === CONSTANTS.STONE.BLACK) {
          black++;
        }
      }
    }

    return { white, black };
  }

  // 盤面を勝者の色で埋める（ゲーム終了時の演出）
  fillWithWinner(whiteCount, blackCount) {
    let remainingWhite = whiteCount;

    for (let y = 0; y < CONSTANTS.BOARD.SIZE; y++) {
      for (let x = 0; x < CONSTANTS.BOARD.SIZE; x++) {
        if (remainingWhite > 0) {
          this.grid[y][x] = CONSTANTS.STONE.WHITE;
          remainingWhite--;
        } else {
          this.grid[y][x] = CONSTANTS.STONE.BLACK;
        }
      }
    }
  }

  // 指定座標が空きマスかチェック
  isEmpty(x, y) {
    return this.getStone(x, y) === CONSTANTS.STONE.EMPTY;
  }

  // 石をひっくり返す
  flipStones(positions, color) {
    positions.forEach(({ x, y }) => {
      this.setStone(x, y, color);
    });
  }
}

// ========================================
// Renderer クラス（Canvas描画専任）
// ========================================
class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.blockSize = CONSTANTS.BOARD.FIELD_WIDTH / CONSTANTS.BOARD.SIZE;
  }

  // 盤面の初期化（グリッド線を描画）
  initialize() {
    this.drawGrid();
  }

  // グリッド線を描画
  drawGrid() {
    this.ctx.lineWidth = CONSTANTS.BOARD.LINE_WIDTH;
    this.ctx.strokeStyle = "black";

    for (let i = 1; i < CONSTANTS.BOARD.SIZE; i++) {
      const position = this.blockSize * i;

      // 横線
      this.ctx.beginPath();
      this.ctx.moveTo(0, position);
      this.ctx.lineTo(CONSTANTS.BOARD.FIELD_WIDTH, position);
      this.ctx.closePath();
      this.ctx.stroke();

      // 縦線
      this.ctx.beginPath();
      this.ctx.moveTo(position, 0);
      this.ctx.lineTo(position, CONSTANTS.BOARD.FIELD_HEIGHT);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  // 石を描画
  drawStone(x, y, color) {
    const fillColor = color === CONSTANTS.STONE.WHITE ? "white" : "black";
    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();

    const centerX = CONSTANTS.STONE_RENDER.OFFSET + x * CONSTANTS.STONE_RENDER.CELL_SIZE;
    const centerY = CONSTANTS.STONE_RENDER.OFFSET + y * CONSTANTS.STONE_RENDER.CELL_SIZE;

    this.ctx.arc(
      centerX,
      centerY,
      CONSTANTS.STONE_RENDER.RADIUS,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  // 盤面全体を再描画
  renderBoard(board) {
    for (let y = 0; y < CONSTANTS.BOARD.SIZE; y++) {
      for (let x = 0; x < CONSTANTS.BOARD.SIZE; x++) {
        const stone = board.getStone(x, y);
        if (stone !== CONSTANTS.STONE.EMPTY) {
          this.drawStone(x, y, stone);
        }
      }
    }
  }

  // クリック座標をグリッド座標に変換
  getGridPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - Math.floor(rect.left) - 2;
    const mouseY = event.clientY - Math.floor(rect.top) - 2;

    const gridX = Math.round((mouseX - CONSTANTS.STONE_RENDER.OFFSET) / CONSTANTS.STONE_RENDER.CELL_SIZE);
    const gridY = Math.round((mouseY - CONSTANTS.STONE_RENDER.OFFSET) / CONSTANTS.STONE_RENDER.CELL_SIZE);

    return { x: gridX, y: gridY };
  }
}

// ========================================
// CPU クラス（CPU思考ロジック）
// ========================================
class CPU {
  constructor(board, color) {
    this.board = board;
    this.color = color;
  }

  // CPUの色を設定
  setColor(color) {
    this.color = color;
  }

  // 石を置ける場所を検索
  findValidMoves() {
    const validMoves = [];

    for (let y = 0; y < CONSTANTS.BOARD.SIZE; y++) {
      for (let x = 0; x < CONSTANTS.BOARD.SIZE; x++) {
        if (this.board.isEmpty(x, y) && this.canPlaceStone(x, y)) {
          validMoves.push({ x, y });
        }
      }
    }

    return validMoves;
  }

  // 指定位置に石を置けるかチェック
  canPlaceStone(x, y) {
    if (!this.board.isEmpty(x, y)) {
      return false;
    }

    for (const direction of CONSTANTS.DIRECTIONS) {
      if (this.checkDirection(x, y, direction)) {
        return true;
      }
    }

    return false;
  }

  // 指定方向に石をひっくり返せるかチェック
  checkDirection(originX, originY, direction) {
    let x = originX + direction.x;
    let y = originY + direction.y;
    let foundOpponent = false;

    while (this.board.isValidPosition(x, y)) {
      const stone = this.board.getStone(x, y);

      if (stone === CONSTANTS.STONE.EMPTY) {
        return false;
      }

      if (stone === this.color) {
        return foundOpponent;
      }

      foundOpponent = true;
      x += direction.x;
      y += direction.y;
    }

    return false;
  }

  // ランダムに手を選択
  selectMove() {
    const validMoves = this.findValidMoves();

    if (validMoves.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
}

// ========================================
// OthelloGame クラス（ゲーム全体制御）
// ========================================
class OthelloGame {
  constructor() {
    this.board = new Board();
    this.renderer = new Renderer("canvas");
    this.cpu = new CPU(this.board, null);
    this.currentPlayer = null;
    this.cpuColor = null;
    this.isGameActive = false;

    this.initializeDOM();
    this.initializeEventListeners();
    this.renderer.initialize();
    this.renderer.renderBoard(this.board);
  }

  // DOM要素を初期化
  initializeDOM() {
    this.elements = {
      player: document.getElementById("player"),
      skip: document.getElementById("skip"),
      resetContainer: document.getElementById("reset"),
      resetButton: document.getElementById("resetButton"),
      gameContainer: document.querySelector(".container__innner"),
      gameSelectContainer: document.querySelector(".game__select__container"),
      gameStartForm: document.getElementById("gameStartTarget"),
      whiteScore: document.getElementById("white_score"),
      blackScore: document.getElementById("black_score"),
      canvas: document.getElementById("canvas")
    };
  }

  // イベントリスナーを初期化
  initializeEventListeners() {
    // ゲーム開始フォーム
    this.elements.gameStartForm.addEventListener("submit", (e) => this.handleGameStart(e));

    // スキップボタン
    this.elements.skip.addEventListener("click", () => this.handleSkip());

    // リセットボタン
    this.elements.resetButton.addEventListener("click", (e) => this.handleReset(e));

    // キャンバスクリック
    this.elements.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
  }

  // ゲーム開始処理
  handleGameStart(event) {
    event.preventDefault();

    const formList = this.elements.gameStartForm.player;
    const selectedValue = Number(formList.value);

    if (!selectedValue) {
      return;
    }

    if (selectedValue === CONSTANTS.STONE.WHITE) {
      // プレイヤーが後攻（白）
      this.currentPlayer = CONSTANTS.STONE.WHITE;
      this.cpuColor = CONSTANTS.STONE.BLACK;
      this.elements.player.innerHTML = "後攻（白）";

      // CPUが先攻なので先にCPUのターン
      this.cpu.setColor(this.cpuColor);
      setTimeout(() => this.executeCPUTurn(), CONSTANTS.DELAY.CPU_TURN);
    } else {
      // プレイヤーが先攻（黒）
      this.currentPlayer = CONSTANTS.STONE.BLACK;
      this.cpuColor = CONSTANTS.STONE.WHITE;
      this.elements.player.innerHTML = "先攻（黒）";
      this.cpu.setColor(this.cpuColor);
    }

    this.isGameActive = true;
    this.elements.gameContainer.style.opacity = 1;
    this.elements.gameSelectContainer.style.display = "none";
  }

  // キャンバスクリック処理
  handleCanvasClick(event) {
    if (!this.isGameActive) {
      return;
    }

    const { x, y } = this.renderer.getGridPosition(event);

    if (!this.placeStone(x, y, this.currentPlayer)) {
      return;
    }

    this.renderer.drawStone(x, y, this.currentPlayer);

    // ゲーム終了チェックとCPUターン
    setTimeout(() => {
      if (this.checkGameEnd()) {
        return;
      }
      this.executeCPUTurn();
    }, CONSTANTS.DELAY.GAME_END_CHECK);
  }

  // 石を配置
  placeStone(x, y, color) {
    if (!this.board.isEmpty(x, y)) {
      alert("既に石が置かれています。");
      return false;
    }

    const flippableStones = this.getFlippableStones(x, y, color);

    if (flippableStones.length === 0) {
      return false;
    }

    // 石を配置
    this.board.setStone(x, y, color);

    // 石をひっくり返す
    this.board.flipStones(flippableStones, color);
    this.renderer.renderBoard(this.board);

    return true;
  }

  // ひっくり返せる石を取得
  getFlippableStones(originX, originY, color) {
    const allFlippable = [];

    CONSTANTS.DIRECTIONS.forEach((direction) => {
      const flippable = [];
      let x = originX + direction.x;
      let y = originY + direction.y;

      while (this.board.isValidPosition(x, y)) {
        const stone = this.board.getStone(x, y);

        if (stone === CONSTANTS.STONE.EMPTY) {
          break;
        }

        if (stone === color) {
          if (flippable.length > 0) {
            allFlippable.push(...flippable);
          }
          break;
        }

        flippable.push({ x, y });
        x += direction.x;
        y += direction.y;
      }
    });

    return allFlippable;
  }

  // CPUのターンを実行
  executeCPUTurn() {
    const move = this.cpu.selectMove();

    if (!move) {
      alert("CPUは石を置ける場所がありませんでした。");
      return;
    }

    this.placeStone(move.x, move.y, this.cpuColor);

    setTimeout(() => {
      this.checkGameEnd();
    }, CONSTANTS.DELAY.GAME_END_CHECK);
  }

  // スキップ処理
  handleSkip() {
    const confirmed = confirm("自分の順番をスキップしますか？");

    if (confirmed) {
      this.executeCPUTurn();
    }
  }

  // リセット処理
  handleReset(event) {
    event.preventDefault();
    location.reload();
  }

  // ゲーム終了チェック
  checkGameEnd() {
    if (!this.board.isFull()) {
      return false;
    }

    alert("ゲームを終了します！");
    this.isGameActive = false;

    const { white, black } = this.board.countStones();

    this.elements.whiteScore.innerHTML = white;
    this.elements.blackScore.innerHTML = black;
    this.elements.resetContainer.style.display = "block";
    this.elements.skip.style.display = "none";

    this.board.fillWithWinner(white, black);
    this.renderer.renderBoard(this.board);

    return true;
  }
}

// ========================================
// 初期化処理
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  new OthelloGame();
});
