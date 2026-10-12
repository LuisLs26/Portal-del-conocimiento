import { expect, test } from '@playwright/test';
import { BOOK_QUESTIONS } from '../../server/maraton/questions';

test('Maratón: QR de sala, nombre, dado, pregunta, ranking y diseño móvil', async({page,context})=>{
  await page.goto('/maraton');
  await expect(page.getByRole('heading',{name:/Maratón.*del conocimiento/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Silenciar|Activar sonido|Salir de la actividad/})).toHaveCount(0);
  await page.getByText('Soy docente · organizar una carrera').tap();
  await page.getByRole('button',{name:'Crear sala de Maratón'}).tap();
  await expect(page.locator('.race-code')).toBeVisible();
  const code=(await page.locator('.race-code').textContent())!;
  await expect(page.locator('.race-qr')).toBeVisible();
  const student=await context.newPage();
  await student.goto(`/maraton?sala=${code}`);
  await student.getByRole('textbox',{name:'Tu nombre'}).fill('Ana Torres');
  await expect(student.getByRole('textbox',{name:'Código de sala'})).toHaveCount(0);
  await student.getByRole('button',{name:'Entrar con mi nombre'}).tap();
  await expect(page.getByText('Ana Torres',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Dar la salida'}).tap();
  await expect(student.getByRole('button',{name:'Lanzar el dado'})).toBeEnabled();
  for(const width of [360,375,390,430]){
    await student.setViewportSize({width,height:844});
    await expect.poll(()=>student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await student.setViewportSize({width:390,height:844});
  await student.locator('.race-board').screenshot({path:test.info().outputPath('maraton-tablero.png')});
  await student.screenshot({path:test.info().outputPath('maraton-movil.png'),fullPage:true});
  let answered=false;
  for(let i=0;i<4&&!answered;i++){
    await student.getByRole('button',{name:'Lanzar el dado'}).tap();
    await expect.poll(()=>student.locator('.race-question').count().then(count=>count||student.getByRole('button',{name:'Lanzar el dado'}).isEnabled())).toBeTruthy();
    if(await student.locator('.race-question').count()){
      const text=await student.locator('.race-question h2').textContent();
      const q=BOOK_QUESTIONS.find(q=>q.text===text)!;
      const options=student.locator('.race-options button');
      const labels=await options.allTextContents();
      const correct=labels.findIndex(text=>text.includes(q.options[0]));
      await options.nth((correct+1)%4).tap();
      await options.nth(correct).tap();
      await student.getByRole('button',{name:'Comprobar respuesta'}).tap();
      await expect(student.getByText('Respuesta correcta:',{exact:false})).toBeVisible();
      await expect(page.getByText(/1 aciertos/)).toBeVisible();
      answered=true;
    }
  }
  expect(answered).toBe(true);
  await student.reload();
  await expect(student.getByText('● Conectado en vivo')).toBeVisible();
  await expect(student.getByRole('textbox',{name:'Tu nombre'})).toHaveCount(0);
  await student.close();
});
