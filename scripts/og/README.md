# Link-preview thumbnail

`og-image.svg` is the source of `public/og-image.png` (1200×630), the image shown when a link to the web app is shared.

Re-render after editing:

```sh
cd scripts/og && rsvg-convert -w 1200 -h 630 og-image.svg -o ../../public/og-image.png
```

`logo.png` is a copy of `src/assets/newAclcLogo.webp`; librsvg only loads images next to the SVG.
The meta tags are added by the `socialPreview` plugin in `vite.config.ts`. Set `VITE_SITE_URL` at build time.
