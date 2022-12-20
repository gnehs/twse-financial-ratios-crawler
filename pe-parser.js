const XLSX = require("xlsx");
const fs = require('fs');
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
    let headers = [`日期`, ...Object.keys(datas)]
    let res = [headers]
    dates.map((date, i) => {
      let row = [date]
      for (let code of Object.keys(datas)) {
        let valItem = datas[code].filter(x => x[`日期`] == date)
        if (valItem.length) {
          row.push(valItem[0][item])
        } else {
          row.push('')
        }
      }
      res.push(row)
    })
    let sheet = XLSX.utils.json_to_sheet(res)
    XLSX.utils.book_append_sheet(workbook, sheet, item);
  }
  XLSX.writeFile(workbook, `./resultPE/result.xlsx`);
  console.log(`time: ${new Date() - now}ms`)
})();