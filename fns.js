let fns = Object.keys(R)
  fns.forEach(x => {
    window[x] = R[x]
  })


var code1 = [
`Hero = { name: 'hero', life: 100 }`,

`// is(Object, Any) => Boolean
// is(Object, Hero)`,

`// assoc(String, Any, Object) => Object
// Hero = assoc('armor', { type: 'tunic' }, Hero)`,

`// assocPath(Array, Any, Object) => Object
// Hero = assocPath(['armor', 'defense'], 10, Hero)`,

`// merge(Object, Object) => Object
// Hero = merge(Hero, { weapon: { type: 'dagger', attack: 15 } })`,

`// lensProp(String) => Lens
// set(Lens, Any, Object) => Object
// Hero = set(lensProp('inventory'), { inventory: ['ham', 'bread', 'eggs'] }, Hero)`,

`// none(Function, Array) => Boolean
// isNil(Any) => Boolean
// props(Array, Object) => Array
// 'All set? ' + none(isNil, props(['armor', 'weapon', 'inventory'], Hero))`

]

var code2 = [
`// clamp(Ordered String|Number|Dates, Same, Same) => Same
// bound = clamp(0, 100)`,

`// pathOr(Any, Array, Object) => Any
// damage = pathOr(0, ['weapon', 'damage'])
// defense = pathOr(0, ['armor', 'defense'])`,

`// subtract(Number, Number) => Number
//damageTaken = (d, a) => bound(subtract(damage(attacker), defense(defender)))`

]

var code = [code1, code2]
/*
imp = { life: 10, weapon: { damage: 15 } }
//attacks = (attacker, defender) => {
//  let decreaseLife = pipe(subtract(__, damageTaken(defender, attacker)), clamp(0, 100))
//  return evolve({ life: decreaseLife }, defender)
//}
//
//defends = flip(attacks)
//
//isAlive = propSatisfies(lt(0), 'life')
`
]
*/
var codeTemplate = (i, x) => `<iframe class="ace editor" data-theme="ace/theme/monokai" data-mode="ace/mode/javascript" data-onchange="codeChange(${i}, editor)">${x}</iframe>`

var sectionCodeTemplate = `<div class="code"></div>
<div class="code-result">
  <p>Result</p>
  <pre class="result"></pre>
</div>`

window.Hero = {}

var setup = () => {
  var q = x => document.querySelector(x)

 var spacer = join('', repeat('\n', 7))
  addIndex(map)((x, i) =>{
    x = x.join(spacer)
    x = spacer + x + spacer
    let text = codeTemplate(i, x)
    q(`[data-code="${i}"]`).innerHTML = sectionCodeTemplate
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

      // console.log(code)

      var result = ""
      try {
        eval(code)
        q(`[data-code="${x.no}"] .result`).innerText = JSON.stringify(result, null, '  ')
        q(`[data-code="${x.no}"]`).setAttribute('data-error', false)
      } catch (e) {
        console.error('Result has errors', e.toString())
        q(`[data-code="${x.no}"]`).setAttribute('data-error', true)
      }
    })


    Reveal.initialize({
      width: document.body.offsetWidth,
      height: 800,
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
        fontSize: "22pt"
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
