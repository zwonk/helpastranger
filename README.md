<h1 align="center">
  <br>
  <a href="https://helpastranger.net"><img src="helpastranger.gif"></a>
</h1>
 
<h2 align="center">The official repo for the Help A Stranger platform</h2>

<p align="center">
    <a href="https://david-dm.org/zwonk/helpastranger/" style="text-decoration:none;"><img src="https://david-dm.org/zwonk/helpastranger/heroku-badge.png" alt="Dependencies"></a>
     <a href="https://ecosystem.iota.org/" style="text-decoration:none;"><img src="https://img.shields.io/badge/iota-ecosystem-yellowgreen.svg)" alt="IOTA Ecosystem"></a>
</p>


<p align="center">
  <a href="#about">About</a> ◈
  <a href="#prerequisites">Prerequisites</a> ◈
  <a href="#installation">Installation</a> ◈
  <a href="#getting-started">Getting started</a> ◈
  <a href="#supporting-the-project">Supporting the project</a> ◈
  <a href="#joining-the-discussion">Joining the discussion</a> 
</p>

---

## About
[Help a stranger](https://helpastranger.net) is a platform that allows you to donate to the people in need via crypto remotely.


## Prerequisites
- node.js / npm (Minimum versions defined in `server/package.json > engines`)
- mysql (Minimum version 8.0.22)
- redis

To install the prerequisities: 
- install `brew`
- setup `mysql` server via brew and start it
- setup `redis` via brew and start it

## Installation
### server

- paste `migrations_heroku.sql` into a mysql database 
- setup .env based on .env.example
- Set IOTA_NODE_CHRYSALIS to a currently online API-allowing, PoW-allowing iota node in the corresponding net

```bash
cd server
npm install
npm start
```

### client
```bash
cd client
cd helpa-client
npm install
npm start
```

open `http://127.0.0.1:3000` not (!) `http://localhost` , because it doesn't allow google captchas.

### Setting up the External service keys in client/server .env
- [onramper.com](https://onramper.com/#API-key): client - REACT_APP_ONRAMPER_API_KEY
- [google captcha v3](https://www.google.com/recaptcha/):  client - REACT_APP_RECAPTCHA_KEY, RECAPTCHA_KEY
- [nomics.com](https://nomics.com/): server - NOMICS_API_KEY
- [mail service](https://mailtrap.io/): server - EMAIL_PASSW
- server - db_url must end with `?charset=utf8mb4`

## Getting started
Setting a platform user (for "on the house" donations):

- Signup an initial user (will serve as platform account)
- Go to the database and set `member_state=1` for this user in `usersdata` to enable cashouts
- Go to the database and copy `priv_key` for this user.
- Replace the whitespace with "_" and set it in .env as HELPA_DONATION_ACCOUNT
- Use an appropriate [faucet](https://faucet.testnet.chrysalis2.com/) for the testnet or comnet you're using to send funds to the `curr_public_key` (called `account number` in the web ui).


Setting up an admin user:
- Create a user and copy its `username, username_hash, passw` into `admin` table in the database
- Go to `/administratorview` to login as admin

## Live Rollout (Not just deployment)
- set client/helpa-client/.env from client/helpa-client/.env.production.example
- set server/.env from server/.env.production.example

## Documentation

### API documentation
API documentation can be generated into `server/docs` with

```bash
cd server
npm run docu
```

- `a_` are all api calls for which a user needs to be logged in
- some functions are not yet in use and will say `NOTE: CURRENTLY UNUSED`
- a list of currently unused/unfinished features:
  - campaigns (managed donation campaigns)
  - campwithdrawals (withdrawing managed donation campaigns to initiator only)
  - recurrents (recurrent donations)
  - internal (cronjobs for removing flags)
  - limiterCheck (log api calls based on ip and potentially blacklist)
  - iota-devnet, iota-devnet-seed (old iota1.0 support)
  - withdrawals is a legacy version from withdraws and will be removed

### Techrider
https://www.figma.com/file/Gvs8f7FzLkw7LV4ebPYIvf/helpa-tech

## Supporting the project

If you would like to contribute to this project, consider posting a [bug report](https://github.com/zwonk/helpastranger/issues/new), [feature request](https://github.com/zwonk/helpastranger/issues/new) or a [pull request](https://github.com/zwonk/helpastranger/pulls/).  

See the [contributing guidelines](.github/CONTRIBUTING.md) for more information.

### Running tests

To be uploaded

### Updating documentation

Please update the documention when needed by editing [`JSDoc`](http://usejsdoc.org) annotations and running `npm run docs` from the root directory.

## Joining the discussion

If you want to get involved in the community, need help with getting setup, have any issues related with the library contact this [mail](info@helpastranger.net).

## License
For non-profit use, commercial or non-commercial this software is licensed under [MIT license](https://opensource.org/licenses/MIT)<Help A Stranger Collective, 2022>.
For for-profit use, the commercial rights of this software belong to the owner of this [`NFT`](http://opensea.org).


The owner of the NFT can be contacted via mail if he publishes his mail and proves the holding of the NFTs.
As a fallback the `requestAccess` method on the smart contract can be invoked to store a message on the ethereum blockchain regarding for-profit usage of the software. This starts a counter of 2 months after which the NFT will be destroyed if the owner of the NFT does not respond via the `respondToAccessRequest` method. The commercial rights for for-profit use will then be licenses under the [MIT license](https://opensource.org/licenses/MIT)<Help A Stranger Collective, 2022>.


Invoking the `requestAccess(string calldata message) ` method requires the sending of 60000 gas as compensation for the cost of the NFT owner to invoke the `respondToAccessRequest(string calldata message)` method. 

## NFT of source code
The NFT of this source code belongs to the owner of this NFT [`NFT`](http://opensea.org) and included the commercial rights for the for-profit use of the software.