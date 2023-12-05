(() => {
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

  const IDS = ['l1', 'l2', 'l3', 'bg', 'fg']

  document.getElementById('share').onclick = () => {
    const search = new URLSearchParams()
    IDS.forEach((id) => {
      const elem = document.getElementById(id)
      const val = elem.value || elem.innerText
      if (val) {
        search.append(id, val)
      }
    })
    location.search = '?' + search.toString()
  }

  const search = new URLSearchParams(location.search)
  search.forEach((val, id) => {
    if (id) {
      const elem = document.getElementById(id)
      if ('value' in elem) {
        elem.value = val
      } else {
        elem.innerText = val
      }
    }
  })

  // BG & FG

  const bg = document.getElementById('bg')
  const updateBg = () => {
    document.getElementById('canvas').style.backgroundColor = bg.value
  }
  bg.addEventListener('change', updateBg)
  updateBg()
  
  const fg = document.getElementById('fg')
  const updateText = () => {
    document.getElementById('lines').style.color = fg.value
  }
  fg.addEventListener('change', updateText)
  updateText()
})()