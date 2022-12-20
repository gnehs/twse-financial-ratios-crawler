const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const colors = require('colors')
const XLSX = require("xlsx");
const fs = require('fs')
const config = require('./config.json')
const { stocks } = config
const { log } = console
const delay = s => new Promise(resolve => setTimeout(resolve, s * 1000))
// https://www.twse.com.tw/zh/exchangeReport/BWIBBU?response=json&date=20220101&stockNo=1231
async function fetchPE(code, year, month) {
  await delay(5)
  month = ('0' + month).slice(-2)
  const url = 'https://www.twse.com.tw/zh/exchangeReport/BWIBBU?response=json&date=' + year + month + '01&stockNo=' + code
  let res = await fetch(url).then(res => res.json())
  return res
}
async function main() {
  if (!fs.existsSync(`./resultPE/`)) {
    fs.mkdirSync(`./resultPE/`)
  }

  let yearMonths = []
  // reverse years
  for (let i = 6; i >= 0; i--) {
    let year = new Date().getFullYear() - i
    for (let j = 1; j <= 12; j++) {
      let month = j < 10 ? '0' + j : j
      yearMonths.push({ year, month })
    }
  }
  let count = 0
  for (let code of stocks) {
    if (fs.existsSync(`./resultPE/${code}.json`))
      continue
    let res = []
    for (let { year, month } of yearMonths) {
      try {
        let data = await fetchPE(code, year, month)
        let fields = data.fields
        let dataArr = data.data
        for (let item of dataArr) {
          let obj = {}
          for (let i = 0; i < fields.length; i++) {
            obj[fields[i]] = item[i]
          }
          res.push(obj)
        }
        count++
        log(`正在處理`.green + ` ${code} ${year}-${month} (${count}/${yearMonths.length * stocks.length})`.gray)
      } catch (error) {
        log(error)
      }
    }
    fs.writeFileSync(`./resultPE/${code}.json`, JSON.stringify(res))
  }
}
main()
