let fns = Object.keys(R)
  fns.forEach(x => {
    window[x] = R[x]
  })


// Global fns
lifeClamp = clamp(0, 100)

isAlive = propSatisfies(lt(0), 'life')
isDead = propSatisfies(gte(0), 'life')

defense = pathOr(0, ['armor', 'defense'])

damage = pathOr(0, ['weapon', 'damage'])

damageTaken = curry((defender, attacker) =>
   lifeClamp(subtract(damage(attacker), defense(defender))))

attacks = curry((attacker, defender) => {
  let damage = damageTaken(defender, attacker)
  let updateLife = pipe(subtract(__, damage), lifeClamp)
  return evolve({ life: updateLife }, defender)
})

defends = flip(attacks)

weapon = { weapon: { type: 'dagger', damage: 7 } }
inventory = ['ham', 'bread', 'eggs']
imp = { life: 10, weapon: { damage: 10 }, armor: { defense: 2 } }
imps = repeat(imp, 3)

var code1 = [
`
// Pssst...
//
// Yeah you, can you help out the Hero get equiped and fight some Imps?
// Excellent! You're amazing!
// (just uncomment the line with the Hero to begin your journy)

// Hero = { name: 'hero', life: 100 }`,

`// When you see ";;" that's a new function and a short description.
// Check http://ramdajs.com/docs/ for more info

// :: is(Object, Any) => Boolean
// is(Object, Hero)
// is(Number, Hero)`,

`// By the way, if something goes red, check in your console,
// a shiny new error will await you there.
//
// :: assoc(String, Any, Object) => Object
// Hero = assoc('armor', { type: 'tunic' }, Hero)`,

`// :: assocPath(Array, Any, Object) => Object
// Hero = assocPath(['armor', 'defense'], 5, Hero)`,

`// :: merge(Object, Object) => Object
// weapon = { weapon: { type: 'dagger', damage: 7 } }
// Hero = merge(Hero, weapon)`,

`// :: lensProp(String) => Lens
// :: set(Lens, Any, Object) => Object
// inventory = ['ham', 'bread', 'eggs']
// Hero = set(lensProp('inventory'), inventory, Hero)
// Hero = set(lensProp('gold'), 10, Hero)`,

`// :: none(Function, Array) => Boolean
// :: isNil(Any) => Boolean
// :: props(Array, Object) => Array
// required = ['armor', 'weapon', 'inventory', 'gold']
// 'All set? ' + none(isNil, props(required, Hero))`

]

var code2 = [
`Hero = {
  "name": "hero",
  "life": 100,
  "gold": 10,
  "armor": {
    "type": "tunic",
    "defense": 5
  },
  "weapon": {
    "type": "dagger",
    "damage": 7
  },
  "inventory": [
    "ham",
    "bread",
    "eggs"
  ]
}`,

`// :: clamp(Ordered String|Number|Dates, Same, Same) => Same
// lifeClamp = clamp(0, 100)

// lifeClamp(54)
// lifeClamp(-150)
// lifeClamp(200)`,

`// :: lt(Number, Number) => Boolean
// :: propSatisfies(Function, String, Object) => Boolean
// isAlive = propSatisfies(lt(0), 'life')

// isAlive({ life: 10 })
// isAlive({ life: -10 })`,

`// :: gte(Number, Number) => Boolean
// isDead = propSatisfies(gte(0), 'life')

// isDead({ life: 10 })
// isDead({ life: -10 })`,

`// :: pathOr(Any, Array, Object) => Any
// defense = pathOr(0, ['armor', 'defense'])

// defense(Hero)`,

`// damage = pathOr(0, ['weapon', 'damage'])

// damage(Hero)`,

`// :: subtract(Number, Number) => Number
// :: curry(Function) => Function
// damageTaken = curry((defender, attacker) =>
//   lifeClamp(subtract(damage(attacker), defense(defender))))

// damageTaken({ armor: { defense: 2 } }, Hero)`,

`// :: pipe(Functions...) => Function
// :: evolve(Object, Object) => Object
// attacks = curry((attacker, defender) => {
//  let damage = damageTaken(defender, attacker)
//  let updateLife = pipe(subtract(__, damage), lifeClamp)
//  return evolve({ life: updateLife }, defender)
// })

// imp = { life: 10, weapon: { damage: 10 }, armor: { defense: 2 } }
// attacks(Hero, imp)`,

`// :: flip(Function) => Function
// defends = flip(attacks)

// defends(Hero, imp)`
]

var code3 = [
`Hero = {
  "name": "hero",
  "life": 100,
  "gold": 10,
  "armor": {
    "type": "tunic",
    "defense": 5
  },
  "weapon": {
    "type": "dagger",
    "damage": 7
  },
  "inventory": [
    "ham",
    "bread",
    "eggs"
  ]
}`,


`// repeat(Any, Number) => Array
// imp = { life: 10, weapon: { damage: 10 }, armor: { defense: 2 } }
// imps = repeat(imp, 3)`,

`// map(Function, Array) => Array
// reduce(Function, Any, Array) => Any

// Hero = reduce(defends, Hero,  imps)
// imps = map(attacks(Hero), imps)
// Hero = reduce(defends, Hero, imps)
// imps = map(attacks(Hero), imps)`,

`// all(Function, Array) => Boolean
// all(isDead, imps)

// Hero = assoc('victories', imps.length, Hero)`
]

var code4 = [
`adventure = pipe(
  assoc('armor', { type: 'tunic' }),
  assocPath(['armor', 'defense'], 5),
  merge(__, weapon),
  set(lensProp('inventory'), inventory),
  set(lensProp('gold'), 10),
  reduce(defends, __,  imps),
  reduce(defends, __, imps),
  assoc('victories', imps.length)
)

You = { name: 'the-programmer', life: 100 }
// You = adventure(You)`

]

var code = [code1, code2, code3, code4]

var codeTemplate = (i, x) => `<iframe class="ace editor" data-mode="ace/mode/javascript" data-onchange="codeChange(${i}, editor)">${x}</iframe>`

var sectionCodeTemplate = `<div class="code"></div>
<div class="code-result">
  <p>Result</p>
  <pre class="result"></pre>
</div>`

window.Hero = {}

var setup = () => {
  var q = x => document.querySelector(x)

 var spacer = join('', repeat('\n', 6))
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
