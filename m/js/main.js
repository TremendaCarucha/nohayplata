(() => {
  const MAX_BG = 34

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
    const values = { width: width, 'initial-scale': ratio/*, 'minimum-scale': ratio, 'maximum-scale': ratio*/, 'user-scalable': 'no' }
    const content = Object.keys(values).map(key => key + '=' + values[key]).join(', ')
    viewport.setAttribute('content', content)
  }
  rescale()
  on(window, 'resize', rescale)
  on(window, 'scroll', rescale)

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg', 'bgn']
  const dom = {}
  IDS.forEach(id => dom[id] = $(id))
  const lines = [dom.l1, dom.l2, dom.l3]

  lines.forEach((line) => {
    fitty('#' + line.id, {
      multiLine: false, maxSize: 120, minSize: 1,
    })
    on(line.parentNode, 'click', () => {
      line.focus()
    })
    on(line.parentNode, 'dblclick', () => {
      if (!line.innerText) {
        return
      }
      // Select all
      const sel = window.getSelection()
      sel.removeAllRanges()
      const range = document.createRange()
      range.setStart(line, 0)
      range.setEnd(line, 1)
      sel.addRange(range)
    })
    on(line, 'paste', (e) => {
      const text = e.clipboardData && e.clipboardData.getData('text/plain')
      if (text) {
        e.preventDefault()
        line.innerHTML = text
      }
    })
    on(line, 'fit', () => {
      // For tight multi-line
      line.style.lineHeight = line.style.fontSize
    })
  })

  // Sharing

  on('share', 'mouseover', (e) => {
    const search = new URLSearchParams()
    IDS.forEach((id) => {
      const elem = dom[id]
      // Unify whitespaces from HTML, so they get escaped more efficiently
      let val = elem.value || elem.innerText.replace(/\s/g, (c) => c === '\n' ? c : ' ')
      if (val && val !== elem.defaultValue) {
        if (elem.type === 'color') {
          val = val.replace('#', '')
        }
        search.append(id, val)
      }
    })
    e.currentTarget.href = location.href.replace(/[#?].*/, '') + '#' + search.toString()
  })

  on('share', 'click', (e) => {
    if (e.button !== 0) {
      return
    }
    const share = e.currentTarget
    navigator.clipboard.writeText(share.href)
    share.innerText = 'Copiado!'
    setTimeout(() => { share.innerText = 'Compartir' }, 1500)
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

  const loaded = []
  const getBgUrl = (index) => {
    return 'bg/' + index + '.jpg'
  }
  const updateBgUrl = () => {
    const index = parseInt(dom.bgn.value) || 0
    $('canvas').style.backgroundImage = index ? 'url('+getBgUrl(index)+')' : ''
    loaded[index] = true
    // Preload
    if (!loaded[index + 1] && index < MAX_BG) {
      (new Image()).src = getBgUrl(index + 1)
      loaded[index + 1] = true
    }
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

  // Tutorial
  if (!location.hash) {
    document.body.className = 'tutorial'
    on('lines', 'click', () => {
      document.body.className = ''
    })
  }

  // Upload bg

  on('upload', 'change', (e) => {
    const file = e.srcElement.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      $('canvas').style.backgroundImage = 'url('+reader.result+')'
    }
    reader.readAsDataURL(file)
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
      const link = document.createElement('a')
      link.download = filename + '.png'
      link.href = url
      link.click()

      window.open(url)

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