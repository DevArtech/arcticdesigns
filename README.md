# Arctic Designs
Website for Arctic Designs - EComm 3D Printing Site\
\
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FDevArtech%2Farcticdesigns%2Fmain%2Fserver%2Fstats.json&query=%24.time_spent&suffix=%20hours&style=flat-square&label=Total%20Time%20Spent)\
\
Coding Time:\
[![wakatime](https://wakatime.com/badge/user/018c7a08-7532-4661-9881-1eb8ff884fb5/project/018ca4bd-735e-4f9b-8255-16a1b24f2f95.svg?style=flat-square)](https://wakatime.com/badge/user/018c7a08-7532-4661-9881-1eb8ff884fb5/project/018ca4bd-735e-4f9b-8255-16a1b24f2f95)\
![Figma Mockup](https://raw.githubusercontent.com/DevArtech/arcticdesigns/main/public/figma-mockup.png)
### Built With
![Static Badge](https://img.shields.io/badge/React-%2361DAFB?style=flat-square&logo=react&logoColor=%23000000)
![Static Badge](https://img.shields.io/badge/Next.js-%23000000?style=flat-square&logo=nextdotjs&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/TypeScript-%233178C6?style=flat-square&logo=typescript&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/Figma-%23F24E1E?style=flat-square&logo=figma&logoColor=%23ffffff)
![Static Badge](https://img.shields.io/badge/Python-%233776AB?style=flat-square&logo=python&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/Flask-%23000000?style=flat-square&logo=flask&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/MongoDB-%2347A248?style=flat-square&logo=mongodb&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/Amazon%20AWS-%23232F3E?style=flat-square&logo=amazonaws)
![Static Badge](https://img.shields.io/badge/Docker-%232496ED?style=flat-square&logo=docker&logoColor=%23ffffff)

## How to Setup
1. Clone the Repository
2. Create a .env file with the following:
```
ATLAS_URI=[Your MongoDB Endpoint]
API_ENDPOINT=[Your Server Endpoint (or local: http://127.0.0.1:8080)]
```
3. Run the following commands (for Windows)
 ```
 > npm install
 > cd server 
 > python -m venv venv
 > .\venv\Scripts\activate
 > pip install -r requirements.txt
 ```

 4. To run the application, run the following command in the terminal which is in the server directory: ```python .\lambda_function.py```
 5. Open another terminal in the main directory, and run ```npm run dev```
 6. Go to [https://localhost:3000](https://localhost:3000) to see the live local site

 ### How to use the Product Manager
 The Product Manager is included with the server files, and some of the lambda logic requires the Product Manager for code simplicity. To ues the Product Manager, follow these steps:
 1. Open a new terminal
 2. Navigate to the server directory (```cd server```)
 3. Connect to the virtual environment with ```.\venv\Scripts\activate``` (for Windows)
 4. Run the Product Manager with ```python .\product-manager.py```

 Once the Product Manager has started, you can type ```help``` to get all available commands

