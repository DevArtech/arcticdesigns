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

 ## How to Setup the Product Manager
 The Product Manager is included with the server files, and some of the lambda logic requires the Product Manager for code simplicity. 
 To set up the Product Manager (Direct or Visualizer mode) follow the following steps:
 1. Navigate to the server folder, and run the virtual enviornment.
 2. Run ```pip install -r pm-reqs.txt```
 3. Follow the steps in this [guide](https://developers.google.com/workspace/guides/create-project) to create a project.
 4. In the left-side menu, go to APIs & Services
 5. Select Enable APIs And Services
 6. Locate the Google Drive API and enable it
 7. In the left-side menu, go to IAM & Admin
 8. Go to Service Accounts
 9. Select Create Service Account
 10. Enter the Service Account details (Account name, permissions, etc.)
 11. On the newly created service account, click the three dots, and select Manage keys
 12. Add a key, and choose JSON mode.
 13. Take the JSON from the newly created key, and save it to your .env file as shown:
 ```
 ATLAS_URI=[Your MongoDB Endpoint]
API_ENDPOINT=[Your Server Endpoint]
CREDENTIALS='[Your Service Account Credentials Here]'
 ```
14. Now, you should be all set to use the Product Manager!
 
## How to Use the Product Manager
 To use the Product Manager, follow these steps:
 1. Open a new terminal
 2. Navigate to the server directory (```cd server```)
 3. Connect to the virtual environment with ```.\venv\Scripts\activate``` (for Windows)
 4. Install the Product Manager requirements with ```pip install -r pm-reqs.txt```
 5. Run the Product Manager with ```python .\product-manager.py```
 6. To run the Product Manager without the Excel interface (Direct mode), do ```python .\product-manager.py -d```

 Once the Product Manager in Direct mode has started, you can type ```help``` to get all available commands.

 To use the Product Manager in Visualizer Mode, simply fill out the categories with the corresponding data. Selecting a cell in a column which stores array-like values will open it up in a new sheet for easier editing (Macros must be enabled to use this function).

### Adding Products in the Product Manager
 When adding products, only fill out the Collection, Name, Description, Colors, Price, and Tags columns. Images can be added by saving the image files to the images folder in the server directory. Product ID, Image links, Date Added, and Rating will all be automatically generated once the sheet is saved.

### Updating Products in the Product Manager
 Any column of a product can be edited and will update when the sheet has been saved.

### Deleting Products in the Product Manager
 A product can be deleted by removing all information in the product's row. The product will be deleted from the database once the sheet has been saved.

Between each save, the Product Manager will close and reopen the visualizer to update the data (Excel cannot be edited while open).

