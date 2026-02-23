// Output panel: copy signature, copy HTML, view source, installation guide

import { getCurrentHtml, getFormattedHtml } from './preview-panel.js';
import { showToast } from './toast.js';
import { openModal } from './modal.js';

export function initOutputPanel() {
  document.getElementById('btn-copy-signature')?.addEventListener('click', copyRenderedSignature);
  document.getElementById('btn-copy-html')?.addEventListener('click', copyHtmlSource);
  document.getElementById('btn-view-source')?.addEventListener('click', viewSource);
  document.getElementById('btn-install-guide')?.addEventListener('click', showInstallGuide);
}

async function copyRenderedSignature() {
  const html = getCurrentHtml();
  if (!html) {
    showToast('Nejprve vygenerujte podpis', 'error');
    return;
  }

  try {
    // Modern Clipboard API with text/html MIME type
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    showToast('Podpis zkopírován do schránky');
  } catch (e) {
    // Fallback: create temporary element and use execCommand
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(tempDiv);
      showToast('Podpis zkopírován do schránky');
    } catch (e2) {
      showToast('Kopírování se nezdařilo', 'error');
      console.error('Copy failed:', e2);
    }
  }
}

async function copyHtmlSource() {
  const html = getCurrentHtml();
  if (!html) {
    showToast('Nejprve vygenerujte podpis', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(html);
    showToast('HTML kód zkopírován');
  } catch (e) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = html;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('HTML kód zkopírován');
  }
}

function viewSource() {
  const html = getFormattedHtml();
  if (!html) {
    showToast('Nejprve vygenerujte podpis', 'error');
    return;
  }

  const escaped = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  openModal('Zdrojový kód podpisu', `
    <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
      <button class="sg-btn sg-btn--primary sg-btn--sm" id="btn-copy-source-modal">Kopírovat kód</button>
    </div>
    <pre class="sg-code-block"><code>${escaped}</code></pre>
  `);

  document.getElementById('btn-copy-source-modal')?.addEventListener('click', () => {
    copyHtmlSource();
  });
}

function showInstallGuide() {
  openModal('Návod k instalaci podpisu', `
    <div class="sg-guide-tabs">
      <button class="sg-guide-tab sg-guide-tab--active" data-guide="gmail">Gmail</button>
      <button class="sg-guide-tab" data-guide="apple">Apple Mail</button>
      <button class="sg-guide-tab" data-guide="ios">iOS Mail</button>
    </div>

    <div class="sg-guide-content sg-guide-content--active" id="guide-gmail">
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">1</span>
        <div class="sg-guide-step__text">Klikněte na tlačítko <strong>"Kopírovat podpis"</strong> v generátoru.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">2</span>
        <div class="sg-guide-step__text">Otevřete <strong>Gmail</strong> a klikněte na ikonu ozubeného kola (vpravo nahoře) &rarr; <strong>Zobrazit všechna nastavení</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">3</span>
        <div class="sg-guide-step__text">Přejděte do sekce <strong>"Podpis"</strong> a klikněte na <strong>"Vytvořit nový"</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">4</span>
        <div class="sg-guide-step__text">Klikněte do textového pole podpisu a vložte obsah pomocí <strong>Ctrl+V</strong> (nebo <strong>Cmd+V</strong> na Macu).</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">5</span>
        <div class="sg-guide-step__text">Klikněte na <strong>"Uložit změny"</strong> v dolní části stránky.</div>
      </div>
    </div>

    <div class="sg-guide-content" id="guide-apple">
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">1</span>
        <div class="sg-guide-step__text">Klikněte na tlačítko <strong>"Kopírovat podpis"</strong> v generátoru.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">2</span>
        <div class="sg-guide-step__text">V Apple Mail otevřete <strong>Mail &rarr; Nastavení &rarr; Podpisy</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">3</span>
        <div class="sg-guide-step__text">Klikněte na <strong>"+"</strong> pro vytvoření nového podpisu.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">4</span>
        <div class="sg-guide-step__text"><strong>Důležité:</strong> Zrušte zaškrtnutí <strong>"Vždy používat výchozí písmo zprávy"</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">5</span>
        <div class="sg-guide-step__text">Klikněte do pole podpisu a vložte pomocí <strong>Cmd+V</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">6</span>
        <div class="sg-guide-step__text">Zavřete nastavení - podpis se uloží automaticky.</div>
      </div>
    </div>

    <div class="sg-guide-content" id="guide-ios">
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">1</span>
        <div class="sg-guide-step__text">Otevřete tuto stránku v <strong>Safari na iPhonu/iPadu</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">2</span>
        <div class="sg-guide-step__text">Klikněte na <strong>"Kopírovat podpis"</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">3</span>
        <div class="sg-guide-step__text">Přejděte do <strong>Nastavení &rarr; Aplikace &rarr; Mail &rarr; Podpis</strong>.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">4</span>
        <div class="sg-guide-step__text">Vyberte účet (nebo "Všechny účty") a podržte prst v poli podpisu.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">5</span>
        <div class="sg-guide-step__text">Zvolte <strong>"Vložit"</strong> a podpis se vloží.</div>
      </div>
      <div class="sg-guide-step">
        <span class="sg-guide-step__number">6</span>
        <div class="sg-guide-step__text"><em>Poznámka: iOS Mail má omezenou podporu HTML. Některé styly se nemusí zobrazit správně.</em></div>
      </div>
    </div>
  `);

  // Wire up guide tabs
  const guideTabs = document.querySelectorAll('.sg-guide-tab');
  guideTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      guideTabs.forEach(t => t.classList.remove('sg-guide-tab--active'));
      tab.classList.add('sg-guide-tab--active');

      document.querySelectorAll('.sg-guide-content').forEach(c => c.classList.remove('sg-guide-content--active'));
      const target = document.getElementById('guide-' + tab.dataset.guide);
      if (target) target.classList.add('sg-guide-content--active');
    });
  });
}
