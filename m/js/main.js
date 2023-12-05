(() => {
  const MAX_BG = 37

  const $ = (id) => document.getElementById(id)

  const rescale = () => {
    const width = $('app').clientWidth
    const viewport = document.querySelector('meta[name=viewport]')
    const ratio = window.innerWidth / width
    viewport.setAttribute('content', 'width=' + width + ', initial-scale=' + ratio + ', user-scalable=no')
  }
  rescale()
  window.addEventListener('resize', rescale);

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg', 'bgn']
  const dom = {}
  IDS.forEach(id => dom[id] = $(id))

  const lines = document.querySelectorAll('.line')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const span = line.querySelector('span')
    const fitted = fitty('#' + span.id, {
      multiLine: false, maxSize: 180
    })[0]
    line.addEventListener('click', (e) => {
      span.focus()
    })
    line.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        // No enters
        e.preventDefault()
      }
    })
    fitted.fit()
  }

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
  dom.bg.addEventListener('change', updateBgColor)
  updateBgColor()
  
  const updateText = () => {
    $('lines').style.color = dom.fg.value
  }
  dom.fg.addEventListener('change', updateText)
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
  $('prev-bg').addEventListener('click', () => {
    changeBgUrl(-1)
  })
  $('next-bg').addEventListener('click', () => {
    changeBgUrl(+1)
  })

})()