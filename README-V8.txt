1) Bu paketteki package.json, scripts klasörü ve content/publications.json dosyasını repo köküne kopyalayın.
2) content/profile.json zaten varsa ÜZERİNE YAZMAYIN. Yoksa admin panelinin oluşturduğu profile.json dosyasını koruyun.
3) Repo klasöründe Terminal açıp bir kere: node scripts/install-v8.mjs
4) GitHub Desktop: Summary = Add automatic admin publishing build; Commit to main; Pull gerekiyorsa Pull; Push origin.
5) Cloudflare Pages > Settings > Builds & deployments:
   Build command = npm run build
   Build output directory = dist
   Root directory = boş
   Node version = 20+
6) Save. Yeni deployment Success olunca /yayinlar.html sayfasını açın.
7) Admin panelinden yeni yazı ekleyip Publish seçin. Cloudflare otomatik build yapacak.
