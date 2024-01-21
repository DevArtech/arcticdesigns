import os
import json
import time
import uuid
import base64
import mimetypes
from dbconn import DBConn
from typing import List, Dict
from datetime import datetime

dbconn = DBConn()
mimetypes.add_type('image/webp', '.webp')

def get_product_count() -> int:
    collections = dbconn.get_all_collections("products")
    product_count = 0
    for collection in collections:
        if collection != "misc_data":
            product_count += sum(1 for _ in dbconn.get_all_docs("products", collection))
    return product_count

def get_collection_count() -> int:
    collections = dbconn.get_all_collections("products")
    collections = [collection for collection in collections if collection != "misc_data"]
    return len(collections)

def get_collection(collection: str) -> List[Dict[any]]:
    cursor = dbconn.get_all_docs("products", collection)
    products = []
    for product in cursor:
        products.append({key: product[key] for key in product if key != "_id"})
    return products

def get_all_collections() -> List[str]:
    collections = dbconn.get_all_collections("products")
    collections = [collection for collection in collections if collection != "misc_data"]
    return collections

def get_product(prod_id: str) -> Dict[any]:
    collections = get_all_collections()
    for collection in collections:
        document = dbconn.find_one("products", collection, {"prod_id" : prod_id})
        if document:
            return document
        
def _convert_image_to_base64(image_path: str) -> str:
    with open(image_path, 'rb') as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode()
    return encoded_string

def _images_to_base64_web(folder_path: str) -> List[str]:
    base64_images = []
    for file_name in os.listdir(folder_path):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            file_path = os.path.join(folder_path, file_name)
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type:
                encoded_image = _convert_image_to_base64(file_path)
                data_uri = f"data:{mime_type};base64,{encoded_image}"
                base64_images.append(data_uri)
    return base64_images
        
def _get_collection() -> str:
    collection = input("Choose a collection: ")
    products = get_collection(collection)
    for product in products:
        images = []
        for image in product["images"]:
            images.append(str(image[:40] + "..."))
        product["images"] = images
    return "\n\n".join(str(product) for product in products)

def _get_product() -> str:
    prod_id = input("Enter a Product ID: ")
    product = get_product(prod_id)
    for element in product.keys():
        product[element] = str(product[element]) if type(product[element]) is not list else product[element]
    with open(prod_id, "w") as file:
        json.dump(product, file, indent=4)
    return str(product) + "\n Product data wrote to: " + prod_id + ".json"

def _add_product() -> str:
    name = input("Name: ")
    description = input("Description: ")
    price = int(float(input("Price: ")) * 100)
    tags = []
    while True:
        tag = input("Tag (exit to stop): ")
        if tag.lower() == "exit":
            break
        tags.append(tag)
    colors = []
    while True:
        color = input("Color (exit to stop): ")
        if color.lower() == "exit":
            break
        colors.append(color)
    input("Upload images to ./images and press enter when ready")
    images = _images_to_base64_web("./images")
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
    collection = input("Collection: ")
    result = dbconn.insert_doc("products", collection, product)
    if result.acknowledged:
        return "Product successfully inserted: " + str(result.inserted_id)
    else:
        return "Product failed to insert"

actions = {
    "help" : "test",
    "get product" : _get_product,
    "add product" : _add_product,
    "remove product" : "",
    "update product" : "",
    "get collection" : _get_collection
}

if __name__ == "__main__":
    run = True
    while(run):
        print(f"\nConnected: {get_product_count()} products across {get_collection_count()} collections")
        response = input("Request: ")
        if response in actions.keys():
            print(actions[response]())
        else:
            print("Invalid request")
