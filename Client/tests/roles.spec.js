import { test, expect } from "@playwright/test";

test("Administrador ve panel de administración", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.fill(
    'input[placeholder="Escriba su correo"]',
    "kevin@booksync.com",
  );
  await page.fill('input[placeholder="Escriba su contraseña"]', "123456");
  await page.click("button.btn-login");

  await page.waitForURL("**/Home", { timeout: 8000 });
  await page.locator("article").first().waitFor({ timeout: 8000 });
  await page.screenshot({ path: "roles-01-admin-home.png" });

  // Verificar que ve las secciones de admin en el sidebar
  await expect(page.locator('a[href="/Admin/Inventario"]')).toBeVisible();
  await expect(page.locator('a[href="/Admin/Reservas"]')).toBeVisible();
  await expect(page.locator('a[href="/Admin/Usuarios"]')).toBeVisible();
  await page.screenshot({ path: "roles-02-admin-sidebar.png" });

  // Entrar al panel de usuarios admin
  await page.locator('a[href="/Admin/Usuarios"]').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "roles-03-admin-usuarios.png" });
});

test("Usuario normal no ve opciones de admin", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.fill(
    'input[placeholder="Escriba su correo"]',
    "lolamento@booksync.com",
  );
  await page.fill('input[placeholder="Escriba su contraseña"]', "123456");
  await page.click("button.btn-login");

  await page.waitForURL("**/Home", { timeout: 8000 });
  await page.screenshot({ path: "roles-04-usuario-home.png" });

  // Verificar que NO ve las secciones de admin
  await expect(page.locator('a[href="/Admin/Inventario"]')).not.toBeVisible();
  await expect(page.locator('a[href="/Admin/Usuarios"]')).not.toBeVisible();
  await page.screenshot({ path: "roles-05-usuario-sin-admin.png" });
});
