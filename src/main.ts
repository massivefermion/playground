import { EventEmitter } from 'events'
import stringify from 'stringify-object'

const hub = new EventEmitter()

const log = console.log
console.log = (...args) => {
  log(...args)
  hub.emit('log', args)
}

hub.on('log', args => {
  const display = document.getElementById('display')

  args.forEach(a => {
    display.innerHTML += (typeof a == 'object' ? stringify(a) : a) + ' '
  })

  display.innerHTML += '<br>'
})

hub.on('clean', () => {
  document.getElementById('display').innerHTML = ''
})

hub.on('compiled', (code: string) => {
  const formatted =
    'data:text/javascript;charset=utf-8;name=' +
    Date.now() +
    ',' +
    encodeURIComponent(code)

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

  hub.emit('clean')
  const code = editor.value
  hub.emit('compiled', code)
})

const clean = document.getElementById('clean')
clean.addEventListener('click', function (event) {
  this.classList.add('clicked')
  ;(document.getElementById('editor') as HTMLTextAreaElement).value = ''
  hub.emit('clean')

  setTimeout(() => {
    this.classList.remove('clicked')
  }, 2_000)
})

const quotations = ["'", '"', '`']
const delimiters = Object.freeze({
  '{': '}',
  '[': ']',
  '(': ')',
})
const editor = document.getElementById('editor')
editor.addEventListener('keydown', function (event) {
  const editor = this as HTMLTextAreaElement
  const start = editor.selectionStart
  const end = editor.selectionEnd

  if (event.key == 'Tab') {
    event.preventDefault()
    editor.value =
      editor.value.substring(0, start) + '\t' + editor.value.substring(end)

    editor.selectionStart = editor.selectionEnd = start + 1
  }

  if (event.key == 'Enter') {
    if (Object.keys(delimiters).includes(editor.value[start - 1])) {
      event.preventDefault()
      editor.value =
        editor.value.substring(0, start) +
        '\n  \n' +
        editor.value.substring(end)

      editor.selectionStart = editor.selectionEnd = start + 3
    }
  }

  if (Object.keys(delimiters).includes(event.key)) {
    editor.value =
      editor.value.substring(0, start) +
      delimiters[event.key] +
      editor.value.substring(end)

    editor.selectionStart = editor.selectionEnd = start
  }

  if (quotations.includes(event.key)) {
    editor.value =
      editor.value.substring(0, start) + event.key + editor.value.substring(end)

    editor.selectionStart = editor.selectionEnd = start
  }

  if (event.key == 'Backspace') {
    if (
      quotations.includes(editor.value[start - 1]) ||
      Object.keys(delimiters).includes(editor.value[start - 1])
    ) {
      if (
        quotations.includes(editor.value[start]) ||
        Object.values(delimiters).includes(editor.value[start])
      ) {
        event.preventDefault()
        editor.value =
          editor.value.substring(0, start - 1) +
          editor.value.substring(start + 1, editor.value.length)

        editor.selectionStart = editor.selectionEnd = start - 1
      }
    }
  }
})
