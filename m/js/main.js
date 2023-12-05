(() => {
  const MAX_BG = 37

  const $ = (id) => document.getElementById(id)
  const on = (elem, event, handler) => {
    if (typeof elem === 'string') {
      elem = $(elem)
    }
    elem.addEventListener(event, handler)
  }

  const rescale = () => {
    const width = $('app').clientWidth
    const viewport = document.querySelector('meta[name=viewport]')
    const ratio = window.innerWidth / width
    viewport.setAttribute('content', 'width=' + width + ', initial-scale=' + ratio + ', user-scalable=no')
  }
  rescale()
  on(window, 'resize', rescale)

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg', 'bgn']
  const dom = {}
  IDS.forEach(id => dom[id] = $(id))
  const lines = [dom.l1, dom.l2, dom.l3]

  lines.forEach((line) => {
    const fitted = fitty('#' + line.id, {
      multiLine: false, maxSize: 180
    })[0]
    on(line.parentNode, 'click', (e) => {
      line.focus()
    })
    on(line, 'fit', (e) => {
      line.style.lineHeight = line.style.fontSize
    })
    on(line, 'keydown', (e) => {
      if (e.keyCode === 13) {
        // No enters
        // e.preventDefault()
      }
    })
    fitted.fit()
  })

  // Sharing

  on('share', 'click', () => {
    const search = new URLSearchParams()
    IDS.forEach((id) => {
      const elem = dom[id]
      let val = elem.value || elem.innerText
      if (val && val !== elem.defaultValue) {
        if (elem.type === 'color') {
          val = val.replace('#', '')
        }
        search.append(id, val)
      }
    })
    const url = location.href.replace(/[#?].*/, '') + '#' + search.toString()
    location.href = url
    navigator.clipboard.writeText(url)
  })

  const search = new URLSearchParams(location.hash.slice(1))
  search.forEach((val, id) => {
    const elem = dom[id]
    if (elem) {
      if (elem.type === 'color') {
        val = '#' + val
      }
      if ('value' in elem) {
        elem.value = val
      } else {
        elem.innerText = val
      }
    }
  })

  // BG & FG color

  const updateBgColor = () => {
    $('canvas').style.backgroundColor = dom.bg.value
  }
  on('bg', 'change', updateBgColor)
  updateBgColor()
  
  const updateText = () => {
    $('lines').style.color = dom.fg.value
  }
  on('fg', 'change', updateText)
  updateText()

  // Bg URL

  const updateBgUrl = () => {
    const index = dom.bgn.value
    $('canvas').style.backgroundImage = index === '0' ? '' : 'url(bg/' + index + '.jpg)'
  }
  const changeBgUrl = (by) => {
    const index = Math.min(MAX_BG, Math.max(0, parseInt(dom.bgn.value) + by))
    dom.bgn.value = index
    updateBgUrl()
  }
  updateBgUrl()

  on('prev-bg', 'click', () => {
    changeBgUrl(-1)
  })
  on('next-bg', 'click', () => {
    changeBgUrl(+1)
  })

  // Export

  on('export', 'click', () => {
    const element = $('canvas')
    const width = element.clientWidth
    const height = element.clientHeight
    html2canvas(element, {
      width: width,
      height: height,
      useCORS: true,
      taintTest: false,
      allowTaint: false
    }).then((canvas) => {
      const url = canvas.toDataURL()
      const filename = lines.map(l => l.innerText).join(' ').toLowerCase().replace(/\W+/g, ' ').trim().replace(/ /g, '_')
      const download = $('download')
      download.download = filename + '.png'
      download.href = url
      download.click()

      if (window.ClipboardItem) {
        canvas.toBlob((blob) => {
          // Copy it to clipboard
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        })
      }
    }).catch((err) => {
      alert(err.message)
    })
  })

})()