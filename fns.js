let fns = Object.keys(R)
  fns.forEach(x => {
    window[x] = R[x]
  })

var damageTaken = (defender, attacker) =>
  subtract(
    pathOr(0, ['weapon', 'damage'], attacker),
    pathOr(0, ['armor', 'defense'], defender)
  )

var attacks = (attacker, defender) => {
  let remainingLife = subtract(
    propOr(0, 'life', defender),
    damageTaken(defender, attacker)
  )

  return assoc('life', remainingLife, defender)
}

var defends = flip(attacks)

var isAlive = propSatisfies(lt(0), 'life')


var code = [
`var attacks = ${attacks.toString()}
var hero = { life: 10 }
var imp = { weapon: { damage: 5 } }
attacks(imp, hero)
`
]

var codeTemplate = (i, x) => `<iframe class="ace editor" data-theme="ace/theme/monokai" data-mode="ace/mode/javascript" data-onchange="codeChange(${i}, editor)">${x}</iframe>`

var setup = () => {
  var q = x => document.querySelector(x)

  addIndex(map)((x, i) =>{
    let text = codeTemplate(i, x)
    console.log(text)
    q(`[data-code="${i}"] .code`).innerHTML = text
  }, code)

  RevealAce()

  var updateStream = Kefir.stream(emitter => {
      window.codeChange = (no, editor) => {
        emitter.emit({
          no,
          editor
        })
      }
    })
    .debounce(500)
    .onValue(x => {
      let code = x.editor.getValue()
      let parseCode = pipe(
        split('\n'),
        reject(x => or(equals('', head(x)), contains('//', x))),
        x => adjust(x => `result = ${x}`, x.length - 1, x),
        join('\n')
      )
      code = parseCode(code)

      console.log(code)

      var result = ""
      try {
        eval(code)
        q(`[data-slide="${x.no}"] .result`).innerHTML = JSON.stringify(result)
      } catch (e) {
        console.error('Result has errors', e.toString())
      }
    })


    Reveal.initialize({
      dependencies: [
      ]
    })
}

function RevealAce() {
  if(!Reveal.ace) Reveal.ace = {};
  function extend(o) {
    for(var i = 1; i < arguments.length; i++)
      for(var key in arguments[i])
        o[key] = arguments[i][key];
    return o;
  };
  function mkEditor(iframe) {
    var w = iframe.contentWindow, d = w.document;
    d.write("<!DOCTYPE html><html>"+
      "<head>"+
      "<script src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ace.js' type='text/javascript' charset='utf-8'></script>"+
      "</head>"+
      "<body>"+
      "<div id='editor' style='position:absolute; left:0; top:0; bottom:0; right:0;'>"+
      iframe.innerHTML+ // innerHTML is already escaped
      "</div>"+
      "</body>"+
      "</html>");
    iframe.onload = function() {
      function slidechanged(event) {
        var e = iframe;
        for(var e = iframe; e && e != event.currentSlide; e = e.parentNode);
        if(!e)
          return;
        iframe.focus();
        editor.focus();
      }
      var editor = w.ace.edit(d.getElementById('editor'));
      var aceConf = extend({}, options, iframe.dataset);
      editor.setOptions({
        fontSize: "16pt"
      });

      // Configuration
      if(aceConf.theme)
        editor.setTheme(aceConf.theme);
      if(aceConf.mode)
        editor.getSession().setMode(aceConf.mode);
      if(aceConf.autoFocus) {
        Reveal.addEventListener('slidechanged', slidechanged);
        slidechanged({ currentSlide: Reveal.getCurrentSlide() })
      }

      // Events
      if(options.oninit)
        options.oninit.call(editor, editor);
      if(iframe.dataset.oninit)
        (new Function("editor", iframe.dataset.oninit)).call(editor, editor);
      if(options.onchange)
        editor.getSession().on('change', options.onchange);
      if(iframe.dataset.onchange) {
        var onchange = new Function("value", "editor", iframe.dataset.onchange);
        editor.getSession().on('change', function() {
          var value = editor.getValue();
          return onchange.call(editor, value, editor);
        });
      }
      if(iframe.id) {
        Reveal.ace[iframe.id] = editor;
      }
    };
    d.close();
  }

  var module = {};
  var config = Reveal.getConfig();
  var options = extend({
    className: "ace",
    autoFocus: false,
    onchange: null,
    oninit: null
  }, config.ace || {});

  var aces = document.getElementsByClassName(options.className);
  for(var i = 0; i < aces.length; i++) {
    if(!aces[i].contentWindow) {
      console.warn("ACE Editors must be embedded in an IFrame");
      continue;
    }
    mkEditor(aces[i]);
  }

  return module;
}

document.addEventListener("DOMContentLoaded", setup)
