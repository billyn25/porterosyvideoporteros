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
    const province=form.querySelector('[name=provincia]');
    const locality=form.querySelector('[name=localidad]');
    const zone=form.querySelector('[name=zona]');
    const recipient=form.querySelector('[data-contact-recipient]');
    const submitLabel=form.querySelector('[data-submit-label]');
    let previousProvince=form.dataset.province || '';
    let previousLocality=normalize(locality.value);
    const selectedProvince=()=>province?.selectedOptions[0];
    const whatsappNumber=()=>selectedProvince()?.dataset.whatsapp || (!province?form.dataset.whatsapp:'');
    function updateLocality(clearZone=false){
      const currentLocality=normalize(locality.value);
      if(clearZone && currentLocality!==previousLocality)zone.value='';
      previousLocality=currentLocality;
      const originalMunicipality=normalize(form.dataset.municipality || '');
      if(form.querySelector('#zonas-consulta') && selectedProvince()?.value===form.dataset.province && currentLocality===originalMunicipality)zone.setAttribute('list','zonas-consulta');
      else zone.removeAttribute('list');
    }
    function updateRecipient(clearLocation=false){
      const option=selectedProvince();
      if(clearLocation && previousProvince && previousProvince!==option?.value){
        locality.value='';
        zone.value='';
      }
      previousProvince=option?.value || '';
      updateLocality();
      document.querySelectorAll('[data-routed-contact]').forEach(block=>{
        if(!option?.value)return;
        block.querySelector('.contact-area-label').textContent=option.dataset.contactLabel;
        const link=block.querySelector('.contact-detail');
        link.href=`tel:+${option.dataset.phoneDigits}`;
        link.querySelector('[data-phone-label]').textContent=option.dataset.phone;
      });
      document.querySelectorAll('[data-routed-phone]').forEach(link=>{
        if(!option?.value)return;
        link.href=`tel:+${option.dataset.phoneDigits}`;
        link.querySelector('[data-phone-label]').textContent=option.dataset.phone;
        link.setAttribute('aria-label',`Llamar al ${option.dataset.phone}`);
      });
      document.querySelectorAll('[data-routed-whatsapp]').forEach(link=>{
        if(option?.value && option.dataset.whatsapp)link.href=`https://wa.me/${option.dataset.whatsapp}`;
      });
      if(recipient)recipient.textContent=option?.value?`Contacto para ${option.textContent}: ${option.dataset.phone}.`:'Selecciona la provincia para dirigir tu consulta al teléfono de su zona.';
      if(submitLabel)submitLabel.textContent=whatsappNumber() || !option?.value?'Continuar en WhatsApp':'Preparar y copiar consulta';
      output.hidden=true;status.textContent='';
    }
    province?.addEventListener('change',()=>updateRecipient(true));
    locality.addEventListener('input',()=>updateLocality(true));
    function message(){
      const values=new FormData(form);
      return [
        'Consulta de porteros y videoporteros',
        `Localidad: ${String(values.get('localidad') || '').trim()}`,
        `Provincia: ${selectedProvince()?.textContent || ''}`,
        values.get('zona')?`Zona o referencia: ${String(values.get('zona')).trim()}`:'',
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
      const whatsapp=whatsappNumber();
      if(whatsapp){window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');status.textContent='Se ha abierto WhatsApp con tu consulta. Revisa el mensaje y pulsa enviar allí.';}
      else copy(text);
    });
    copyButton?.addEventListener('click',()=>{if(form.reportValidity())copy(renderMessage());});
    updateRecipient();
    form.querySelector('[type=submit]').disabled=false;
    if(copyButton)copyButton.disabled=false;
    const params=new URLSearchParams(location.search);
    if(params.has('servicio')) {
      const service=form.querySelector('[name=servicio]');
      const match=[...service.options].find(option=>normalize(option.value)===normalize(params.get('servicio')) || option.dataset.id===params.get('servicio'));
      if(match)service.value=match.value;
    }
  });

  document.querySelectorAll('[data-locality-choice]').forEach(link=>{
    link.addEventListener('click',()=>{
      const input=document.querySelector('[name=zona]');
      if(input){
        const form=input.closest('[data-query-form]');
        const province=form.querySelector('[name=provincia]');
        province.value=link.dataset.localityProvince;
        province.dispatchEvent(new Event('change',{bubbles:true}));
        const locality=form.querySelector('[name=localidad]');
        locality.value=link.dataset.localityTown;
        locality.dispatchEvent(new Event('input',{bubbles:true}));
        input.value=link.dataset.localityChoice;
        setTimeout(()=>input.focus({preventScroll:true}),0);
      }
    });
  });

  const diagnosticFilter=document.querySelector('[data-diagnostic-filter]');
  if(diagnosticFilter){
    const search=diagnosticFilter.querySelector('[name=sintoma]');
    const topic=diagnosticFilter.querySelector('[name=tipo]');
    const status=diagnosticFilter.querySelector('[data-diagnostic-status]');
    const cases=[...document.querySelectorAll('[data-diagnostic-topic]')];
    function filterCases(){
      const terms=normalize(search.value).split(/\s+/).filter(Boolean);let count=0;
      cases.forEach(item=>{
        const match=(!topic.value || topic.value===item.dataset.diagnosticTopic) && terms.every(term=>normalize(item.textContent).includes(term));
        item.hidden=!match;if(match)count++;
      });
      status.textContent=count?`${count} ${count===1?'caso disponible':'casos disponibles'}. Abre el que encaje con tu síntoma.`:'No hay coincidencias. Prueba otro término o elige todos los tipos.';
    }
    search.addEventListener('input',filterCases);topic.addEventListener('change',filterCases);
    diagnosticFilter.addEventListener('submit',event=>{event.preventDefault();filterCases();});
  }
})();
