/*****************************************
デバッグ関数
******************************************/
cpu_debug_flg = true;
debug_flg = false;
function cpuDebug(str) {
  if (cpu_debug_flg) {
    console.log(str);
  }
}
function debug(str) {
  if (debug_flg) {
    console.log(str);
  }
}

// canvas要素を取得する
const canvas = document.getElementById("canvas");
// getContext()メソッドを使ってコンテキストというオブジェクトを取得する
// canvas要素に対して線や円を書いたり、操作することが出来るいろいろなメソッドを持っている
const ctx = canvas.getContext("2d");
// ゲームスタート時に表示・非表示する要素を取得
let player = document.getElementById("player");
let gameContainer = document.querySelector(".container__innner");
let gameStartContainer = document.querySelector(".game__select__container");
// fomr要素を取得
const gameStartElement = document.getElementById("gameStartTarget");
// form要素内のラジオボタングループを取得
let formList = gameStartElement.player;

// マスのサイズ
const FIELD_WIDTH = 400;
const FIELD_HEIGHT = 400;
// 碁盤の目のサイズ
const BLOCK_SIZE = FIELD_WIDTH / 8;
let WHITE = 1; // 1
let BLACK = 2; // 2
let currentPlayer = null;
let cpuColor = null;

// ゲームをスタートする
function gameStart(event) {
  event.preventDefault();
  console.log(formList.value);
  if (formList.value === "1") {
    // 選択状態の値（value）を取得
    WHITE = Number(formList.value);
    initCurrentPlayer(WHITE);
    // プレーヤーが後攻だった場合はCPUが先攻として実行
    cpuColor = BLACK;
    cpuDwawSrone();
  } else if (formList.value === "2") {
    BLACK = Number(formList.value);
    initCurrentPlayer(BLACK);
    cpuColor = WHITE;
  } else {
    console.log("error");
    return;
  }
  gameContainer.style.opacity = 1;
  gameStartContainer.style.display = "none";
}

// オセロを置けなかった場合にスキップする
function skip(event) {
  event.preventDefault();
  cpuDwawSrone();
}

// ボードの数を毎回数えておける場所がなくなったらゲームを終了する
function checkBoard() {
  let end_flg = false;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[y][x] === 0) {
        debug("0が見つかりました");
        return end_flg;
      } else {
        debug("0が見つかりませんでした。ゲームを終了します。");
        end_flg = true;
      }
    }
  }
  return end_flg;
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

// boardの二次元配列データを元にcanvasに石を実際に配置するコードを書いてみる
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

// オブジェクトに新しく配列を追加
board.reflesh = () => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[y][x] === 1) {
        drawStone(x, y, WHITE);
      } else if (board[y][x] === 2) {
        drawStone(x, y, BLACK);
      }
    }
  }
};

/* 機能を書いていく */
// プレーヤーとCPUを決定する
// プレーヤーは色と先行・後攻を選べる

/* ロジックを考えて記述していく */
// 盤面は2次元配列で実現する
// 色は白を1、黒を2、何も置いていない箇所を0として表現する
// ひっくり返せる石があるか判定するには盤面の「縦、横、斜め」の全方向の配列を検索する
// 縦横斜めの判定を行い、次の石が自分と違う色
// 次の石が自分と違う色且つ最後に自分と同じ色で挟まれていること
// 配列の値により判定する
// 1, 2, 2, 1
// 1, 2, 1, 1, 2 のパターンも有る
// 先頭以外で自分の色が出てきた場合はループ処理を抜ける必要がある

// CPU機能を作っていく
function cpuDwawSrone() {
  cpuDebug(`CPUのターン`);
  cpuDebug(" ");
  cpuDebug(" --- CPU: ボードを検索しています --- ");
  let Y = null;
  let X = null;
  const cpuDirections = [];
  board.forEach((items, index) => {
    Y = index;
    cpuDebug({ Y });
    for (let i = 0; i < items.length; i++) {
      X = i;
      cpuDebug({ X });
      cpuPutSearchStonw(X, Y, cpuColor, cpuDirections);
    }
  });
  let searchLength = Math.floor(Math.random() * cpuDirections.length);
  let cpuPosX;
  let cpuPosY;
  cpuDebug(cpuDirections);
  cpuDebug(cpuDirections[searchLength]);
  try {
    cpuPosX = cpuDirections[searchLength].X;
    cpuPosY = cpuDirections[searchLength].Y;
  } catch (e) {
    cpuDebug(`エラーが発生しました ${e}`);
    cpuDebug(cpuDirections);
    cpuDebug(cpuDirections[searchLength]);
  }

  cpuDebug(" --- CPU: ボードを検索終了 --- ");
  cpuDebug(" ");
  cpuDebug(`%c CPUのターン終了`, "color: white; font-weight: 600;");
  cpuDebug(" ");

  setTimeout(() => {
    canPutStone(cpuPosX, cpuPosY, cpuColor);
  }, 2000);
}
// CPU用のオセロ配置出来る場所を検索するメソッド
function cpuPutSearchStonw(X, Y, cpuColor, cpuDirections) {
  // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
  directions.forEach((direction, index) => {
    // console.log(` /--- forEach ${index + 1}回目 ---/`);
    cpuDebug(`CPUが検索するボードの座標 X:${X}  Y:${Y}`);
    var x = X;
    var y = Y;
    // 自分がいま置いた石の色を格納しておく
    // 次の配列に格納された石が自分と異なる色の石ならひっくり返せる可能性がある
    var stones = [cpuColor];
    if (board[y][x] !== 0) {
      cpuDebug(`既に石が配置された座標なので検索を停止します X:${X}  Y:${Y}`);
      return;
    }
    // 最大7回繰り返す
    for (let i = 1; i <= 7; i++) {
      // cpuDebug(`座標を元にループを開始: ${i}回目`);
      x += direction.x;
      y += direction.y;
      // cpuDebug(
      //   `%c ${direction.name}`,
      //   "color: white; font-weight: 600;",
      //   `盤面を検索しています。現在の座標 → x:${x} y:${y}`
      // );
      if (x > 7 || x < 0 || y > 7 || y < 0) {
        // 閾値まで到達したらループ処理を抜ける
        // cpuDebug(`閾値に到達したので処理を抜けます ${i}回目のループ`);
        // cpuDebug(" ");
        break;
      }
      // 何も置いていないマスだったら処理を抜ける
      if (board[y][x] === 0) {
        // cpuDebug(`マスが0だったので処理を抜けます ${i}回目のループ`);
        // cpuDebug(" ");
        break;
      }
      stones.push(board[y][x]);
      cpuDebug("0以外の値を配列に追加");
      cpuDebug(stones);
      // ひっくり返せる盤面の情報を配列に追加
      if (board[y][x] !== cpuColor) {
        cpuDebug(" ひっくり返せる石の座標を検知しました ");
        cpuDebug(`検知した座標 y:${y} x:${x}`);
        cpuDebug(" ");
      }
      // 次の石がプレーヤーと同じ色だったら処理を停止する
      if (stones[1] === cpuColor) {
        // cpuDebug("次の石がプレーヤーと同じ色だった: " + cpuColor);
        // cpuDebug("/ --- for ループの処理を停止します。 --- /");
        // cpuDebug(" ");
        return;
      }
      cpuDebug(`ループ処理終了`);
    }
    // 配列が一つしかな場合はひっくり返せる石がないのでループを停止
    if (stones.length <= 1) {
      return;
    }
    // 末尾は必ず自分と同じ色である必要がある
    let lastIndex = stones.length - 1;
    if (stones[lastIndex] === cpuColor) {
      cpuDebug("--- 1方向終了後の処理です ---");
      cpuDebug(stones);
      cpuDebug(" ");
      cpuDebug(
        "x:" + x + " y:" + y + " は" + direction.name + "には、ひっくり返せる"
      );
      cpuDebug(" ");
      cpuDebug(`CPUが石を配置できる座標 X:${X}  Y:${Y}`);
      cpuDebug(" ");
      cpuDirections.push({ X, Y });
      return;
    }
  });
  return cpuDirections;
}

// 石が置けるか判定する
function canPutStone(originX, originY, currentColor) {
  let reversStoneColor = currentColor === WHITE ? BLACK : WHITE;
  let canReverse = false; // ひっくり返せるかのフラグ
  if (board[originY][originX] !== 0) {
    alert("既に石が置かれています。");
    return false;
  }

  // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
  directions.forEach((direction, index) => {
    debug(` /--- forEach ${index + 1}回目 ---/`);
    debug(`オセロを置いた座標 Y:${originY}  X:${originX}`);
    var x = originX;
    var y = originY;
    var currentCoordinate = []; // ひっくり返せる座標のオブジェクト格納する配列
    var stones = [currentColor]; // 自分がいま置いた石の色
    // 最大7回繰り返す
    for (let i = 1; i <= 7; i++) {
      // 盤面をクリックした座標（originY, originX）の値を基準に縦横斜めにオセロが置かれているのか判定する（directionsオブジェクトを使用）
      // y:4 x:4 に配置した場合に左方向に検索していく際は、x:3, x:2, x:1, x:0 とループしていき、x:-1 になったらループを抜ける
      // y軸に対しても同様の処理を行う
      x += direction.x;
      y += direction.y;
      debug(`${direction.name} 盤面を検索しています: x:${x} y:${y}`);
      if (x > 7 || x < 0 || y > 7 || y < 0) {
        break; // 閾値まで到達したらループ処理を抜ける
      }
      // 何も置いていないマスだったら処理を抜ける
      if (board[y][x] === 0) {
        break;
      }
      // 盤面の石の配置情報を配列に追加
      debug("盤面の石の配置情報を配列に追加");
      stones.push(board[y][x]);
      currentCoordinate.push({ y, x });
      debug(stones);
      debug(currentCoordinate);

      // 先頭の次の石がプレーヤーと同じ色だったら処理を停止する
      if (stones[1] === currentColor) {
        debug("次の石がプレーヤーと同じ色だった: " + currentColor);
        debug(stones);
        debug(" ");
        return;
      }
      // 先頭以外で自分と同じ色の石の情報が出た場合はそのループを抜ける
      if (board[y][x] === currentColor) {
        debug("ひっくり返す石の情報と座標を確認しています");
        debug(currentCoordinate);
        debug(stones);
        debug(" ");
        break;
      }
    }

    // 配列が一つしかな場合はひっくり返せる石がないのでループを停止
    if (stones.length <= 1) {
      return;
    }

    if (stones[0] !== currentColor) {
      return;
    }

    // 末尾は必ず自分と同じ色である必要がある
    let lastIndex = stones.length - 1;
    if (stones[lastIndex] === currentColor) {
      debug("--- 1方向終了後の処理です ---");
      debug(stones);
      debug(
        "x:" +
          originX +
          " y:" +
          originY +
          " は" +
          direction.name +
          "には、ひっくり返せる"
      );
      debug("ひっくり返す座標です");
      debug(currentCoordinate);
      debug(" ");
      board[originY][originX] = currentColor;
      // ひっくり返す処理をまとめた関数
      turnOver(currentCoordinate, board, currentColor);
      canReverse = true;
    }
  });
  debug("  ");
  let game_end = checkBoard();
  console.log(game_end);
  return canReverse;
}

// クリックしたときに石を置けるようになる
canvas.onclick = (e) => {
  console.log(`%c プレーヤーのターン`, "color: red; font-weight: 600;");
  console.log(" ");
  // 要素の寸法とそのビューポートに対する位置を返す
  // 左上の座標を（0, 0）起点として、要素の左上の位置をtop, left, bottom, right などで指定したり取得したりする
  // DOMRectというオブジェクトの中に {top: xxx, left: xxx ...} のようにそのクリックした要素の座標が取得されている
  // ここでは盤の大枠の要素の高さや座標が取得されている
  var rect = e.target.getBoundingClientRect();
  // console.log(rect) // Object

  // 要素の寸法から補正する
  // e.clientX クリックした要素のX座標の位置（ここではcanvas要素内）
  // e.clientY クリックした要素のY座標の位置（ここではcanvas要素内）
  mouseX = e.clientX - Math.floor(rect.left) - 2;
  mouseY = e.clientY - Math.floor(rect.top) - 2;
  const posX = Math.round((mouseX - 25) / 50);
  const posY = Math.round((mouseY - 25) / 50);

  // 既に石が置かれていたら処理を停止
  if (!canPutStone(posX, posY, currentPlayer)) {
    // 処理が停止された場合はプレーヤー権限を移行しない（元の色に戻す）
    console.log("処理を停止しました。 現在のプレーヤー： " + currentPlayer);
    console.log("*** *** ***");
    return;
  }
  drawStone(posX, posY, currentPlayer);

  console.log(`%c プレーヤーのターン終了`, "color: red; font-weight: 600;");
  console.log(" ");
  cpuDwawSrone();
};

// オセロをひっくり返す関数
function turnOver(currentCoordinate, board, currentColor) {
  console.log(board);
  try {
    currentCoordinate.forEach((item) => {
      board[item.y][item.x] = currentColor;
    });
    board.reflesh();
  } catch (e) {
    console.log(e);
  }
}

// 座標を指定して石を置く関数
function drawStone(x, y, stonColor) {
  // 定数の値からcanvas要素に描画する色を判定
  color = stonColor === WHITE ? "white" : "black";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(25 + x * 50, 25 + y * 50, 22, 0, 2 * Math.PI);
  ctx.fill();
}
// ランダムな座標を生成する
function getRandomPositon() {
  const x = Math.floor(Math.random() * 400);
  const y = Math.floor(Math.random() * 400);
  // return {x : x, y: y}
  return { x, y }; // プロパティと変数が同じの場合、省略した書き方ができる
}
// ランダムなサイズを生成する
function getRandomSize() {
  const width = Math.floor(Math.random() * 50);
  const height = Math.floor(Math.random() * 50);
  // return {b : b, s:s }
  return { width, height };
}

// 線の幅
ctx.lineWidth = 1;
// 行の線
function getLineW(x) {
  ctx.beginPath(); // 経路の開始
  ctx.moveTo(0, x); // どの地点から
  ctx.lineTo(FIELD_WIDTH, x); // どの地点までか
  ctx.closePath(); // 経路の終了
  ctx.stroke();
}
// 列の線
function getLineH(y) {
  ctx.beginPath(); // 経路の開始
  ctx.moveTo(y, 0); // どの地点から
  ctx.lineTo(y, FIELD_HEIGHT); // どの地点までか
  ctx.closePath(); // 経路の終了
  ctx.stroke();
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

// ゲームの初期化
function init() {
  // オセロを配置する
  board.reflesh();

  // 盤面の線を描画する
  for (let k = 1; k < 8; k++) {
    getLineW(BLOCK_SIZE * k);
    getLineH(BLOCK_SIZE * k);
  }
}
// 初期化関数実行
init();
