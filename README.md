## Setup

### Dev Container

1. Install [Docker](https://www.docker.com) and
   [Visual Studio Code](https://code.visualstudio.com/) with the
   [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Clone the repository and open the cloned folder in Visual Studio Code.
3. Run **Dev Containers: Reopen in Container** from the Command Palette.
4. Wait for the container setup to finish. The `postCreateCommand` runs `npm install`.
5. Run `npm start` in the container terminal.
6. Browse to <http://localhost:3000>.

If `.env` is missing, create it from the template:

```bash
cp .env.example .env
```

`JWT_PRIVATE_KEY_BASE64` must contain a base64-encoded PEM private key matching
`encryptionkeys/jwt.pub`. To create a fresh local key pair, run:

```bash
openssl genrsa -out /tmp/juice-shop-jwt.pem 2048
openssl rsa -in /tmp/juice-shop-jwt.pem -RSAPublicKey_out -out encryptionkeys/jwt.pub
jwt_private_key="$(openssl base64 -A -in /tmp/juice-shop-jwt.pem)"
sed -i "s|^JWT_PRIVATE_KEY_BASE64=.*|JWT_PRIVATE_KEY_BASE64=${jwt_private_key}|" .env
rm /tmp/juice-shop-jwt.pem
```

## Donations

[![](https://img.shields.io/badge/support-owasp%20juice%20shop-blue)](https://owasp.org/donate/?reponame=www-project-juice-shop&title=OWASP+Juice+Shop)

The OWASP Foundation gratefully accepts donations via Stripe. Projects such as Juice Shop can then request reimbursement
for expenses from the Foundation. If you'd like to express your support of the Juice Shop project, please make sure to
tick the "Publicly list me as a supporter of OWASP Juice Shop" checkbox on the donation form. You can find our more
about donations and how they are used here:

<https://pwning.owasp-juice.shop/companion-guide/latest/part3/donations.html>

## Contributors

The OWASP Juice Shop Project Leaders are:

- [Björn Kimminich](https://github.com/bkimminich) aka `bkimminich` [![Keybase PGP](https://img.shields.io/keybase/pgp/bkimminich)](https://keybase.io/bkimminich)
- [Jannik Hollenbach](https://github.com/J12934) aka `J12934`

For a list of all contributors to the OWASP Juice Shop please visit our
[HALL_OF_FAME.md](HALL_OF_FAME.md).

## Licensing

[![license](https://img.shields.io/github/license/juice-shop/juice-shop.svg)](LICENSE)

This program is free software: you can redistribute it and/or modify it under the terms of the [MIT license](LICENSE).
OWASP Juice Shop and any contributions are Copyright © by Bjoern Kimminich & the OWASP Juice Shop contributors
2014-2026.

![Juice Shop Logo](https://raw.githubusercontent.com/juice-shop/juice-shop/master/frontend/src/assets/public/images/JuiceShop_Logo_400px.png)
