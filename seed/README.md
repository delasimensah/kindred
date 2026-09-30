# Demo catalog seed

This seed fills Kindred with twelve fictional artists, five hundred tracks, the audio and images those tracks use, and named sign-in accounts.

The three artists with long catalogs are Amaara Mensah (Accra), Kweku Darko (Kumasi), and Sela Okoro (Lagos). Nine more artists from Accra, Lagos, and Takoradi fill out the cast. Amaara's public single is titled Asase. A few hero tracks are supporters-only, and three are scheduled for later, so those states exist in the data.

Waveform peaks are one thousand loudness numbers per audio file, between 0 and 1. They are computed on this computer before upload and copied onto every track that uses that file. The phone reads those numbers. It does not scan the audio to draw the waveform.

## What you need first

Start the backend from the `kindred` folder and wait until Convex says the functions are ready:

`yarn dev:backend`

The audio and images already live in `seed/assets`. If those folders are empty, build them once:

`yarn seed:assets`

That downloads the Kevin MacLeod tracks, encodes them to about 75 seconds at 96 kbps, writes `seed/manifest.json` and `seed/peaks.json`, and downloads the Unsplash photographs listed in `seed/image-sources.json`. Rights and file sizes are in `seed/RIGHTS.md`.

If the MP3s already exist and you only need shorter clips (Free-plan egress):

`yarn seed:shrink`

Then push Convex and replace the blobs on the deployment:

`yarn seed:apply-shrunk`

## Load the catalog

From the `kindred` folder, with the backend ready, set the shared password and run:

`SEED_PASSWORD='the password from ACCESS-LIST.md' yarn seed:catalog`

The password must be at least 8 characters. It is not written into git. After a successful run, `ACCESS-LIST.md` lists the four demo emails and that password.

Sign-in accounts:

- Akosua Frimpong, a free fan, at akosua.frimpong@kindred.example
- Efua Boateng, the supporter demo, at efua.boateng@kindred.example
- Amaara Mensah, the artist login for Amaara, at amaara.mensah@kindred.example
- Delasi Mensah, the admin, at delasi.mensah@kindred.example

Forty more fans with ordinary names share the same password. Their emails are `first.last@kindred.example`. They exist so the catalog has an audience. The four accounts above are the ones to use by hand.

Running the command again does not wipe the database and does not delete someone who signed up themselves. It fills anything that is still missing. If an account already exists, its password is left as it is.

To change the shared password on accounts that already exist, from the `kindred` folder after Convex is ready:

`npx convex run seedCatalog:resetSeedPasswords '{"password":"the new password"}'`

The password must be at least 8 characters. Do not put it in git. Write it in `ACCESS-LIST.md`.

## What this seed does not store

Posts for non-hero artists, search embeddings, and real RevenueCat purchases are later data. Efua gets an active entitlement and support routes from `seedSupportEconomy`. Recent months are written by `earnings:seedPastMonths`. Two older months, including Téwá Nkrumah whom she no longer routes to, are written by `seedCatalog:seedEarlierSupport`. The seed still gives Efua a like on Asase, and Akosua a playlist named Sunday in Osu.
