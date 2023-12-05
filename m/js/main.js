(() => {
  const $ = (id) => document.getElementById(id)

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg']
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
      if (val) {
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

  // BG & FG

  const updateBg = () => {
    $('canvas').style.backgroundColor = dom.bg.value
  }
  dom.bg.addEventListener('change', updateBg)
  updateBg()
  
  const updateText = () => {
    $('lines').style.color = dom.fg.value
  }
  dom.fg.addEventListener('change', updateText)
  updateText()
})()