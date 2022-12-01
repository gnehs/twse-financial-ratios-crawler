const XLSX = require("xlsx");
(function () {
  let results = {
    產業平均: require('./result/average.json'),
    味全: require('./result/1201.json'),
    愛之味: require('./result/1217.json'),
    聯華食品: require('./result/1231.json'),
  }
  let ratesHeader = Object.keys(results['味全']['107'])
  let years = Object.keys(results['味全'])
  let result = []
  for (let rate of ratesHeader) {
    result.push([rate])
    result.push([`年度`, ...years])
    for (let title of Object.keys(results)) {
      let row = [title]
      for (let year of years) {
        row.push(parseFloat(results[title][year][rate]))
      }
      result.push(row)
    }
  }
  let workbook = XLSX.utils.book_new();
  let sheet = XLSX.utils.aoa_to_sheet(result);
  XLSX.utils.book_append_sheet(workbook, sheet, 'sheet1');
  XLSX.writeFile(workbook, `./result/result_parsed.xlsx`);
})();