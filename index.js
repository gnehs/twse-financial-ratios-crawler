const axios = require('axios')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const colors = require('colors')
const XLSX = require("xlsx");
const fs = require('fs')
const config = require('./config.json')
const { stocks } = config
const { log } = console
const delay = s => new Promise(resolve => setTimeout(resolve, s * 1000))
async function fetchFinancialReport(code, year = 110) {
  await delay(5)
  const url = 'https://mops.twse.com.tw/mops/web/ajax_t05st22'
  const params = {
    encodeURIComponent: 1,
    run: 'Y',
    step: 1,
    TYPEK: 'sii',
    year: year,
    isnew: false,
    co_id: code,
    firstin: 1,
    off: 1,
    ifrs: 'Y',
  }
  let urlencodedParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  let { data } = await axios.post(url, urlencodedParams)
  let $ = cheerio.load(data)
  let stockName = $(`table > tbody > tr > td.noBorder`).text().match(/(.+)最近三年/)[1]
  log(`正在處理`.green + ` ${stockName}(${code}) ${year - 2}-${year}`.gray)
  cheerioTableparser($)
  let table = $('table[style]').parsetable(true, true, true)
  table.shift()
  let headers = table.shift()
  headers[0] = '年度'
  let result = {}
  let y
  table.map((row, index) => {
    row.forEach((value, index) => {
      if (index == 0) {
        y = value.replace('年度', '')
        result[y] = {}
      }
      else {
        result[y][headers[index]] = value
      }
    })
  })
  return result
}
async function main() {
  log(`股票代號`.green)
  log(`${stocks.join(', ')}`.gray)
  // create result folder
  if (!fs.existsSync('./result')) fs.mkdirSync('./result')
  // fetch data
  let results = {}
  for (let code of stocks) {
    results[code] = { ...await fetchFinancialReport(code, 107), ... await fetchFinancialReport(code, 110) }
    fs.writeFileSync(`./result/${code}.json`, JSON.stringify(results[code], null, 2))
  }
}
function accDiv(arg1, arg2) {
  var t1 = 0, t2 = 0, r1, r2;
  try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
  try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
  with (Math) {
    r1 = Number(arg1.toString().replace(".", ""))
    r2 = Number(arg2.toString().replace(".", ""))
    return (r1 / r2) * pow(10, t2 - t1);
  }
}

function clacAverage() {
  let results = {}
  for (let code of stocks) {
    results[code] = require(`./result/${code}.json`)
  }
  let average = {}
  for (let code of stocks) {
    for (let year in results[code]) {
      if (!average[year]) average[year] = {}
      for (let key in results[code][year]) {
        if (!average[year][key]) average[year][key] = []
        average[year][key].push(results[code][year][key])
      }
    }
  }
  log(average)
  for (let year in average) {
    for (let key in average[year]) {
      let len = average[year][key].length
      let sum = 0
      average[year][key].forEach(value => {
        sum += parseFloat(value)
      })
      average[year][key] = accDiv(sum, len).toFixed(2)
    }
  }
  // save json
  fs.writeFileSync(`./result/average.json`, JSON.stringify(average, null, 2))
  // save excel
  let workbook = XLSX.utils.book_new();
  function jsonToSheet(json, code) {
    let headers = Object.keys(json[Object.keys(json)[0]])
    let data = []
    let row = ['年份']
    for (let year in json) {
      row.push(year)
    }
    data.push(row)
    for (let key of headers) {
      row = [key]
      for (let year in json) {
        row.push(json[year][key])
      }
      data.push(row)
    }

    let sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, code.toString());
  }
  jsonToSheet(average, '平均')
  for (let code of stocks) {
    jsonToSheet(results[code], code)
  }
  XLSX.writeFile(workbook, `./result/result.xlsx`);
}
main()
clacAverage()