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
    on(line, 'keydown', (e) => {
      if (e.keyCode === 13) {
        // No enters
        e.preventDefault()
      }
    })
    fitted.fit()
  })

  // Sharing

  $('share').onclick = () => {
    const search = new URLSearchParams()
    IDS.forEach((id) => {
      const elem = dom[id]
      const val = elem.value || elem.innerText
      if (val && val !== '0') {
        search.append(id, val)
      }
    })
    location.search = '?' + search.toString()
  }

  const search = new URLSearchParams(location.search)
  search.forEach((val, id) => {
    const elem = dom[id]
    if (elem) {
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

})()