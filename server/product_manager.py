import os
import re
import json
import time
import uuid
import mimetypes
from dbconn import DBConn
from typing import List, Dict
from datetime import datetime

class ProductManager():

    def __init__(self):
        self.dbconn = DBConn()
        mimetypes.add_type('image/webp', '.webp')

    def get_all_collections(self) -> List[str]:
        collections = self.dbconn.get_all_collections("products")
        collections = [collection for collection in collections if collection != "misc_data"]
        return collections
    
    def get_product_count(self) -> int:
        collections = self.get_all_collections()
        product_count = 0
        for collection in collections:
            if collection != "misc_data":
                product_count += sum(1 for _ in self.dbconn.get_all_docs("products", collection))
        return product_count

    def get_collection_count(self) -> int:
        collections = self.get_all_collections()
        collections = [collection for collection in collections if collection != "misc_data"]
        return len(collections)

    def get_collection(self, collection: str) -> List[Dict[str, any]]:
        cursor = self.dbconn.get_all_docs("products", collection)
        products = []
        for product in cursor:
            products.append({key: product[key] for key in product if key != "_id"})
        return products

    def get_product(self, prod_id: str) -> Dict[str, any]:
        collections = self.get_all_collections()
        for collection in collections:
            document = self.dbconn.find_one("products", collection, {"prod_id" : prod_id})
            if document:
                return document
            
    def _locate_product_collection(self, prod_id: str) -> str:
        collections = self.get_all_collections()
        for collection in collections:
            document = self.dbconn.find_one("products", collection, {"prod_id" : prod_id})
            if document:
                return collection

    def _check_if_exists(self, prod_id: str):
        collections = self.get_all_collections()
        for collection in collections:
            document = self.dbconn.find_one("products", collection, {"prod_id" : prod_id})
            if document:
                return True
        return False

    def _get_all_product_ids(self) -> List[str]:
        collections = self.get_all_collections()
        product_ids = []
        for collection in collections:
            cursor = self.dbconn.get_all_docs("products", collection)
            for product in cursor:
                product_ids.append(product["prod_id"])
        return product_ids

if __name__ == "__main__":
    import hashlib
    import warnings
    import argparse
    import subprocess
    import pandas as pd
    import xlwings as xw
    from pydrive2.auth import GoogleAuth
    from pydrive2.drive import GoogleDrive
    from oauth2client.service_account import ServiceAccountCredentials
    warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl.worksheet._reader")

    # Setup Product Manager depending on type
    pm = ProductManager()
    parser = argparse.ArgumentParser(description="Product Manager")
    parser.add_argument('-d', '--direct', action='store_true', 
                        help='Do not use the Excel visualizer and directly interface with the Product Manager')
    args = parser.parse_args()

    # Set up drive connection
    SCOPES = ['https://www.googleapis.com/auth/drive']
    gauth = GoogleAuth()
    gauth.credentials = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(os.getenv("CREDENTIALS")), SCOPES)
    drive = GoogleDrive(gauth)

    def file_hash(filepath):
        """Generate a hash of a file."""
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    
    def _upload_images_to_drive(prod_id: str, name: str):
        file_metadata = {
            'title': prod_id,
            'mimeType': 'application/vnd.google-apps.folder'
        }

        folder = drive.CreateFile(file_metadata)
        folder.Upload()
        folder_id = folder['id']

        for i, file_name in enumerate(os.listdir(f"./images/")):
            if os.path.isdir(os.path.join("./images/", file_name)):
                for j, nested_file_name in enumerate(os.listdir(os.path.join("./images/", name))):
                    file = drive.CreateFile({'title': j, 'parents': [{'id': folder_id}]})
                    file.SetContentFile(f'./images/{name}/{nested_file_name}')
                    file.Upload()
            else:
                file = drive.CreateFile({'title': i, 'parents': [{'id': folder_id}]})
                file.SetContentFile(f'./images/{file_name}')
                file.Upload()

        image_links = []
        file_list = drive.ListFile({'q': f"'{folder_id}' in parents and trashed=false"}).GetList()
        for file in file_list:
            file.InsertPermission({
                'type': 'anyone',
                'value': 'anyone',
                'role': 'reader'
            })
            match = re.search(r'https://drive\.google\.com/file/d/(.*?)/view\?usp=drivesdk', file['alternateLink'])
            file_id = match.group(1)
            if file["title"].split(".")[0] == "0":
                image_links = [f"https://drive.google.com/thumbnail?id={file_id}&sz=w700"] + image_links
            else:
                image_links.append(f"https://drive.google.com/thumbnail?id={file_id}&sz=w700")
        
        return image_links
    
    def _remove_product_images_from_drive(prod_id: str):
        folder_id = None
        file_list = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()
        for file in file_list:
            if file['title'] == prod_id and file['mimeType'] == 'application/vnd.google-apps.folder':
                folder_id = file['id']
        file_to_delete = drive.CreateFile({'id': folder_id})
        file_to_delete.Delete()

    # def _get_image_links_from_drive(prod_id: str):
    #     folder_id = None
    #     file_list = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()
    #     for file in file_list:
    #         if file['title'] == prod_id and file['mimeType'] == 'application/vnd.google-apps.folder':
    #             folder_id = file['id']
    #     file_list = drive.ListFile({'q': f"'{folder_id}' in parents and trashed=false"}).GetList()
    #     image_links = []
    #     for file in file_list:
    #         match = re.search(r'https://drive\.google\.com/file/d/(.*?)/view\?usp=drivesdk', file['alternateLink'])
    #         file_id = match.group(1)
    #         image_links.append(f"https://drive.google.com/thumbnail?id={file_id}&sz=w700")
    #     return image_links
    
    def _add_product(collection: str = None, name: str = None, description: str = None, 
                    colors: List[str] = None, price: int = None, 
                    tags: List[str] = None, images: bool = False) -> str:
        
        name = input("Name: ") if name is None else name
        description = input("Description: ") if description is None else description
        price = int(float(input("Price: ")) * 100) if price is None else price
        tags = [] if tags is None else tags
        if len(tags) == 0:
            while True:
                tag = input("Tag (exit to stop): ")
                if tag.lower() == "exit":
                    break
                tags.append(tag)
        colors = [] if colors is None else colors
        if len(colors) == 0:
            while True:
                color = input("Color (exit to stop): ")
                if color.lower() == "exit":
                    break
                colors.append(color)
        input("Upload images to ./images and press enter when ready") if images is False else ""
        prod_id = str(uuid.uuid4()) + "-" + str(int(time.time_ns()))
        images = _upload_images_to_drive(prod_id, name)
        product = {
            "prod_id" : prod_id,
            "name" : name,
            "images": images,
            "description" : description,
            "colors" : colors,
            "price" : price,
            "tags" : tags,
            "date-added" : datetime.now(),
            "rating" : 5,
            "comments": []
        }
        collection = input("Collection: ") if collection is None else collection
        result = pm.dbconn.insert_doc("products", collection, product)
        if result.acknowledged:
            return "Product successfully inserted: " + prod_id
        else:
            return "Product failed to insert"
        
    def _update_product(prod_id: str = None, update: Dict[str, any] = None):
        prod_id = input("Enter a Product ID: ") if prod_id is None else prod_id
        product = pm._check_if_exists(prod_id) 
        if list(update.keys())[0] == "collection":
            product = pm.get_product(prod_id)
            collection = pm._locate_product_collection(prod_id)
            delete_result = pm.dbconn.delete_one("products", collection, prod_id)
            add_result = pm.dbconn.insert_doc("products", update["collection"], product)
            if add_result.acknowledged and delete_result.acknowledged:
                return "Product updated"
        elif product:
            collection = pm._locate_product_collection(prod_id)
            key = input("Key to update: ") if update is None else list(update.keys())[0]
            value = input("New value: ") if update is None else update[key]
            value_type = input("Value type: ") if update is None else ""
            if value_type == "int":
                value = int(value)
            elif value_type == "float":
                value = float(value)
            elif value_type == "bool":
                value = bool(value)
            elif value_type == "list":
                value = value.split(",")
            result = pm.dbconn.update_one("products", collection, {"prod_id" : prod_id}, {"$set": {key: value}})
            if result.acknowledged:
                return "Product updated"
            else:
                return "Product failed to update"
        else:
            return "Product does not exist"
        
    def _remove_product(prod_id: str = None):
        prod_id = input("Enter a Product ID: ") if prod_id is None else prod_id
        collection = pm._locate_product_collection(prod_id)
        result = pm.dbconn.delete_one("products", collection, prod_id)
        _remove_product_images_from_drive(prod_id)
        if result.acknowledged:
            return "Products removed: " + str(result.deleted_count)
        else:
            return "Product failed to remove"
        
    def _get_product() -> str:
        prod_id = input("Enter a Product ID: ")
        product = pm.get_product(prod_id)
        for element in product.keys():
            product[element] = str(product[element]) if type(product[element]) is not list else product[element]
        with open(prod_id, "w") as file:
            json.dump(product, file, indent=4)
        return str(product) + "\n Product data wrote to: " + prod_id + ".json"
    
    def _get_collection() -> str:
        collection = input("Choose a collection: ")
        products = pm.get_collection(collection)
        for product in products:
            images = []
            for image in product["images"]:
                images.append(str(image[:40] + "..."))
            product["images"] = images
        return "\n\n".join(str(product) for product in products)

    def _update_workbook():
        # Setup workbook
        app = xw.App(visible=False)
        workbook = xw.Book("./product-manager.xlsm")
        worksheet = workbook.sheets[0]
        collections = pm.get_all_collections()
        range_to_clear = worksheet.range('B3:L10000')
        range_to_clear.clear_contents()

        i = 3
        for collection in collections:
            products = pm.get_collection(collection)
            for product in products:
                # Collection
                worksheet.range(f'B{i}').value = collection
                # Product ID
                worksheet.range(f'C{i}').value = product["prod_id"]
                # Name
                worksheet.range(f'D{i}').value = product["name"]
                # Images
                worksheet.range(f'E{i}').value = ",".join(product["images"])
                # Description
                worksheet.range(f'F{i}').value = product["description"]
                # Colors
                worksheet.range(f'G{i}').value = ",".join(product["colors"])
                # Price
                worksheet.range(f'H{i}').value = float(product["price"]) / 100
                # Tags
                worksheet.range(f'I{i}').value = ",".join(product["tags"])
                # Date Added
                worksheet.range(f'J{i}').value = product["date-added"]
                # Rating
                worksheet.range(f'K{i}').value = product["rating"]
                # Comments
                worksheet.range(f'L{i}').value = ",".join(product["comments"])
                i += 1

        # Save the workbook
        workbook.save("./product-manager.xlsm")
        app.quit()

    actions = {
        "help" : """
        get product: Requires prod_id, returns product
        add product: Adds a product to the products database
        remove product: Requires prod_id, removes product
        update product: Requires prod_id, updates product
        get collection: Requires collection, returns all products in collection
        """,
        "get product" : _get_product,
        "add product" : _add_product,
        "remove product" : _remove_product,
        "update product" : _update_product,
        "get collection" : _get_collection
    }

    if not args.direct:
        # Kill the workbook so it can be updated
        subprocess.call("TASKKILL /F /IM excel.exe", shell=True)

        # Update workbook with latest data
        _update_workbook()
        absolute_file_path = os.path.abspath("./product-manager.xlsm")
        os.startfile(absolute_file_path)

        # Loop to check for workbook updates, and perform updates accordingly
        initial_hash = file_hash("./product-manager.xlsm")
        while True:
            time.sleep(5)  # Check every 5 seconds
            new_hash = file_hash("./product-manager.xlsm")
            if new_hash != initial_hash:
                print("File has been modified. Reading new data...")

                # Kill the workbook so it can be updated
                subprocess.call("TASKKILL /F /IM excel.exe", shell=True)

                # Read data from workbook
                df = pd.read_excel("./product-manager.xlsm")

                # Clean up dataframe
                df.drop(df.columns[0], axis=1, inplace=True)
                df.columns = df.iloc[0]
                df = df.drop([0])
                df = df.reset_index(drop=True)

                total_changes = {"removed": 0, "added": 0, "updated": 0}

                # Remove products whos IDs no longer exist
                existing_prod_ids = pm._get_all_product_ids()
                new_prod_ids = df["Product ID"].dropna()
                new_prod_ids = [str(prod_id) for prod_id in new_prod_ids]
                for prod_id in existing_prod_ids:
                    if prod_id not in new_prod_ids:
                        result = _remove_product(prod_id)
                        total_changes["removed"] = int(total_changes["removed"]) + 1
                        df = df[df['Product ID'] != prod_id].dropna(axis=0)
                        print(result)

                # Add and update products as needed
                for index, row in df.iterrows():
                    if pd.isna(row["Product ID"]):
                        # Create a new product and add it to the database
                        result = _add_product(row["Collection"], row["Name"], row["Description"], 
                                            [str(color.strip()).capitalize() for color in row["Colors"].split(",")],
                                            int(row["Price"] * 100), 
                                            [str(tag.strip()) for tag in row["Tags"].split(",")], 
                                            True)
                        total_changes["added"] = int(total_changes["added"]) + 1
                        print(result)
                    else:
                        # Check if the product is different than the one in the database, and update it accordingly 
                        product = pm.get_product(row["Product ID"])
                        collection = pm._locate_product_collection(row["Product ID"])
                        changes = f"Total Changes for {row['Product ID']}: "

                        # Update collection
                        if collection != row["Collection"]:
                            changes += f"Collection: (Old: {collection})"
                            result = _update_product(row["Product ID"], {"collection": row["Collection"]})
                            if result == "Product updated":
                                changes += f" (New: {row['Collection']})"

                        # Update name
                        if product["name"] != row["Name"]:
                            changes += f"Name: (Old: {product['name']})"
                            result = _update_product(row["Product ID"], {"name": row["Name"]})
                            if result == "Product updated":
                                changes += f" (New: {row['Name']})"

                        # Update description
                        if product["description"] != row["Description"]:
                            changes += f"Description: (Old: {product['description']})"
                            result = _update_product(row["Product ID"], {"description": row["Description"]})
                            if result == "Product updated":
                                changes += f" (New: {row['Description']})"

                        # Update colors
                        if product["colors"] != [str(color.strip()).capitalize() for color in row["Colors"].split(",")]:
                            changes += f"Colors: (Old: {product['colors']})"
                            result = _update_product(row["Product ID"], {"colors": [str(color.strip()).capitalize() for color in row["Colors"].split(",")]})
                            if result == "Product updated":
                                changes += f" (New: {[str(color.strip()).capitalize() for color in row['Colors'].split(',')]})"

                        # Update price
                        if product["price"] != int(row["Price"] * 100):
                            changes += f"Price: (Old: {product['price']})"
                            result = _update_product(row["Product ID"], {"price": int(row["Price"] * 100)})
                            if result == "Product updated":
                                changes += f" (New: {row['Price']})"

                        # Update tags
                        if product["tags"] != [str(tag.strip()) for tag in row["Tags"].split(",")]:
                            changes += f"Tags: (Old: {product['tags']})"
                            result = _update_product(row["Product ID"], {"tags": [str(tag.strip()) for tag in row["Tags"].split(",")]})
                            if result == "Product updated":
                                changes += f" (New: {[str(tag.strip()) for tag in row['Tags'].split(',')]})"

                        # Update images
                        if product["images"] != [str(image.strip()) for image in row["Images"].split(",")]:
                            changes += f"Images: (Old: {product['images']})"
                            result = _update_product(row["Product ID"], {"images": [str(image.strip()) for image in row["Images"].split(",")]})
                            if result == "Product updated":
                                changes += f" (New: {[str(image.strip()) for image in row['Images'].split(',')]})"

                        # Update rating
                        if product["rating"] != row["Rating"]:
                            changes += f"Rating: (Old: {product['rating']})"
                            result = _update_product(row["Product ID"], {"rating": row["Rating"]})
                            if result == "Product updated":
                                changes += f" (New: {row['Rating']})"

                        # Update date added
                        if product["date-added"] != row["Date Added"]:
                            changes += f"Date Added: (Old: {product['date-added']})"
                            result = _update_product(row["Product ID"], {"date-added": row["Date Added"]})
                            if result == "Product updated":
                                changes += f" (New: {row['Date Added']})"

                        # Update comments
                        if not pd.isna(row["Comments"]) and product["comments"] != [str(comment.strip()) for comment in row["Comments"].split(",")]:
                            changes += f"Comments: (Old: {product['comments']})"
                            result = _update_product(row["Product ID"], {"comments": [str(comment.strip()) for comment in row["Comments"].split(",")]})
                            if result == "Product updated":
                                changes += f" (New: {[str(comment.strip()) for comment in row['Comments'].split(',')]})"

                        # Print any updates
                        if changes != f"Total Changes for {row['Product ID']}: ":
                            total_changes["updated"] = int(total_changes["updated"]) + 1
                            print("\n" + changes)

                # Print total changes
                total_sum_changes = sum(total_changes.values())
                if total_sum_changes > 0:
                    print(f"\n\nTotal Changes: {total_sum_changes} ({total_changes})")
                
                # Update the workbook with any new data
                _update_workbook()
                initial_hash = file_hash("./product-manager.xlsm")

                # Restart the workbook
                absolute_file_path = os.path.abspath("./product-manager.xlsm")
                os.startfile(absolute_file_path)
            else:
                print("No changes found")
    else:
        run = True
        while(run):
            print(f"\nConnected: {pm.get_product_count()} products across {pm.get_collection_count()} collections")
            response = input("Request: ")
            if response in actions.keys():
                print(actions[response]())
            else:
                print("Invalid request")
