import { EventEmitter } from 'events'

const hub = new EventEmitter()

const log = console.log
console.log = (...args) => {
  log(...args)
  hub.emit('log', args)
}

hub.on('log', args => {
  const display = document.getElementById('display')
  args.forEach(a => {
    display.innerHTML += a + ' '
  })
  display.innerHTML += '<br>'
})

hub.on('compiled', (code: string) => {
  const formatted =
    'data:text/javascript;charset=utf-8,' + encodeURIComponent(code)

  import(formatted).catch((msg: string) => {
    hub.emit('error', msg)
  })

  setTimeout(() => {
    document.getElementById('run').classList.remove('clicked')
  }, 1_000)
})

hub.on('error', (msg: string) => {
  const display = document.getElementById('display')
  display.innerHTML = msg
})

const run = document.getElementById('run')
run.addEventListener('click', function (event) {
  this.classList.add('clicked')
  const editor = document.getElementById('editor') as HTMLTextAreaElement
  const code = editor.value
  hub.emit('compiled', code)
})

const clean = document.getElementById('clean')
clean.addEventListener('click', function (event) {
  this.classList.add('clicked')
  ;(document.getElementById('editor') as HTMLTextAreaElement).value = ''
  document.getElementById('display').innerHTML = ''
  setTimeout(() => {
    this.classList.remove('clicked')
  }, 2_000)
})

const editor = document.getElementById('editor')
editor.addEventListener('keydown', function (event) {
  if (event.key == 'Tab') {
    event.preventDefault()
    const editor = this as HTMLTextAreaElement

    const start = editor.selectionStart
    const end = editor.selectionEnd

    editor.value =
      editor.value.substring(0, start) + '\t' + editor.value.substring(end)

    editor.selectionStart = editor.selectionEnd = start + 1
  }
})
