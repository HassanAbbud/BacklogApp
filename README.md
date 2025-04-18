
# Gaming Backlog Project

Gaming Backlog webapp for tracking personal videogame data such as titles played and playtime.   

## Installation & setup


1. Clone project

```bash
git clone https://github.com/HassanAbbud/BacklogApp.git
```
2. Install dependencies

```bash
npm install
```

3. Run the project in a development environment

```bash
npm run dev
```
    
## Environment Variables

To run this project, you will need to add your mongo db name variable to your URI in a .env file and adjust the import in the config.js file. It should look something like:

`URI=Your mongo db key`

For security and authentication you will also need to create a variable named `ACCESS_TOKEN_SECRET` in a .env file that should be located at root level of the project. It should look something like:

`ACCESS_TOKEN_SECRET=Your randomly generated jwt secret`





## Authors

- [@HassanAbbud](https://github.com/HassanAbbud)
- [@AndresAcevedo](https://github.com/Andresac90)
- [@AkshaySanthosh](https://github.com/AkshayS-official)
- [@XiaoweiXue](https://github.com/XaviXCC)

- Team# 3
