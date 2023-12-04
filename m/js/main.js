(() => {
  const lines = document.querySelectorAll('.line')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fitted = fitty('#' + line.id + ' span', {
      multiLine: false, maxSize: 180
    })[0]
    line.addEventListener('click', (e) => {
      fitted.element.focus()
    })
    line.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        // No enters
        e.preventDefault()
      }
    })
    fitted.fit()
  }

  const bgColor = document.getElementById('bg-color')
  const textColor = document.getElementById('text-color')

  const updateBg = () => {
    document.getElementById('bg').style.background = bgColor.value
  }
  const updateText = () => {
    document.getElementById('lines').style.color = textColor.value
  }

  bgColor.addEventListener('change', updateBg)
  textColor.addEventListener('change', updateText)
  updateBg()
  updateText()

})()