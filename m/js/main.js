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
    const vals = IDS
      .map((id) => {
        const elem = document.getElementById(id)
        const val = elem.value || elem.innerText
        return val && id + '=' + encodeURIComponent(val)
      })
      .filter(v => !!v)

    location.search = '?' + vals.join('&')
  }

  location.search.slice(1).split('&').forEach((s) => {
    if (!s) {
      return
    }
    const parts = s.split('=')
    const id = parts[0]
    const val = decodeURIComponent(parts[1])
    const elem = document.getElementById(id)
    if (id) {
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