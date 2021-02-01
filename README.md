# JavaScript でオセロを作成する

## 機能

- プレーヤーは白と黒どちらでプレイするか選択できる
- プレーヤーが選択しなかった色は CPU が自動で石を配置する
- もし石が置けない場合は、その旨を通知してパスする
- 終了後に両者の石の数を判定して勝敗を決定する

## ゲームのロジック

1. オセロボードは二次元配列で表現する
