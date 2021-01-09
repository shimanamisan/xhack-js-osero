// オセロのコードを書いていく
console.log('hello')

// canvas取得する
const canvas = document.getElementById('canvas');
// getContext()メソッドを使ってコンテキストというオブジェクトを取得する
// canvas要素に対して線や円を書いたり、操作することが出来るいろいろなメソッドを持っている
const ctx = canvas.getContext('2d');

// マスのサイズ
const FIELD_WIDTH = 400;
const FIELD_HEIGHT = 400;
// const BLOCK_SIZE = ;
let currentPlayer = 'white'

// 
const direction = [
    {x: 0, y: -1}, // 上方向
    {x: 0, y: 1}, // 下方向
    {x: 1, y: 0}, // 右方向
    {x: -1, y: 0}, // 左方向
    {x: 1, y: 0}, // 右下方向
    {x: 2, y: -1}, // 右上方向
];

// 盤面の状態を配列で表す
const banmen = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
]

// 石が置けるか判定する
function canPutStone(originX, originY){
    // 石を置きたい場所の八方向それぞれについて石がどのように配置されているか氏食べる
    direction.forEach((direction) => {
        var x = 0;
        var y = 0;
        // 最大7回繰り返す
        for(let i = 1; i <= 7; i++){
            x = x + direction.x
            y = y + direction.y
            if( x > 7 || x < 0 || y > 7 || y < 0){
                break; // 閾値まで到達したらループ処理を抜ける
            }
            if(banmen[y][x] !== 0){
                console.log(banmen[y][x] === 1 ? '白色' : '黒色')
            }
        }
    })
}

// クリックしたときに石を置けるようになる
canvas.onclick = (e) => {
    // このメソッドを調べる
    var rect = e.target.getBoundingClientRect();
    // 要素の寸法から補正する
    mouseX = e.clientX - Math.floor(rect.left) - 2;
    mouseY = e.clientY - Math.floor(rect.top) - 2;
    const posX = Math.round((mouseX - 25) / 50);
    const posY = Math.round((mouseY - 25) / 50) ;
    drawStone(posX, posY, currentPlayer)
    // console.log( { mouseX, mouseY} )
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white'

    console.log(currentPlayer)
    canPutStone()
}

// 座標を指定して石を置く関数
function drawStone(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath();
  ctx.arc( 25 + x * 50, 25 + y * 50, 22, 0, 2 * Math.PI);
  ctx.fill();
}

// クリックした時の処理をまとめる
function clickDrawStone(){
    console.log('click1')
}

// サイズをまとめたオブジェクト
// const custumObj = {
//     x: 100,
//     y: 100,
//     width: 50,
//     height: 50,
// }

// 色を指定することが出来る
// ctx.fillStyle = getRanodmColor();
// 四角形を描画
// ctx.fillRect(座標x, 座標y, 横幅サイズ, 縦幅サイズ);

// ランダムな色を返す
function getRanodmColor(){
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

// ランダムな座標を生成する
function getRandomPositon(){
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 400);
    // return {x : x, y: y}
    return { x, y }; // プロパティと変数が同じの場合、省略した書き方ができる
}

// ランダムなサイズを生成する
function getRandomSize(){
    const width = Math.floor(Math.random() * 50);
    const height = Math.floor(Math.random() * 50);
    // return {b : b, s:s }
    return { width , height }
}

// 線の幅
ctx.lineWidth = 1;
// ctx.beginPath(); // 経路の開始
// ctx.moveTo(0, 100); // どの地点から
// ctx.lineTo(400, 100); // どの地点までか
// ctx.closePath(); // 経路の終了
// ctx.stroke();

let line_x = 50; // リファクタ出来る

function getLineW(x){
    ctx.beginPath(); // 経路の開始
    ctx.moveTo(0, x); // どの地点から
    ctx.lineTo(FIELD_WIDTH, x); // どの地点までか
    ctx.closePath(); // 経路の終了
    ctx.stroke();
}

function getLineH(y){
    ctx.beginPath(); // 経路の開始
    ctx.moveTo(y, 0); // どの地点から
    ctx.lineTo(y, FIELD_HEIGHT); // どの地点までか
    ctx.closePath(); // 経路の終了
    ctx.stroke();

}

// ゲームの初期化
function init(){
    // オセロを配置する
    drawStone(3,4, "white");
    drawStone(4,3, "white");
    drawStone(4,4, "black");
    drawStone(3,3, "black");

    // 盤面の線を描画する
    for(let k = 1; k < 8; k++){
        getLineW(line_x);
        getLineH(line_x);
        line_x += 50; 
    }
}
// 初期化関数実行
init();

// for(let i = 0; i < 100; i++){
//     ctx.fillStyle = getRanodmColor();
//     const pos = getRandomPositon()
//     const size = getRandomSize()
//     ctx.fillRect(pos.x, pos.y, size.width, size.height);
// }

