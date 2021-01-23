// canvas要素を取得する
const canvas = document.getElementById("canvas");
// getContext()メソッドを使ってコンテキストというオブジェクトを取得する
// canvas要素に対して線や円を書いたり、操作することが出来るいろいろなメソッドを持っている
const ctx = canvas.getContext("2d");
let player = document.getElementById("player");

// マスのサイズ
const FIELD_WIDTH = 400;
const FIELD_HEIGHT = 400;
// 碁盤の目のサイズ
const BLOCK_SIZE = FIELD_WIDTH / 8;
const BLACK = 2;
const WHITE = 1;
let currentPlayer = WHITE;

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

// banmenの二次元配列データを元にcanvasに石を実際に配置するコードを書いてみる
const banmen = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

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

// 石が置けるか判定する
function canPutStone(originX, originY, currentColor) {
  let reversStoneColor = currentColor === WHITE ? BLACK : WHITE;
  let canReverse = false; // ひっくり返せるかのフラグ
  console.log(
    "ひっくり返す色： " + reversStoneColor,
    " 自分が置いた石: " + currentColor
  );
  if (banmen[originY][originX] !== 0) {
    alert("既に石が置かれています。");
    return false;
  }

  // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
  directions.forEach((direction, index) => {
    console.log(` /--- forEach ${index + 1}回目 ---/`);
    console.log(`オセロを置いた座標 Y:${originY}  X:${originX}`);
    var x = originX;
    var y = originY;
    var currentCoordinate = []; // ひっくり返せる座標を格納するオブジェクト
    var stones = [currentColor]; // 自分がいま置いた石
    console.log(direction);
    // 最大7回繰り返す
    for (let i = 1; i <= 7; i++) {
      // クリックした盤面を基準に縦横斜めにオセロが置かれているのか判定する
      x += direction.x;
      y += direction.y;
      console.log(`${direction.name} 盤面を検索しています: x:${x} y:${y}`);
      if (x > 7 || x < 0 || y > 7 || y < 0) {
        break; // 閾値まで到達したらループ処理を抜ける
      }
      // 何も置いていないマスだったら処理を抜ける
      if (banmen[y][x] === 0) {
        break;
      }
      // ひっくり返せる盤面の情報を配列に追加
      stones.push(banmen[y][x]);
      if (banmen[y][x] !== currentColor) {
        console.log("ひっくり返す座標を確認しています");
        currentCoordinate.push({ y, x });
        console.log(currentCoordinate);
        console.log(stones);
        console.log("/ --- --- --- --- /");
      }
      // 次の石がプレーヤーと同じ色だったら処理を停止する
      if (stones[1] === currentColor) {
        console.log("次の石がプレーヤーと同じ色だった: " + currentColor);
        console.log(stones);
        console.log("/ --- --- --- --- /");
        return;
      }
    }

    // 配列が一つしかな場合はひっくり返せる石がないのでループを停止
    if (stones.length <= 1) {
      return;
    }

    // 末尾は必ず自分と同じ色である必要がある
    let lastIndex = stones.length - 1;
    if (stones[lastIndex] === currentColor) {
      console.log("--- 1方向終了後の処理です ---");
      console.log(stones);
      console.log(
        "x:" +
          originX +
          " y:" +
          originY +
          " は" +
          direction.name +
          "には、ひっくり返せる"
      );
      // console.log("lastIndex: " + stones[lastIndex]);
      console.log("ひっくり返す座標です: " + JSON.stringify(currentCoordinate));
      banmen[originY][originX] = currentColor;
      console.log("--- --- ---");
      console.log(currentCoordinate);
      console.log("--- --- ---");
      // ひっくり返す処理をまとめた関数
      turnOver(currentCoordinate, banmen, currentColor, banmen.reflesh);
      canReverse = true;
    }
  });
  console.log("  ");
  return canReverse;
}

// クリックしたときに石を置けるようになる
canvas.onclick = (e) => {
  // 要素の寸法とそのビューポートに対する位置を返す
  // 左上の座標を（0, 0）起点として、要素の左上の位置をtop, left, bottom, right などで指定したり取得したりする
  // DOMRectというオブジェクトの中に {top: xxx, left: xxx ...} のようにそのクリックした要素の座標が取得されている
  // ここでは盤の大枠の要素の座標が取得されている
  var rect = e.target.getBoundingClientRect();
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
    currentPlayer = currentPlayer === WHITE ? WHITE : BLACK;
    console.log("処理を停止しました。");
    console.log("*** *** ***");
    return;
  }
  console.log("石配置関数実行前のプレーヤー： " + currentPlayer);
  drawStone(posX, posY, currentPlayer);
  currentPlayer = currentPlayer === WHITE ? BLACK : WHITE;
  console.log("--- --- ---");
  console.log("石配置関数実行後のプレーヤー： " + currentPlayer);
  console.log("ユーザー変更関数実行後のプレーヤー： " + currentPlayer);
  changeUser(currentPlayer);
};

// オブジェクトに新しく配列を追加
banmen.reflesh = () => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (banmen[y][x] === 1) {
        drawStone(x, y, WHITE);
      } else if (banmen[y][x] === 2) {
        drawStone(x, y, BLACK);
      }
    }
  }
};
// オセロをひっくり返す関数
function turnOver(currentCoordinate, banmen, currentColor, reflesh) {
  try {
    currentCoordinate.forEach((item) => {
      banmen[item.y][item.x] = currentColor;
    });
    reflesh();
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
// プレーヤーを変更する関数
function changeUser(currentPlayer) {
  if (currentPlayer === 1) {
    currentPlayer = 1;
    player.innerHTML = "白色";
    console.log("現在のユーザー：" + currentPlayer);
  } else {
    currentPlayer = 2;
    player.innerHTML = "黒色";
    console.log("現在のユーザー：" + currentPlayer);
  }
}

// ゲームの初期化
function init() {
  // オセロを配置する
  // drawStone(3, 4, "white");
  // drawStone(4, 3, "white");
  // drawStone(4, 4, "black");
  // drawStone(3, 3, "black");
  banmen.reflesh();
  if (currentPlayer === WHITE) {
    player.innerHTML = "白色";
  } else {
    player.innerHTML = "黒色";
  }

  // 盤面の線を描画する
  for (let k = 1; k < 8; k++) {
    getLineW(BLOCK_SIZE * k);
    getLineH(BLOCK_SIZE * k);
  }
}
// 初期化関数実行
init();

// この辺はウォーミングアップ
// for(let i = 0; i < 100; i++){
//     ctx.fillStyle = getRanodmColor();
//     const pos = getRandomPositon()
//     const size = getRandomSize()
//     ctx.fillRect(pos.x, pos.y, size.width, size.height);
// }

// function loopFunc(fn, count){
//     for(let i = 0; i < count; i++){
//         fn();
//     }
// }

// loopFunc( () => { console.log("hello")} , 3)

// function goodby(){
//     console.log('goodbye!');
// }
// loopFunc(goodby, 7);

// 色を指定することが出来る
// ctx.fillStyle = getRanodmColor();
// 四角形を描画
// ctx.fillRect(座標x, 座標y, 横幅サイズ, 縦幅サイズ);
// ランダムな色を返す
// function getRanodmColor(){
//     const r = Math.floor(Math.random() * 256);
//     const g = Math.floor(Math.random() * 256);
//     const b = Math.floor(Math.random() * 256);
//     return `rgb(${r}, ${g}, ${b})`;
// }
