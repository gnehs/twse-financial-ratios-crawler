# 公開資訊觀測站 - 財務比率抓取
## 介紹
透過指定的股票代號清單自動抓取財務比率資訊，並自動計算平均
<img width="1087" alt="image" src="https://user-images.githubusercontent.com/16719720/204800773-13821e6f-1712-4c12-88fe-c1a91047b940.png">

## 如何使用
```bash
# 1. 安裝 Node.js
# https://nodejs.org/zh-tw/download/
$ brew install node
# 2. 下載專案
$ git clone https://github.com/gnehs/twse-financial-ratios-crawler.git
# 3. 切換到專案資料夾
$ cd twse-financial-ratios-crawler
# 4. 安裝套件
$ npm install
# 5. 修改 config.js
# 6. 執行
$ node index.js
```