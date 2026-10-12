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
  await Promise.all(Array.from({length:29},(_,i)=>context.request.post(`/api/maraton/rooms/${code}/join`,{data:{name:`Alumno ${i+2}`}})));
  await page.getByRole('button',{name:'Dar la salida'}).tap();
  await expect(student.getByRole('button',{name:'LANZAR DADO'})).toBeEnabled();
  for(const width of [360,375,390,430]){
    await student.setViewportSize({width:844,height:width});
    await expect.poll(()=>student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await student.setViewportSize({width:844,height:390});
  await expect.poll(()=>student.locator('.arena-screen').evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
  await student.locator('.arena-board').screenshot({path:test.info().outputPath('maraton-tablero.png')});
  await student.screenshot({path:test.info().outputPath('maraton-movil.png'),fullPage:true});
  let answered=false;
  for(let i=0;i<8&&!answered;i++){
    await student.getByRole('button',{name:'LANZAR DADO'}).tap();
    await expect.poll(()=>student.locator('.arena-question').count().then(count=>count||student.getByRole('button',{name:'LANZAR DADO'}).isEnabled())).toBeTruthy();
    if(await student.locator('.arena-question').count()){
      const text=await student.locator('.arena-question h2').textContent();
      const q=BOOK_QUESTIONS.find(q=>q.text===text)!;
      const options=student.locator('.arena-answers button');
      const labels=await options.allTextContents();
      const correct=labels.findIndex(text=>text.includes(q.options[0]));
      await options.nth((correct+1)%4).tap();
      await options.nth(correct).tap();
      await student.getByRole('button',{name:'CONFIRMAR RESPUESTA'}).tap();
      await expect(student.getByRole('button',{name:'SEGUIR JUGANDO ➜'})).toBeVisible();
      await expect(page.getByText(/1 aciertos/)).toBeVisible();
      await student.getByRole('button',{name:'SEGUIR JUGANDO ➜'}).tap();
      await expect(student.getByRole('button',{name:'LANZAR DADO'})).toBeEnabled();
      answered=true;
    }
  }
  expect(answered).toBe(true);
  await page.setViewportSize({width:1366,height:768});
  await expect(page.locator('.host-screen')).toBeVisible();
  await expect(page.locator('.arena-leader')).toHaveCount(30);
  await expect.poll(()=>page.locator('.arena-screen').evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
  await page.screenshot({path:test.info().outputPath('maraton-docente-laptop.png')});
  await student.setViewportSize({width:390,height:844});
  await expect.poll(()=>student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await student.screenshot({path:test.info().outputPath('maraton-horizontal-forzado.png')});
  await student.reload();
  await expect(student.getByText('● EN VIVO')).toBeVisible();
  await expect(student.getByRole('textbox',{name:'Tu nombre'})).toHaveCount(0);
  await student.close();
});
