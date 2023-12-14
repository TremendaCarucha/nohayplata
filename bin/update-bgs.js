const fs = require('fs')

const PATH = 'm/js/main.js'
const BGS = 'm/bg'

const bgs = fs.readdirSync(BGS)
const maxBg = bgs.reduce((max, bg) => {
  const num = parseInt(bg.split('.')[0])
  return num > max ? num : max
}, 0)

let code = fs.readFileSync(PATH, 'utf8')
code = code.replace(/(const MAX_BG =) \d+/, '$1 ' + maxBg)
fs.writeFileSync(PATH, code)
console.log('Max background updated to', maxBg)