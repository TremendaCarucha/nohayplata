(() => {
  const MAX_BG = 106

  const $ = (id) => document.getElementById(id)
  const on = (elem, event, handler) => {
    if (typeof elem === 'string') {
      elem = $(elem)
    }
    elem.addEventListener(event, handler)
    return elem
  }
  const once = (elem, event, handler) => {
    const fn = (e) => {
      handler(e)
      element.removeEventListener(event, fn)
    }
    const element = on(elem, event, fn)
  }
  const track = (event, params) => {
    if (window.gtag && location.host === 'nohayplata.com') {
      gtag('event', event, params)
    } else {
      console.log('track', event, params)
    }
  }

  let prevScale = 1

  const rescale = () => {
    const width = $('app').clientWidth
    const viewport = document.querySelector('meta[name=viewport]')
    const scale = window.innerWidth / width
    if (scale === 1 || scale === prevScale) {
      // Prevent glitch
      return
    }
    prevScale = scale
    const values = { width: width, 'initial-scale': scale/*, 'minimum-scale': ratio, 'maximum-scale': ratio*/, 'user-scalable': 'no' }
    const content = Object.keys(values).map(key => key + '=' + values[key]).join(', ')
    viewport.setAttribute('content', content)
  }
  rescale()
  on(window, 'resize', rescale)
  on(window, 'scroll', rescale)

  // English translation
  
  let isEnglish = false
  if (navigator.language && navigator.language.slice(0, 2) !== 'es') {
    isEnglish = true
    document.querySelectorAll('[data-en]').forEach((elem) => {
      elem.innerText = elem.getAttribute('data-en')
    })
  }

  // Lines

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg', 'bgn']
  const dom = {}
  IDS.forEach(id => {
    const elem = dom[id] = $(id)
    const def = elem.getAttribute('data-default')
    if ((!elem.value || elem.value === '#000000') && def) {
      elem.value = def
    }
  })
  const lines = [dom.l1, dom.l2, dom.l3]

  lines.forEach((line) => {
    fitty('#' + line.id, {
      multiLine: false, maxSize: 120, minSize: 1,
    })
    on(line.parentNode, 'click', () => {
      line.focus()
    })
    on(line, 'keypress', () => {
      setTimeout(() => {
        const br = line.querySelector('br')
        if (br) {
          line.replaceChild(document.createTextNode('\n'), br)
        }
      }, 1)
    })
    on(line, 'keydown', (e) => {
      switch (e.keyCode) {
        case 38: focusLine(e, -1); break
        case 40: focusLine(e, +1); break
      }
    })
    on(line, 'paste', (e) => {
      const text = e.clipboardData && e.clipboardData.getData('text/plain')
      if (text) {
        e.preventDefault()
        // FIXME: It's always replacing, even if there's text
        line.innerHTML = text
      }
    })
    on(line, 'fit', () => {
      // For tight multi-line
      line.style.lineHeight = line.style.fontSize
    })
  })

  const focusLine = (e, by) => {
    const line = e.currentTarget
    if (line.innerText.includes('\n')) {
      return
    }
    const index = (lines.indexOf(line) + by + lines.length) % lines.length
    if (lines[index]) {
      lines[index].focus()
      e.preventDefault()
    }
  }

  // Sharing
  
  const getState = () => {
    const state = {}
    IDS.forEach((id) => {
      const elem = dom[id]
      // Unify whitespaces from HTML, so they get escaped more efficiently
      let val = elem.value || elem.innerText.replace(/\s/g, (c) => c === '\n' ? c : ' ')
      if (val && val !== elem.getAttribute('data-default')) {
        if (elem.type === 'color') {
          val = val.replace('#', '')
        }
        state[id] = val
      }
    })
    return state
  }

  const getUrl = () => {
    const hash = new URLSearchParams(getState()).toString()
    return location.href.replace(/[#?].*/, '') + '#' + hash
  }

  on('share', 'mouseover', (e) => {
    e.currentTarget.href = getUrl()
  })

  on('share', 'click', (e) => {
    if (e.button !== 0) {
      return
    }
    const share = e.currentTarget
    navigator.clipboard.writeText(share.href)
    const prev = share.innerText
    share.innerText = isEnglish ? 'Copied!' : 'Copiado!'
    share.style.pointerEvents = 'none'
    setTimeout(() => {
      share.innerText = prev
      share.style.pointerEvents = ''
    }, 1500)
    track('share', getState())
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

  const getBgUrl = (index) => {
    return 'bg/' + index + '.jpg'
  }
  const updateBgUrl = () => {
    const index = parseInt(dom.bgn.value) || 1
    $('canvas').style.backgroundImage = index ? 'url(' + getBgUrl(index) + ')' : ''
  }
  const setBgUrl = (index) => {
    dom.bgn.value = index
    updateBgUrl()
  }
  updateBgUrl()

  // Bg modal
  once('choose-bg', 'click', () => {
    const row = $('bgs-row')
    if (row.innerHTML) {
      return
    }
    let i = 1
    const div = document.createElement('div')
    const add = () => {
      div.innerHTML = '<div class="col-lg-3 col-md-4 col-sm-6" data-bg="' + i + '"><img src="' + getBgUrl(i) + '" /></div>'
      row.appendChild(div.firstChild)
      i++
      if (i <= MAX_BG) {
        // Add gradually so they load in order
        setTimeout(add, 50)
      }
    }
    add()
  })

  on('bgs-row', 'click', (e) => {
    const bg = e.target.getAttribute('data-bg')
    if (bg) {
      setBgUrl(bg)
      document.querySelector('.btn-close').click()
      if (document.body.className === 'tutorial t1') {
        calculateTutorial(1)
      }
    }
  })

  // Tutorial
  const calculateTutorial = (minStep) => {
    const body = document.body
    if (minStep === 2 || lines.some(f => !!f.innerText)) {
      body.className = ''
    } else {
      if (minStep === 0 && dom.bgn.value === '1') {
        body.className = 'tutorial t1'
      } else {
        body.className = 'tutorial t2'
      }
      once('lines', 'click', () => {
        calculateTutorial(2)
      })
    }
  }

  calculateTutorial(0)

  // Upload bg

  on('upload', 'change', (e) => {
    const file = e.srcElement.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      $('canvas').style.backgroundImage = 'url('+reader.result+')'
      track('upload')
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

      track('export', getState())

      if (window.ClipboardItem) {
        canvas.toBlob((blob) => {
          // Copy it to clipboard
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        })
      }
      location.href = getUrl()
    }).catch((err) => {
      track('error', { error: err.message })
      alert(err.message)
    })
  })

  window.addEventListener('error', (e) => {
    track('error', { error: e.message })
  })
    
})()