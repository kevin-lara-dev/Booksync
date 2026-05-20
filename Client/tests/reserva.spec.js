import { test, expect } from "@playwright/test";

test("Flujo completo de reserva", async ({ page }) => {
  // 1. Login
  await page.goto("http://localhost:5173");
  await page.screenshot({ path: "e2e-01-login.png" });

  await page.fill(
    'input[placeholder="Escriba su correo"]',
    "kevin@booksync.com",
  );
  await page.fill('input[placeholder="Escriba su contraseña"]', "123456");
  await page.click("button.btn-login");

  await page.waitForURL("**/Home", { timeout: 8000 });
  await page.screenshot({ path: "e2e-02-home.png" });

  // 2. Click en primer libro del carrusel
  await page.locator("article").first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "e2e-03-detalle.png" });

  // 3. Reservar
  await page.locator('button:has-text("Reservar")').click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e-04-reserva-creada.png" });

  // 4. Ir a Mis Reservas
  await page.locator('a[href="/Reservas"]').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "e2e-05-mis-reservas.png" });

  // 5. Cancelar la reserva
  await page.locator('button:has-text("Cancelar")').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e-06-cancelada.png" });
});
