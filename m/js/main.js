(() => {
  const lines = document.querySelectorAll('.line')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fitted = fitty('#' + line.id + ' span', {
      multiLine: false, maxSize: 150
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

})()