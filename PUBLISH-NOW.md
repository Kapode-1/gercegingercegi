# Ücretsiz yayın sırası
1. GitHub'da `tayyip-minsin-policy-atlas` adlı private repo oluştur.
2. Bu klasörün içeriğini repo köküne yükle.
3. Cloudflare > Workers & Pages > Create > Pages > Connect to Git seç.
4. GitHub reposunu seç; framework preset `None`, build command boş, output directory `/`.
5. Deploy sonrası verilen gerçek `<proje>.pages.dev` adresini kaydet.
6. Projedeki `tayyip-minsin-policy-atlas.pages.dev` metnini gerçek adresle tüm dosyalarda değiştir.
7. Decap CMS için GitHub OAuth/App kurulumu yap; `admin/config.yml` içindeki repo, site_url ve base_url alanlarını güncelle.
8. Cloudflare Access ile `/admin/*` yolunu yalnızca `minsinjr@gmail.com` için aç.
9. Google Search Console'da URL-prefix mülkü olarak tam `https://<proje>.pages.dev/` adresini ekle.
10. Doğrulama HTML dosyasını repo köküne yükle; yeni deploy sonrası Verify seç.
11. Search Console > Sitemaps alanına `sitemap.xml` yazıp gönder.
