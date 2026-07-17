# flowslabs-web

Sitio web corporativo de **Flows Labs** — "Soluciones Tecnológicas con IA para Empresas".

- **Stack**: HTML/CSS/JS estático + `send-email.php` (formulario de contacto), sin build.
- **Deploy**: Vercel, proyecto `flowslabspage` (org `team_SS30dswOken0XoixDdUu9ylm`).
- **Repo**: `github.com/jeimyforero803-bot/flowslabspage`
- **SEO/GEO**: incluye `sitemap.xml`, `robots.txt`, verificación de Google, y `llms.txt` (instrucciones para crawlers de IA).

## Cómo verlo localmente
Abrir `index.html` en el navegador, o servir la carpeta con cualquier servidor estático. `send-email.php` requiere un servidor con PHP para probar el formulario de contacto.

## Cómo desplegar
```
vercel --prod
```
(o push a `main` si el proyecto tiene auto-deploy conectado en Vercel)

## Notas
- `.backup-prod-20260709/` — snapshot de una versión anterior de producción, revisa si aún la necesitas.
- Tenías 1 commit local sin subir (`git push` pendiente) al momento de mover esta carpeta.
