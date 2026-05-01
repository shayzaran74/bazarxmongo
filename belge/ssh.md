ssh shayzaran@188.119.3.242 giris yap

password : [PASSWORD]


 pnpm docker:up       

pnpm docker:down 

pnpm --filter @bazarx/backend exec prisma studio

ngrok http 3002


docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d


docker-compose -f docker-compose.prod.yml --env-file .env.prod down 


# Local çalışmak için:
pnpm env:local   # env'i local'e çek
pnpm dev         # uygulamayı başlat
pnpm prisma:studio  # veritabanını görsel olarak incele

# Ngrok ile arkadaşlara açmak için:
pnpm env:ngrok   # frontend'i ngrok URL'ine bağla
pnpm ngrok:backend   # ayrı terminalde backend'i ngrok'la aç


xamples

  Set up a new Prisma project
  $ prisma init

  Generate artifacts (e.g. Prisma Client)
  $ prisma generate

  Browse your data
  $ prisma studio

  Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
  $ prisma migrate dev

  Pull the schema from an existing database, updating the Prisma schema
  $ prisma db pull

  Push the Prisma schema state to the database
  $ prisma db push

  Validate your Prisma schema
  $ prisma validate

  Format your Prisma schema
  $ prisma format

  Display Prisma version info
  $ prisma version

  Display Prisma debug info
  $ prisma debug


pnpm prisma generate