import { chromium } from 'playwright';
import fs from 'fs';

async function main(){
  const outDir = './.artifacts';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'http://localhost:5174/cadastros/enderecos';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  // give SPA time to render dynamic content
  await page.waitForTimeout(1500);
  const html = await page.content();
  fs.writeFileSync(`${outDir}/enderecos.html`, html, 'utf8');
  await page.screenshot({ path: `${outDir}/enderecos.png`, fullPage: true });
  const bodyText = await page.innerText('body');
  const matches = bodyText.match(/R[1-3]_PP[1-5]_[A-D]\d{1,2}/g) || [];
  const unique = Array.from(new Set(matches));
  console.log('Matches found (sample 20):', unique.slice(0,20));
  console.log('Total matches in HTML:', matches.length);
  // extract total from "Mostrando X de Y endereços"
  const showingMatch = bodyText.match(/Mostrando\s+\d+[\d,.]*\s+de\s+([\d,.]+)\s+endereços/i);
  const totalAddresses = showingMatch ? showingMatch[1].replace(/[,\.]/g, '') : null;
  console.log('Total addresses (parsed):', totalAddresses);

  // count rows on current page
  const rows = await page.locator('tbody > tr').count();
  console.log('Rows on current page:', rows);

  // collect unique codes across multiple pages (up to 20 pages or until no more)
  const collected = new Set();
  for(let p=0;p<20;p++){
    const pageText = await page.innerText('body');
    const pageMatches = (pageText.match(/R[1-3]_PP[1-5]_[A-Z]{2,6}_N\d{3}/g) || []).concat(pageText.match(/R[1-3]_PP[1-5]_[A-D]\d{1,2}/g) || []);
    pageMatches.forEach(m => collected.add(m));
    // try click PRÓXIMO
    const nextBtn = await page.$('button:has-text("PRÓXIMO")');
    if(!nextBtn) break;
    const disabled = await nextBtn.getAttribute('disabled');
    if(disabled !== null) break;
    await nextBtn.click();
    await page.waitForTimeout(700);
  }
  console.log('Unique codes collected (count):', collected.size);

  // test search filter
  const searchInput = await page.$('input[placeholder="Filtrar por código ou tipo..."]');
  if(searchInput){
    await searchInput.fill('R2_PP1');
    await page.waitForTimeout(700);
    const filteredText = await page.innerText('body');
    const filteredMatches = filteredText.match(/R2_PP1[A-Z0-9_\-]*/g) || [];
    console.log('Filtered matches sample (5):', Array.from(new Set(filteredMatches)).slice(0,5));
    console.log('Filtered matches count on page:', filteredMatches.length);
    // clear
    await searchInput.fill('');
  } else {
    console.log('Search input not found');
  }

  // open NOVO ENDEREÇO modal and capture
  const novoBtn = await page.$('button:has-text("NOVO ENDEREÇO")');
  if(novoBtn){
    await novoBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/novo_endereco.png`, fullPage: false });
    const modalHtml = await page.content();
    fs.writeFileSync(`${outDir}/novo_endereco.html`, modalHtml, 'utf8');
    const modalText = await page.innerText('body');
    const modalCodes = modalText.match(/R[1-3]_PP[1-5]_[A-Z0-9_\-]*/g) || [];
    console.log('Modal codes sample:', modalCodes.slice(0,10));
  } else {
    console.log('NOVO ENDEREÇO button not found');
  }
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
