const XLSX = require("xlsx");
const fs = require('fs');
const config = require('./config.json');
(function () {
  let now = new Date()
  if (fs.existsSync(`./resultPE/result.xlsx`)) {
    fs.unlinkSync(`./resultPE/result.xlsx`)
  }
  let files = fs.readdirSync('./resultPE')
  let datas = files.reduce((acc, file) => {
    let code = file.split('.')[0]
    let data = require(`./resultPE/${file}`)
    acc[code] = data
    return acc
  }, {})
  // clac average
  datas['average'] = []
  let dates = Object.values(datas)[0].map(x => x[`日期`])
  // calc average
  dates.map(date => {
    let items = []
    for (let [code, data] of Object.entries(datas)) {
      if (code === 'average') continue
      let item = data.find(x => x['日期'] === date)
      if (item) items.push(item)
    }
    function clacAverage(key) {
      let values = items.map(x => x[key])
        .filter(x => x != '-')
        .map(x => parseFloat(x))
      let res = values.reduce((a, b) => a + b, 0) / values.length
      return parseFloat(res.toFixed(2))
    }
    datas['average'].push({
      '日期': date,
      '本益比': clacAverage('本益比'),
      '殖利率(%)': clacAverage('殖利率(%)'),
      '股價淨值比': clacAverage('股價淨值比')
    })
  })
  // save xlsx
  let workbook = XLSX.utils.book_new();

  let sheet = XLSX.utils.json_to_sheet(datas['average'])
  XLSX.utils.book_append_sheet(workbook, sheet, '平均');

  for (let item of ['本益比', '殖利率(%)', '股價淨值比']) {
    let headers = [`日期`, ...config.targetStocks]
    let res = [headers]
    dates.map(date => {
      let parsedate = x => {
        let [year, month, day] = x.split(/年|月|日/g).map(x => parseInt(x))
        year += 1911
        return year + '/' + month + '/' + day
      }
      let row = [parsedate(date)]
      for (let code of config.targetStocks) {
        let valItem = datas[code].filter(x => x[`日期`] == date)
        if (valItem.length) {
          let val = parseFloat(valItem[0][item])
          row.push(val ? val : '')
        } else {
          row.push('')
        }
      }
      res.push(row)
    })
    for (let i = 2; i < res.length; i++) {
      let row = res[i]
      for (let j = 1; j < row.length; j++) {
        if (row[j] === '') {
          try {
            res[i][j] = res[i - 1][j]
          } catch (e) {

          }
        }
      }
    }
    let sheet = XLSX.utils.json_to_sheet(res)
    XLSX.utils.book_append_sheet(workbook, sheet, item);

    // calc monthly average
    let monthly = {}
    for (let i = 1; i < res.length; i++) {
      let [date, ...values] = res[i]
      let [year, month] = date.split('/')
      let key = year + '/' + month
      if (!monthly[key]) {
        monthly[key] = []
      }
      monthly[key].push(values)
    }
    let monthlyAverage = []
    for (let [key, values] of Object.entries(monthly)) {
      let items = []
      for (let i = 0; i < values[0].length; i++) {
        let vals = values.map(x => x[i]).filter(x => x != '')
        if (vals.length) {
          let avg = vals.reduce((a, b) => a + b, 0) / vals.length
          items.push(parseFloat(avg.toFixed(2)))
        } else {
          items.push('')
        }
      }
      monthlyAverage.push([key, ...items])
    }
    let sheetMonthly = XLSX.utils.json_to_sheet(monthlyAverage)
    XLSX.utils.book_append_sheet(workbook, sheetMonthly, `${item}月均`);
  }
  XLSX.writeFile(workbook, `./resultPE/result.xlsx`);
  console.log(`time: ${new Date() - now}ms`)
})();