var node = document.getElementById('main');
var elm = Elm.Main.embed(node);

var globalCurrElmCode = "";

function updateCodeMirrorSize() {
  var leftPanelElement = document.getElementsByClassName("left-panel")[0];
  var width = leftPanelElement.clientWidth;
  var height = leftPanelElement.clientHeight - (30 * 2);
  console.log('new cm height', height);
  codeMirror.setSize(width, height)
}

elm.ports.outgoingElmCode.subscribe(function(currElmCode) {
  console.log("currElmCode:", currElmCode);
  globalCurrElmCode = currElmCode;
  var elmCodeElement = document.getElementById('elm-code');
  elmCodeElement.innerHTML = currElmCode
  hljs.highlightBlock(elmCodeElement);
  updateCodeMirrorSize();
});

var codeMirror;

elm.ports.elmDomReady.subscribe(function() {
  var htmlInputElement = document.getElementById('html');
  console.log(htmlInputElement);
  codeMirror = CodeMirror.fromTextArea(htmlInputElement, {
    mode: "htmlmixed",
    theme: "3024-day"
  });
  codeMirror.focus();
  codeMirror.on('change', function() {
    var currentHtml = codeMirror.getValue();
    console.log('currentHtml changed', currentHtml);
    elm.ports.incomingHtmlCode.send(currentHtml);
  });

  setTimeout(function() {
    updateCodeMirrorSize();
  }, 0)

});


elm.ports.currentSnippet.subscribe(function(currentSnippet) {
  console.log('curr snippet', currentSnippet);
  codeMirror.getDoc().setValue(currentSnippet);
});

elm.ports.copyCode.subscribe(function(){
      var el = document.createElement('textarea');
      el.value = globalCurrElmCode;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      // copy from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
});
