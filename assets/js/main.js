/* JS Uniformes — interações da landing */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==== WHATSAPP POR CIDADE (55 + DDD + número) ==== */
  var CIDADES = {
    cascavel: '5545998337131',
    toledo:   '5545998337131',
    marechal: '5545998330789',
    foz:      '5545999220209'
  };
  var wa = function (cidade, msg) {
    return 'https://wa.me/' + CIDADES[cidade] + (msg ? '?text=' + encodeURIComponent(msg) : '');
  };

  /* ---- janela de escolha de cidade ----
     Todo botão .js-wa abre a janela; a mensagem pronta do botão segue
     para o WhatsApp da cidade escolhida. */
  var modal = document.getElementById('cidades');
  var ultimoFoco = null;
  var abrir = function (msg) {
    if (!modal) return;
    modal.querySelectorAll('[data-cidade]').forEach(function (a) { a.href = wa(a.dataset.cidade, msg); });
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('aberto'); });
    document.documentElement.style.overflow = 'hidden';
    var primeiro = modal.querySelector('[data-cidade]');
    if (primeiro) primeiro.focus({ preventScroll: true });
  };
  var fechar = function () {
    if (!modal || modal.hidden) return;
    modal.classList.remove('aberto');
    document.documentElement.style.overflow = '';
    setTimeout(function () { modal.hidden = true; }, semMovimento ? 0 : 250);
    if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
  };
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); abrir(a.dataset.msg || ''); });
  });
  if (modal) {
    modal.querySelectorAll('[data-fechar]').forEach(function (b) { b.addEventListener('click', fechar); });
    modal.querySelectorAll('[data-cidade]').forEach(function (a) { a.addEventListener('click', function () { setTimeout(fechar, 150); }); });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'Tab') { // mantém o foco dentro da janela
        var f = modal.querySelectorAll('a,button'); var p = f[0], u = f[f.length - 1];
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
        else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
      }
    });
  }

  /* ---- ano do rodapé ---- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---- menu no celular ---- */
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', aberto);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('aberto');
        btn.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ---- banner rotativo ---- */
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var pontos = [].slice.call(document.querySelectorAll('.banner__pontos button'));
  if (slides.length > 1) {
    var atual = 0, timer = null, TEMPO = 6500;
    var ir = function (i) {
      atual = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === atual;
        s.classList.toggle('ativo', on);
        s.setAttribute('aria-hidden', !on);
        s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
        if (on) s.querySelectorAll('img[loading=lazy]').forEach(function (im) { im.loading = 'eager'; });
      });
      pontos.forEach(function (p, k) { p.setAttribute('aria-selected', k === atual); });
    };
    var rodar = function () {
      clearInterval(timer);
      if (!semMovimento) timer = setInterval(function () { ir(atual + 1); }, TEMPO);
    };
    pontos.forEach(function (p, k) { p.addEventListener('click', function () { ir(k); rodar(); }); });
    var ant = document.querySelector('.seta--ant'), prox = document.querySelector('.seta--prox');
    if (ant) ant.addEventListener('click', function () { ir(atual - 1); rodar(); });
    if (prox) prox.addEventListener('click', function () { ir(atual + 1); rodar(); });
    var banner = document.querySelector('.banner');
    banner.addEventListener('mouseenter', function () { clearInterval(timer); });
    banner.addEventListener('mouseleave', rodar);
    banner.addEventListener('focusin', function () { clearInterval(timer); });
    // deslizar com o dedo
    var x0 = null;
    banner.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    banner.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) { ir(atual + (dx < 0 ? 1 : -1)); rodar(); }
    });
    ir(0); rodar();
    // pré-carrega as fotos dos outros slides depois do load
    window.addEventListener('load', function () {
      document.querySelectorAll('.slide img[loading=lazy]').forEach(function (im) { im.loading = 'eager'; });
    });
  }

  /* ---- destaques (banner rotativo) ---- */
  var dests = [].slice.call(document.querySelectorAll('.dest'));
  var dpts = [].slice.call(document.querySelectorAll('.destaques__pontos button'));
  if (dests.length > 1) {
    var di = 0, dt = null;
    var dir = function (i) {
      di = (i + dests.length) % dests.length;
      dests.forEach(function (d, k) {
        var on = k === di;
        d.classList.toggle('ativo', on);
        d.setAttribute('aria-hidden', !on);
        d.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
        if (on) d.querySelectorAll('img[loading=lazy]').forEach(function (im) { im.loading = 'eager'; });
      });
      dpts.forEach(function (p, k) { p.setAttribute('aria-selected', k === di); });
    };
    var drodar = function () { clearInterval(dt); if (!semMovimento) dt = setInterval(function () { dir(di + 1); }, 6000); };
    dpts.forEach(function (p, k) { p.addEventListener('click', function () { dir(k); drodar(); }); });
    var dbox = document.querySelector('.destaques');
    dbox.addEventListener('mouseenter', function () { clearInterval(dt); });
    dbox.addEventListener('mouseleave', drodar);
    var dx0 = null;
    dbox.addEventListener('touchstart', function (e) { dx0 = e.touches[0].clientX; }, { passive: true });
    dbox.addEventListener('touchend', function (e) {
      if (dx0 === null) return; var d = e.changedTouches[0].clientX - dx0; dx0 = null;
      if (Math.abs(d) > 45) { dir(di + (d < 0 ? 1 : -1)); drodar(); }
    });
    dir(0); drodar();
  }

  /* ---- formulário → WhatsApp ---- */
  var form = document.getElementById('form');
  var enviar = document.getElementById('enviar');
  if (form && enviar) {
    var v = function (n) { return form.elements[n].value.trim(); };
    var montar = function () {
      var l = ['Olá! Vim pelo site e quero um orçamento na JS Uniformes.', ''];
      if (v('nome')) l.push('Nome: ' + v('nome'));
      if (v('time')) l.push('Time/empresa: ' + v('time'));
      l.push('Cidade: ' + form.elements.cidade.selectedOptions[0].text);
      l.push('Segmento: ' + v('segmento'));
      l.push('Linha: ' + v('pacote'));
      l.push('Quantidade: ' + v('qtd') + ' kits');
      if (v('msg')) l.push('Detalhes: ' + v('msg'));
      enviar.href = wa(v('cidade'), l.join('\n'));
      enviar.target = '_blank';
      enviar.rel = 'noopener';
    };
    form.addEventListener('input', montar);
    form.addEventListener('change', montar);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    montar();
  }

  /* ---- revelação dos blocos ---- */
  var blocos = document.querySelectorAll('[data-anima]');
  if (!('IntersectionObserver' in window) || semMovimento) {
    blocos.forEach(function (b) { b.classList.add('dentro'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (ent, i) {
        if (!ent.isIntersecting) return;
        setTimeout(function () { ent.target.classList.add('dentro'); }, Math.min(i * 90, 270));
        obs.unobserve(ent.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    blocos.forEach(function (b) { obs.observe(b); });
  }

  /* ---- vídeo "de atleta para atleta" ----
     Só baixa quando a seção se aproxima da tela (WebM e MP4, para
     qualquer navegador). Toca mudo e em loop; botões de pausa e de som. */
  var video = document.querySelector('.video');
  var som = document.querySelector('.som');
  var pausa = document.querySelector('.pausa');
  if (video) {
    var pausadoPeloUsuario = false, visivel = false;
    video.muted = true;
    var tocar = function () {
      if (pausadoPeloUsuario) return;
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    };
    // o botão sempre mostra o estado real: se o navegador bloquear o autoplay,
    // ele aparece como "play" e o vídeo toca com um clique
    var sincronizar = function () {
      if (!pausa) return;
      pausa.setAttribute('aria-pressed', video.paused);
      pausa.setAttribute('aria-label', video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
    };
    video.addEventListener('play', sincronizar);
    video.addEventListener('pause', sincronizar);
    sincronizar();
    var carregar = function () {
      if (video.dataset.pronto) return;
      video.dataset.pronto = '1';
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (f) {
        if (!video.dataset[f[0]]) return;
        var s = document.createElement('source');
        s.src = video.dataset[f[0]]; s.type = f[1];
        video.appendChild(s);
      });
      video.load();
      video.addEventListener('canplay', function () { if (visivel) tocar(); }, { once: true });
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { if (e[0].isIntersecting) carregar(); }, { rootMargin: '800px 0px' }).observe(video);
      new IntersectionObserver(function (e) {
        visivel = e[0].isIntersecting;
        if (visivel) tocar(); else video.pause();
      }, { threshold: 0.2 }).observe(video);
    } else { carregar(); visivel = true; }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause(); else if (visivel) tocar();
    });
    if (pausa) pausa.addEventListener('click', function () {
      carregar();
      if (video.paused) { pausadoPeloUsuario = false; tocar(); }
      else { pausadoPeloUsuario = true; video.pause(); }
    });
    // clicar no próprio vídeo também alterna
    video.addEventListener('click', function () { if (pausa) pausa.click(); });
    if (som) som.addEventListener('click', function () {
      carregar();
      video.muted = !video.muted;
      som.setAttribute('aria-pressed', !video.muted);
      som.setAttribute('aria-label', video.muted ? 'Ativar som' : 'Desativar som');
      pausadoPeloUsuario = false; tocar();
    });
  }
})();
