// ゲームスタート時に表示・非表示する要素を取得
let player = document.getElementById("player");
let skipDOM = document.getElementById("skip");
let resetDOM = document.getElementById("reset");
let gameContainer = document.querySelector(".container__innner");
let gameSelectContainer = document.querySelector(".game__select__container");
// fomr要素を取得
const gameStartElement = document.getElementById("gameStartTarget");
// form要素内のラジオボタングループを取得
let formList = gameStartElement.player;
let WHITE = 1; // 後攻
let BLACK = 2; // 先攻
let currentPlayer = null;
let cpuColor = null;

// ゲームの進行やcanvas要素の描画を管理するクラス
class GameManagement {
  constructor(FIELD_WIDTH, FIELD_HEIGHT, LINEWIDTH) {
    this.FIELD_WIDTH = FIELD_WIDTH; // マスのサイズ（横幅）
    this.FIELD_HEIGHT = FIELD_HEIGHT; // マスのサイズ（高さ）
    this.BLOCK_SIZE = FIELD_WIDTH / 8; // 碁盤の目のサイズ
    this.LINEWIDTH = LINEWIDTH; // 線の太さ
    this.white = 0;
    this.black = 0;
    this.ctx = null;
    this.color = null;
    this.debug_flg = true; // デバッグしたときはtrueにする
  }
  // デバッグ関数
  debug(str) {
    if (this.debug_flg) {
      console.log(str);
    }
  }
  // canvas要素を取得する関数
  getCTX() {
    // canvas要素を取得する
    const canvas = document.getElementById("canvas");
    // getContext()メソッドを使ってコンテキストというオブジェクトを取得する
    // canvas要素に対して線や円を書いたり、操作することが出来るいろいろなメソッドを持っている
    this.ctx = canvas.getContext("2d");
  }
  // 行の線を描画する関数
  getLineW(x) {
    this.ctx.beginPath(); // 経路の開始
    this.ctx.moveTo(0, x); // どの地点から
    this.ctx.lineTo(this.FIELD_WIDTH, x); // どの地点までか
    this.ctx.closePath(); // 経路の終了
    this.ctx.stroke();
  }
  // 列の線を描画する
  getLineH(y) {
    this.ctx.beginPath(); // 経路の開始
    this.ctx.moveTo(y, 0); // どの地点から
    this.ctx.lineTo(y, this.FIELD_HEIGHT); // どの地点までか
    this.ctx.closePath(); // 経路の終了
    this.ctx.stroke();
  }
  // ゲームの初期化
  init() {
    this.getCTX();
    // 盤面の線を描画する
    for (let k = 1; k < 8; k++) {
      this.getLineW(this.BLOCK_SIZE * k);
      this.getLineH(this.BLOCK_SIZE * k);
    }
  }
  // 座標を指定して石を置く関数
  drawStone(x, y, stonColor) {
    // 定数の値からcanvas要素に描画する色を判定
    this.color = stonColor === WHITE ? "white" : "black";
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.debug(x * 50 + 25);
    this.debug(2 * Math.PI);
    this.ctx.arc(20 + x * 40, 20 + y * 40, 18, 0, 2 * Math.PI);
    this.ctx.fill();
  }
  // ゲーム終了時に石の数を数える関数
  countStones() {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (board[y][x] === 1) {
          this.white++;
        } else if (board[y][x] === 2) {
          this.black++;
        }
      }
    }
  }
  // 数えた数を元に石を配置する関数
  stonesRelocation() {
    // 最初にHTMLに個数を表示する
    const black_score = document.getElementById("black_score");
    const white_score = document.getElementById("white_score");
    black_score.innerHTML = this.black;
    white_score.innerHTML = this.white;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.white > 0) {
          board[y][x] = 1;
          this.white--;
        } else {
          board[y][x] = 2;
          this.black--;
        }
      }
    }
  }
}

// CPU機能をまとめたクラス
class CpuManagement {
  constructor() {
    this.cpu_debug_flg = false; // デバッグしたときはtrueにする
  }

  // CPU機能のデバッグを行う専用の関数
  cpuDebug(str) {
    if (this.cpu_debug_flg) {
      console.log(str);
    }
  }

  // CPU用のオセロ配置出来る場所を検索するメソッド
  cpuPutSearchStone(X, Y, cpuColor, cpuDirections) {
    // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
    directions.forEach((direction) => {
      this.cpuDebug(`CPUが検索するボードの座標 X:${X}  Y:${Y}`);
      let x = X;
      let y = Y;
      // 自分がいま置いた石の色を格納しておく
      // 次の配列に格納された石が自分と異なる色の石ならひっくり返せる可能性がある
      const stones = [cpuColor];

      // 既に石が配置されている箇所は検索を停止する
      if (board[y][x] !== 0) {
        return;
      }

      // 最大7回繰り返す
      for (let i = 1; i <= 7; i++) {
        // cpuDebug(`座標を元にループを開始: ${i}回目`);
        x += direction.x;
        y += direction.y;

        // 検索する配列の個数を超えたらループ処理を抜ける
        if (x > 7 || x < 0 || y > 7 || y < 0) {
          break;
        }

        // 何も置いていないマスだったら処理を抜ける
        if (board[y][x] === 0) {
          break;
        }

        stones.push(board[y][x]);

        // 次の石がプレーヤーと同じ色だったら処理を停止する
        if (stones[1] === cpuColor) {
          return;
        }

        // 先頭以外で自分と同じ色の石の情報が出た場合はそのループを抜ける
        if (board[y][x] === cpuColor) {
          break;
        }
        this.cpuDebug(`ループ処理終了`);
      }

      // 配列が一つしかな場合はひっくり返せる石がないのでループを停止
      if (stones.length <= 1) {
        return;
      }

      // 先頭が自分の石と違う場合は処理を停止
      if (stones[0] !== cpuColor) {
        return;
      }

      // 末尾は必ず自分と同じ色である必要がある
      let lastIndex = stones.length - 1;
      if (stones[lastIndex] === cpuColor) {
        cpuDirections.push({ X, Y });
        return;
      }
    });
    return cpuDirections;
  }

  // CPUが石を置く関数
  cpuDrawStone() {
    // CPUが石を置ける座標（オブジェクト）を格納する配列
    const cpuDirections = [];
    // cpuPutSearchStonw関数の結果を受け取る変数
    let searchresult = null;
    // 盤面を一つずつ検索する
    for (let Y = 0; Y < 8; Y++) {
      for (let X = 0; X < 8; X++) {
        // 石を置ける場所を検索する関数（戻り値に配列を受け取る）
        searchresult = this.cpuPutSearchStone(X, Y, cpuColor, cpuDirections);
      }
    }
    // 配列が空だった場合は石を置ける場所がないので、メッセージを出力する
    if (searchresult.length === 0) {
      alert("CPUは石を置ける場所がありませんでした。");
      return;
    }

    // 検索された座標を元にランダムで配置する
    let searchLength = Math.floor(Math.random() * searchresult.length);
    let cpuPosX;
    let cpuPosY;
    cpuPosX = searchresult[searchLength].X;
    cpuPosY = searchresult[searchLength].Y;

    canPutStone(cpuPosX, cpuPosY, cpuColor);

    // 石が描画されたあとにゲーム終了のメッセージを表示したいので、
    // ここの処理は非同期処理にしてメインスレッドから処理を切り離しておく
    setTimeout(() => {
      if (board.check()) {
        alert("ゲームを終了します！");
        resetDOM.style.display = "block";
        skipDOM.style.display = "none";
        gameMNG.countStones();
        gameMNG.stonesRelocation();
        board.reflesh();
        return;
      }
    }, 1000);
  }
}

// ゲーム進行クラスをインスタンス化
const gameMNG = new GameManagement(320, 320, 1);
gameMNG.init();

// CPUクラスをインスタンス化
const cpuMNG = new CpuManagement();

// ゲームスタートボタンをクリックしたらゲームを開始する関数
function gameStart(event) {
  event.preventDefault();
  gameMNG.debug(formList.value);
  if (formList.value === "1") {
    // 選択状態の値（value）を取得し文字列型から数値型へ変換
    WHITE = Number(formList.value);
    initCurrentPlayer(WHITE);
    // プレーヤーが後攻だった場合はCPUが先攻として実行
    cpuColor = BLACK;
    setTimeout(() => {
      cpuMNG.cpuDrawStone();
    }, 1000);
  } else if (formList.value === "2") {
    BLACK = Number(formList.value);
    initCurrentPlayer(BLACK);
    cpuColor = WHITE;
  } else {
    gameMNG.debug("error");
    return;
  }
  gameContainer.style.opacity = 1;
  gameSelectContainer.style.display = "none";
}

// ゲームスタート時に石を選択する
function initCurrentPlayer(val) {
  if (val === 2) {
    currentPlayer = val;
    player.innerHTML = "先攻（黒）";
  } else {
    currentPlayer = val;
    player.innerHTML = "後攻（白）";
  }
}

// オセロを置けなかった場合にスキップする
function skip() {
  let checked = confirm("自分の順番をスキップしますか？");
  if (checked === true) {
    cpuMNG.cpuDrawStone();
    return true;
  } else {
    return false;
  }
}

// 画面をリロードしてゲームをリセットする
function reset(event) {
  event.preventDefault();
  location.reload();
}

// 座標の移動を管理するオブジェクト
const directions = [
  { name: "上方向", x: 0, y: -1 },
  { name: "下方向", x: 0, y: 1 },
  { name: "左方向", x: -1, y: 0 },
  { name: "右方向", x: 1, y: 0 },
  { name: "左上方向", x: -1, y: -1 },
  { name: "左下方向", x: -1, y: 1 },
  { name: "右下方向", x: 1, y: 1 },
  { name: "右上方向", x: 1, y: -1 },
];

// オセロの配置を管理する配列
const board = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// オブジェクトに新しくメソッドを追加（配置された石を描画する）
board.reflesh = () => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[y][x] === 1) {
        gameMNG.drawStone(x, y, WHITE);
      } else if (board[y][x] === 2) {
        gameMNG.drawStone(x, y, BLACK);
      }
    }
  }
};

// ボードの数を毎回数えておける場所がなくなったらゲームを終了する
board.check = () => {
  let end_flg = false;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[y][x] === 0) {
        gameMNG.debug("0が見つかりました");
        return (end_flg = false);
      } else {
        gameMNG.debug("0が見つかりませんでした。ゲームを終了します。");
        end_flg = true;
      }
    }
  }
  return end_flg;
};

// オセロをひっくり返す関数
board.turnOver = (currentCoordinate, board, currentColor) => {
  try {
    // currentCoordinate：ひっくり返す石の座標が格納されている
    currentCoordinate.forEach((item) => {
      board[item.y][item.x] = currentColor;
    });
    board.reflesh();
  } catch (e) {
    gameMNG.debug(e);
  }
};

// 配置されたオセロを描画する
board.reflesh();

// クリックしたときに石を置けるようになる
canvas.onclick = (event) => {
  gameMNG.debug("プレーヤーのターン");
  gameMNG.debug(" ");
  // 要素の寸法とそのビューポートに対する位置を返す
  // 左上の座標を（0, 0）起点として、要素の左上の位置をtop, left, bottom, right などで指定したり取得したりする
  // DOMRectというオブジェクトの中に {top: xxx, left: xxx ...} のようにそのクリックした要素の座標が取得されている
  // ここでは盤の大枠の要素の高さや座標が取得されている
  const rect = event.target.getBoundingClientRect();
  // 要素の寸法から補正する
  // event.clientX クリックした要素のX座標の位置（ここではcanvas要素内）
  // event.clientY クリックした要素のY座標の位置（ここではcanvas要素内）
  mouseX = event.clientX - Math.floor(rect.left) - 2;
  mouseY = event.clientY - Math.floor(rect.top) - 2;
  const posX = Math.round((mouseX - 20) / 40);
  const posY = Math.round((mouseY - 20) / 40);

  // 既に石が置かれていたら処理を停止
  if (!canPutStone(posX, posY, currentPlayer)) {
    return;
  }
  gameMNG.drawStone(posX, posY, currentPlayer);

  // 石が描画されたあとにゲーム終了のメッセージを表示したいので、
  // ここの処理は非同期処理にしてメインスレッドから処理を切り離しておく
  setTimeout(() => {
    if (board.check()) {
      alert("ゲームを終了します！");
      resetDOM.style.display = "block";
      skipDOM.style.display = "none";
      gameMNG.countStones();
      gameMNG.stonesRelocation();
      board.reflesh();
      return;
    } else {
      cpuMNG.cpuDrawStone();
    }
  }, 1000);
};

// 石が置けるか判定する
function canPutStone(originX, originY, currentColor) {
  let canReverse = false; // ひっくり返せるかのフラグ

  if (board[originY][originX] !== 0) {
    alert("既に石が置かれています。");
    return false;
  }

  // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
  directions.forEach((direction) => {
    gameMNG.debug(`オセロを置いた座標 Y:${originY}  X:${originX}`);
    let x = originX;
    let y = originY;
    const currentCoordinate = []; // ひっくり返せる座標のオブジェクト格納する配列
    const stones = [currentColor]; // 自分がいま置いた石の色

    // 最大7回繰り返す
    for (let i = 1; i <= 7; i++) {
      // 盤面をクリックした座標（originY, originX）の値を基準に縦横斜めにオセロが置かれているのか判定する（directionsオブジェクトを使用）
      // y:4 x:4 に配置した場合に左方向に検索していく際は、x:3, x:2, x:1, x:0 とループしていき、x:-1 になったらループを抜ける
      // y軸に対しても同様の処理を行う
      x += direction.x;
      y += direction.y;
      gameMNG.debug(`${direction.name} 盤面を検索しています: x:${x} y:${y}`);

      // 検索する配列の個数を超えたらループ処理を抜ける
      if (x > 7 || x < 0 || y > 7 || y < 0) {
        break;
      }

      // 何も置いていないマスだったら処理を抜ける
      if (board[y][x] === 0) {
        break;
      }
      // 盤面の石の配置情報を配列に追加
      gameMNG.debug("盤面の石の配置情報を配列に追加");
      stones.push(board[y][x]);
      currentCoordinate.push({ y, x });
      gameMNG.debug(stones);
      gameMNG.debug(currentCoordinate);

      // 先頭の次の石がプレーヤーと同じ色だったら処理を停止する
      if (stones[1] === currentColor) {
        return;
      }

      // 先頭以外で自分と同じ色の石の情報が出た場合はそのループを抜ける
      if (board[y][x] === currentColor) {
        break;
      }
    }

    // 配列が一つしかな場合はひっくり返せる石がないのでループを停止
    if (stones.length <= 1) {
      return;
    }

    // 末尾は必ず自分と同じ色である必要がある
    let lastIndex = stones.length - 1;
    if (stones[lastIndex] === currentColor) {
      board[originY][originX] = currentColor;
      // ひっくり返す処理をまとめた関数
      board.turnOver(currentCoordinate, board, currentColor);
      canReverse = true;
    }
  });
  gameMNG.debug("  ");
  return canReverse;
}
