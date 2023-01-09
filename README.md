# 公開資訊觀測站 - 財務比率抓取
## Electron 版
這裡有透過 Electron 包裝後的抓取工具，並提供了友善的介面與更好用的年份選取工具
https://github.com/gnehs/twse-financial-ratios-crawler-electron

## 介紹
透過指定的股票代號清單自動抓取財務比率資訊，並自動計算平均
<img width="1087" alt="image" src="https://user-images.githubusercontent.com/16719720/204800773-13821e6f-1712-4c12-88fe-c1a91047b940.png">

## 如何使用
### 初始化
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
```
### 抓取財務比率
```bash
# 1. 修改 config.json 填入需要抓取的股票代號
# 2. 執行
$ node index.js
# 3. （選用）輸出適合製作圖表的格式
$ node data-parser,js
```
### 抓取本益比、殖利率、股價淨值比
```bash
# 1. 修改 config.json 填入需要抓取的股票代號
# 2. 執行
$ node pe.js
# 3. （選用）輸出適合製作圖表的格式
$ node pe-parser.js
```
