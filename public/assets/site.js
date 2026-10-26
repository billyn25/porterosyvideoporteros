(() => {
  'use strict';
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#site-menu');
  const closeMenu = () => {
    menu?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  };
  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  // La búsqueda se descarga al interactuar; los enlaces provinciales funcionan sin JS.
  let indexPromise;
  const loadIndex = () => {
    if (!indexPromise) indexPromise = fetch('/search-index.json').then(response => {
      if (!response.ok) throw new Error('index-unavailable');
      return response.json();
    }).then(rows => rows.map(row => ({ ...row, search: normalize([row.name, row.province, ...(row.aliases || [])].join(' ')) }))).catch(error => {
      indexPromise = undefined;
      throw error;
    });
    return indexPromise;
  };
  document.querySelectorAll('[data-town-finder]').forEach(finder => {
    const input = finder.querySelector('input');
    const list = finder.querySelector('[data-search-results]');
    const status = finder.querySelector('[data-search-status]');
    const province = finder.dataset.province || '';
    let timer, request = 0;
    async function search() {
      const current = ++request;
      const query = normalize(input.value);
      if (query.length < 2) { list.replaceChildren(); status.textContent = ''; return; }
      status.textContent = 'Buscando municipios…';
      try {
        const rows = await loadIndex();
        if (current !== request) return;
        const terms = query.split(/\s+/).filter(Boolean);
        const matches = rows.filter(row => (!province || row.provinceSlug === province) && terms.every(t => row.search.includes(t)));
        matches.sort((a,b) => {
          const score = row => normalize(row.name) === query ? 0 : normalize(row.name).startsWith(query) ? 1 : 2;
          return score(a)-score(b) || b.population-a.population || a.name.localeCompare(b.name,'es');
        });
        const shown = matches.slice(0,12);
        list.replaceChildren();
        shown.forEach(row => {
          const li=document.createElement('li');
          const a=document.createElement('a'); a.href=row.url;
          const name=document.createElement('span');name.textContent=`Porteros y videoporteros en ${row.name}`;
          const area=document.createElement('small');area.textContent=row.province;
          a.append(name,area);li.append(a);list.append(li);
        });
        status.textContent = !matches.length ? 'No encontramos ese municipio. Prueba otro nombre o consulta el índice de provincias.' : matches.length > 12 ? `${matches.length} coincidencias. Mostramos 12; añade la provincia para concretar.` : `${matches.length} ${matches.length===1?'municipio encontrado':'municipios encontrados'}. Elige tu localidad.`;
      } catch {
        if (current===request) status.textContent='No se ha podido cargar el buscador. Puedes entrar desde el listado de provincias.';
      }
    }
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,180);});
    finder.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);search();});
    input.addEventListener('keydown',e=>{
      if (e.key==='ArrowDown' && list.firstElementChild) { e.preventDefault();list.querySelector('a').focus(); }
      if (e.key==='Escape') { ++request;input.value='';list.replaceChildren();status.textContent=''; }
    });
    list.addEventListener('keydown',e=>{
      const links=[...list.querySelectorAll('a')];const idx=links.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){e.preventDefault();links[Math.min(idx+1,links.length-1)]?.focus();}
      if(e.key==='ArrowUp'){e.preventDefault();if(idx<=0)input.focus();else links[idx-1]?.focus();}
      if(e.key==='Escape')input.focus();
    });
  });

  const filter = document.querySelector('[data-directory-filter]');
  if (filter) {
    const rows = [...document.querySelectorAll('[data-town-row]')];
    const groups = [...document.querySelectorAll('.town-group')];
    const status = document.querySelector('[data-directory-status]');
    const alphabet = document.querySelector('.alphabet');
    filter.addEventListener('input',()=>{
      const query=normalize(filter.value);const terms=query.split(/\s+/).filter(Boolean);let count=0;
      rows.forEach(row=>{const match=terms.every(term=>normalize(row.dataset.search || row.textContent).includes(term));row.hidden=!match;if(match)count++;});
      groups.forEach(group=>{group.hidden=![...group.querySelectorAll('[data-town-row]')].some(row=>!row.hidden);});
      if(alphabet)alphabet.hidden=Boolean(query);
      status.textContent=`${count} ${count===1?'municipio':'municipios'}${query?(count===1?' que coincide con tu búsqueda':' que coinciden con tu búsqueda'):''}.`;
    });
  }

  document.querySelectorAll('[data-query-form]').forEach(form=>{
    const status=form.querySelector('[data-form-status]');
    const output=form.querySelector('[data-consultation-output]');
    const copyButton=form.querySelector('[data-copy-query]');
    const whatsapp=form.dataset.whatsapp;
    function message(){
      const values=new FormData(form);
      return [
        'Consulta de porteros y videoporteros',
        `Localidad: ${String(values.get('localidad') || '').trim()}`,
        `Necesidad: ${values.get('servicio')}`,
        `Instalación: ${values.get('inmueble')}`,
        `Marca: ${values.get('marca')}`,
        `Detalle: ${String(values.get('detalle') || '').trim() || 'Prefiero explicarlo durante la consulta.'}`,
        document.body.dataset.place ? `Página de referencia: ${document.body.dataset.place}` : ''
      ].filter(Boolean).join('\n');
    }
    function renderMessage(){
      const text=message();output.textContent=text;output.hidden=false;return text;
    }
    async function copy(text){
      try {
        if(!navigator.clipboard || !window.isSecureContext)throw new Error('clipboard-unavailable');
        await navigator.clipboard.writeText(text);status.textContent='Consulta copiada. Puedes pegarla en tu aplicación de mensajería.';
      } catch {
        const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(output);selection.removeAllRanges();selection.addRange(range);
        status.textContent='Tu consulta está preparada y seleccionada. Cópiala para guardarla o compartirla.';
      }
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();if(!form.reportValidity())return;
      const text=renderMessage();
      if(whatsapp){window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');status.textContent='Se ha abierto WhatsApp con tu consulta. Revisa el mensaje y pulsa enviar allí.';}
      else copy(text);
    });
    copyButton?.addEventListener('click',()=>{if(form.reportValidity())copy(renderMessage());});
    const params=new URLSearchParams(location.search);
    if(params.has('servicio')) {
      const service=form.querySelector('[name=servicio]');
      const match=[...service.options].find(option=>normalize(option.value)===normalize(params.get('servicio')) || option.dataset.id===params.get('servicio'));
      if(match)service.value=match.value;
    }
  });
})();
