// canvas要素を取得する
const canvas = document.getElementById("canvas");
// getContext()メソッドを使ってコンテキストというオブジェクトを取得する
// canvas要素に対して線や円を書いたり、操作することが出来るいろいろなメソッドを持っている
const ctx = canvas.getContext("2d");
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

class Stone {
    constructor(x, y, color){
      this.x = x;
      this.y = y;
      this.color = color;
    }
}

/* ロジックを考えて記述していく */
// 縦横斜めの判定を行い、次の石が自分と違う色
// 次の石が自分と違う色且つ最後に自分と同じ色で挟まれていること

// 石が置けるか判定する
function canPutStone(originX, originY, color) {
  let reversStoneColor = color === WHITE ? BLACK : WHITE;
  let canReverse = false; // ひっくり返せるかのフラグ
  console.log(reversStoneColor, color)
  if (banmen[originY][originX] !== 0) {
    alert("既に石が置かれています。");
    return true;
  }

  // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか調べる
  directions.forEach((direction) => {
    var x = originX;
    var y = originY;
    var stones = [color]; // 自分がいま置いた石

    // 最大7回繰り返す
    for (let i = 1; i <= 7; i++) {
      x += direction.x;
      y += direction.y;
      // クリックした盤面を基準に縦横斜めにオセロが置かれているのか判定する
      // x = originX + direction.x
      // y = originY + direction.y
      // console.log('縦方向： ' + y)
      // console.log('横方向： ' + x)
      if (x > 7 || x < 0 || y > 7 || y < 0) {
        break; // 閾値まで到達したらループ処理を抜ける
      }

      if (banmen[y][x] !== 0) {
        // console.log("クリックした盤面周辺のオセロ： " + banmen[y][x]);
        // console.log("周辺のオセロの判定を行っています");
        // console.log(`座標を検知します: Y軸: ${y}、X軸:${x}`);
        // console.log(banmen[y][x] === 1 ? "白色" : "黒色");
        stones.push(banmen[y][x]);
      }

      // 1, 2, 2, 1
      // 1, 2, 1, 1, 2 のパターンも有る
      // 先頭以外で自分の色が出てきた場合はループ処理を抜ける必要がある
      if (banmen[y][x] === reversStoneColor) {
        break;
      }
    }
    // console.log(stones.length);
    console.log("--- --- ---");

    // 次の石がプレーヤーと同じ色だったら
    if (stones[1] !== reversStoneColor) {
    //   console.log("ひっくり返せない");
      return;
    }

    // 末尾は必ず自分と同じ色である必要がある
    let lastIndex = stones.length - 1;
    if (stones[lastIndex] === reversStoneColor) {
      console.log(
        "x:" +
          originX +
          " y:" +
          originY +
          " は" +
          direction.name +
          "には、ひっくり返せる"
      );
      canReverse = true;
    }
  });
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
  // console.log(e.clientY)
  console.log(rect.left);
  mouseX = e.clientX - Math.floor(rect.left) - 2;
  mouseY = e.clientY - Math.floor(rect.top) - 2;
  // console.log( { mouseX, mouseY} )
  const posX = Math.round((mouseX - 25) / 50);
  const posY = Math.round((mouseY - 25) / 50);
  currentPlayer = currentPlayer === WHITE ? BLACK : WHITE;
  console.log('現在のプレーヤーの数字：' + currentPlayer);

  canPutStone(posX, posY, currentPlayer);

  drawStone(posX, posY, currentPlayer);
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

// 座標を指定して石を置く関数
function drawStone(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(25 + x * 50, 25 + y * 50, 22, 0, 2 * Math.PI);
  ctx.fill();
}

// クリックした時の処理をまとめる
function clickDrawStone() {
  console.log("click1");
}

// サイズをまとめたオブジェクト
// const custumObj = {
//     x: 100,
//     y: 100,
//     width: 50,
//     height: 50,
// }

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

// ゲームの初期化
function init() {
  // オセロを配置する
  drawStone(3, 4, "white");
  drawStone(4, 3, "white");
  drawStone(4, 4, "black");
  drawStone(3, 3, "black");

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
