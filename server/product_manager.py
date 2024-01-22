import os
import json
import time
import uuid
import base64
import mimetypes
from dbconn import DBConn
from typing import List, Dict
from datetime import datetime

class ProductManager():

    def __init__(self):
        self.dbconn = DBConn()
        mimetypes.add_type('image/webp', '.webp')

    def get_product_count(self) -> int:
        collections = self.dbconn.get_all_collections("products")
        product_count = 0
        for collection in collections:
            if collection != "misc_data":
                product_count += sum(1 for _ in self.dbconn.get_all_docs("products", collection))
        return product_count

    def get_collection_count(self) -> int:
        collections = self.dbconn.get_all_collections("products")
        collections = [collection for collection in collections if collection != "misc_data"]
        return len(collections)

    def get_collections(self) -> List[str]:
        collections = self.dbconn.get_doc("products", "misc_data", "000001")["collections"]
        return collections

    def get_collection(self, collection: str) -> List[Dict[str, any]]:
        cursor = self.dbconn.get_all_docs("products", collection)
        products = []
        for product in cursor:
            products.append({key: product[key] for key in product if key != "_id"})
        return products

    def get_all_collections(self) -> List[str]:
        collections = self.dbconn.get_all_collections("products")
        collections = [collection for collection in collections if collection != "misc_data"]
        return collections

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
            
    def _get_collection(self) -> str:
        collection = input("Choose a collection: ")
        products = self.get_collection(collection)
        for product in products:
            images = []
            for image in product["images"]:
                images.append(str(image[:40] + "..."))
            product["images"] = images
        return "\n\n".join(str(product) for product in products)

    def _check_if_exists(self, prod_id: str):
        collections = self.get_all_collections()
        for collection in collections:
            document = self.dbconn.find_one("products", collection, {"prod_id" : prod_id})
            if document:
                return True
        return False

    def _get_product(self) -> str:
        prod_id = input("Enter a Product ID: ")
        product = self.get_product(prod_id)
        for element in product.keys():
            product[element] = str(product[element]) if type(product[element]) is not list else product[element]
        with open(prod_id, "w") as file:
            json.dump(product, file, indent=4)
        return str(product) + "\n Product data wrote to: " + prod_id + ".json"

    def _get_all_product_ids(self) -> List[str]:
        collections = self.get_all_collections()
        product_ids = []
        for collection in collections:
            cursor = self.dbconn.get_all_docs("products", collection)
            for product in cursor:
                product_ids.append(product["prod_id"])
        return product_ids
    
    def _convert_image_to_base64(self, image_path: str) -> str:
        with open(image_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
        return encoded_string

    def _images_to_base64_web(self, folder_path: str) -> List[str]:
        base64_images = []
        for file_name in os.listdir(folder_path):
            if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                file_path = os.path.join(folder_path, file_name)
                mime_type, _ = mimetypes.guess_type(file_path)
                if mime_type:
                    encoded_image = self._convert_image_to_base64(file_path)
                    data_uri = f"data:{mime_type};base64,{encoded_image}"
                    base64_images.append(data_uri)
        return base64_images

    def _add_product(self, collection: str = None, name: str = None, description: str = None, 
                    colors: List[str] = None, price: int = None, 
                    tags: List[str] = None, images: List[str] = None) -> str:
        
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
        input("Upload images to ./images and press enter when ready") if images is None else ""
        images = self._images_to_base64_web("./images") if images is None else images
        prod_id = str(uuid.uuid4()) + "-" + str(int(time.time_ns()))
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
        result = self.dbconn.insert_doc("products", collection, product)
        if result.acknowledged:
            return "Product successfully inserted: " + prod_id
        else:
            return "Product failed to insert"
        
    def _remove_product(self,prod_id: str = None):
        prod_id = input("Enter a Product ID: ") if prod_id is None else prod_id
        collection = self._locate_product_collection(prod_id)
        result = self.dbconn.delete_one("products", collection, prod_id)
        if result.acknowledged:
            return "Products removed: " + str(result.deleted_count)
        else:
            return "Product failed to remove"
        
    def _update_product(self, prod_id: str = None, update: Dict[str, any] = None):
        prod_id = input("Enter a Product ID: ") if prod_id is None else prod_id
        product = self._check_if_exists(prod_id) 
        if product:
            collection =self. _locate_product_collection(prod_id)
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
            result = self.dbconn.update_one("products", collection, {"prod_id" : prod_id}, {"$set": {key: value}})
            if result.acknowledged:
                return "Product updated"
            else:
                return "Product failed to update"
        else:
            return "Product does not exist"

if __name__ == "__main__":
    import hashlib
    import warnings
    import argparse
    import pandas as pd
    import xlwings as xw
    warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl.worksheet._reader")

    pm = ProductManager()
    parser = argparse.ArgumentParser(description="Product Manager")
    parser.add_argument("-d", "--direct")
    args = parser.parse_args()

    actions = {
        "help" : """
        get product: Requires prod_id, returns product
        add product: Adds a product to the products database
        remove product: Requires prod_id, removes product
        update product: Requires prod_id, updates product
        get collection: Requires collection, returns all products in collection
        """,
        "get product" : pm._get_product,
        "add product" : pm._add_product,
        "remove product" : pm._remove_product,
        "update product" : pm._update_product,
        "get collection" : pm._get_collection
    }

    def file_hash(filepath):
        """Generate a hash of a file."""
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()

    if not args.direct:
        app = xw.App(visible=False)  # Set visible to True if you want Excel to open
        workbook = xw.Book("./product-manager.xlsm")
        worksheet = workbook.sheets[0]  # Indexing starts from 0
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
        absolute_file_path = os.path.abspath("./product-manager.xlsm")
        os.startfile(absolute_file_path)

        initial_hash = file_hash("./product-manager.xlsm")
        while True:
            time.sleep(5)  # Check every 5 seconds
            new_hash = file_hash("./product-manager.xlsm")
            if new_hash != initial_hash:
                print("File has been modified. Reading new data...")
                df = pd.read_excel("./product-manager.xlsm")
                initial_hash = new_hash

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
                        result = pm._remove_product(prod_id)
                        total_changes["removed"] = int(total_changes["removed"]) + 1
                        df = df[df['Product ID'] != prod_id].dropna(axis=0)
                        print(result)

                # Add and update products as needed
                for index, row in df.iterrows():
                    if pd.isna(row["Product ID"]):
                        # Create a new product and add it to the database
                        result = pm._add_product(row["Collection"], row["Name"], row["Description"], 
                                            [str(color.strip()).capitalize() for color in row["Colors"].split(",")],
                                            int(row["Price"] * 100), 
                                            [str(tag.strip()) for tag in row["Tags"].split(",")], 
                                            [str(image.strip()) for image in row["Images"].split(",")])
                        total_changes["added"] = int(total_changes["added"]) + 1
                        print(result)
                    else:
                        # Check if the product is different than the one in the database, and update it accordingly 
                        product = pm.get_product(row["Product ID"])
                        changes = f"Total Changes for {row['Product ID']}: "
                        if product["name"] != row["Name"]:
                            changes += f"Name: (Old: {product['name']})"
                            result = pm._update_product(row["Product ID"], {"name": row["Name"]})
                            if result == "Product updated":
                                changes += f"(New: {row['Name']})"

                        if product["description"] != row["Description"]:
                            changes += f"Description: (Old: {product['description']})"
                            result = pm._update_product(row["Product ID"], {"description": row["Description"]})
                            if result == "Product updated":
                                changes += f"(New: {row['Description']})"

                        if product["colors"] != [str(color.strip()).capitalize() for color in row["Colors"].split(",")]:
                            changes += f"Colors: (Old: {product['colors']})"
                            result = pm._update_product(row["Product ID"], {"colors": [str(color.strip()).capitalize() for color in row["Colors"].split(",")]})
                            if result == "Product updated":
                                changes += f"(New: {[str(color.strip()).capitalize() for color in row['Colors'].split(',')]})"

                        if product["price"] != int(row["Price"] * 100):
                            changes += f"Price: (Old: {product['price']})"
                            result = pm._update_product(row["Product ID"], {"price": int(row["Price"] * 100)})
                            if result == "Product updated":
                                changes += f"(New: {row['Price']})"

                        if product["tags"] != [str(tag.strip()) for tag in row["Tags"].split(",")]:
                            changes += f"Tags: (Old: {product['tags']})"
                            result = pm._update_product(row["Product ID"], {"tags": [str(tag.strip()) for tag in row["Tags"].split(",")]})
                            if result == "Product updated":
                                changes += f"(New: {[str(tag.strip()) for tag in row['Tags'].split(',')]})"

                        if product["images"] != [str(image.strip()) for image in row["Images"].split(",")]:
                            changes += f"Images: (Old: {product['images']})"
                            result = pm._update_product(row["Product ID"], {"images": [str(image.strip()) for image in row["Images"].split(",")]})
                            if result == "Product updated":
                                changes += f"(New: {[str(image.strip()) for image in row['Images'].split(',')]})"

                        if product["rating"] != row["Rating"]:
                            changes += f"Rating: (Old: {product['rating']})"
                            result = pm._update_product(row["Product ID"], {"rating": row["Rating"]})
                            if result == "Product updated":
                                changes += f"(New: {row['Rating']})"

                        if product["date-added"] != row["Date Added"]:
                            changes += f"Date Added: (Old: {product['date-added']})"
                            result = pm._update_product(row["Product ID"], {"date-added": row["Date Added"]})
                            if result == "Product updated":
                                changes += f"(New: {row['Date Added']})"

                        if not pd.isna(row["Comments"]) and product["comments"] != [str(comment.strip()) for comment in row["Comments"].split(",")]:
                            changes += f"Comments: (Old: {product['comments']})"
                            result = pm._update_product(row["Product ID"], {"comments": [str(comment.strip()) for comment in row["Comments"].split(",")]})
                            if result == "Product updated":
                                changes += f"(New: {[str(comment.strip()) for comment in row['Comments'].split(',')]})"

                        if changes != f"Total Changes for {row['Product ID']}: ":
                            total_changes["updated"] = int(total_changes["updated"]) + 1
                            print("\n" + changes)
                total_sum_changes = sum(total_changes.values())
                if total_sum_changes > 0:
                    print(f"\n\nTotal Changes: {total_sum_changes} ({total_changes})")
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
