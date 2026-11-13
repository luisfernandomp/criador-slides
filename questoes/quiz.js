// Motor simples das questões. Cada aula define QUESTOES em questoes/<slug>.js:
// const QUESTOES = [{ pergunta: '...', opcoes: ['a','b','c','d'], correta: 0, explicacao: '...' }];
(function () {
  var div = document.getElementById('quiz');
  QUESTOES.forEach(function (q, i) {
    var html = '<p><b>' + (i + 1) + '. ' + q.pergunta + '</b></p>';
    q.opcoes.forEach(function (op, j) {
      html += '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + op + '</label><br>';
    });
    html += '<p id="r' + i + '"></p><hr>';
    div.insertAdjacentHTML('beforeend', html);
  });
  var botao = document.createElement('button');
  botao.textContent = 'Conferir';
  botao.onclick = function () {
    var acertos = 0;
    QUESTOES.forEach(function (q, i) {
      var marcada = document.querySelector('input[name="q' + i + '"]:checked');
      var r = document.getElementById('r' + i);
      if (marcada && Number(marcada.value) === q.correta) {
        acertos++;
        r.innerHTML = 'Certo! ✔';
      } else {
        r.innerHTML = (marcada ? 'Errado ✘' : 'Sem resposta ✘') +
          '<br>Resposta correta: ' + q.opcoes[q.correta] + '<br>Explicação: ' + q.explicacao;
      }
    });
    document.getElementById('placar').textContent = 'Acertos: ' + acertos + ' de ' + QUESTOES.length;
  };
  div.after(botao);
})();
