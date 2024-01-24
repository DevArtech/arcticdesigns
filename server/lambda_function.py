import json
import awsgi
import random
from product_manager import ProductManager
from dbconn import DBConn
from flask_cors import CORS
from flask import Flask, jsonify, request

# App Instance
app = Flask(__name__)
dbconn = DBConn()
CORS(app)
pm = ProductManager()

@app.route("/api/products/total-count", methods=["GET"])
def get_product_count():
    return jsonify(pm.get_product_count())

@app.route("/api/products/get-random-products/<quantity>", methods=["GET"])
def get_random_products(quantity: int = 0):
    collections = dbconn.get_all_collections("products")
    products = []
    for collection in collections:
        if collection != "misc_data":
            cursor = dbconn.get_all_docs("products", collection)
            for product in cursor:
                # Append all keys except _id
                products.append({key: product[key] for key in product if key != "_id"})
                # Append _id as a string
                products[-1]["id"] = str(product["_id"])
    random.shuffle(products)
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/products/<collection>/<quantity>", methods=["GET"])
def get_amount_from_collection(collection: str, quantity: int):
    cursor = dbconn.get_all_docs("products", collection)
    products = []
    for product in cursor:
        # Append all keys except _id
        products.append({key: product[key] for key in product if key != "_id"})
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/misc-data/available-colors", methods=["GET"])
def get_available_colors():
    colors = dbconn.get_doc("products", "misc_data", "000001")['colors']
    return jsonify(colors)

@app.route("/api/products/get-user-recommended-item", methods=["GET"])
def get_recommended_item():
    products = get_random_products()
    return jsonify(products.json[0])

@app.route("/api/products/get-products-not/<collection>/<quantity>", methods=["POST"])
def get_products_not(collection: str, quantity: int):
    excluded_products = request.json
    products = []
    cursor = dbconn.get_all_docs("products", collection)
    for product in cursor:
        if product["prod_id"] not in excluded_products:
            # Append all keys except _id
            products.append({key: product[key] for key in product if key != "_id"})
    random.shuffle(products)
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/products/get-collections", methods=["GET"])
def get_collections():
    return jsonify(pm.get_all_collections())

@app.route("/api/products/get-product/<product_id>", methods=["GET"])
def get_product(product_id: str):
    product = pm.get_product(product_id)
    return jsonify({key: product[key] for key in product if key != "_id"})

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

# dbconn.update_one("products", collection, {"_id" : product["_id"]}, {"$set": {"prod_id": str(uuid.uuid4()) + "-" + str(int(time.time_ns()))}})

if __name__ == "__main__":
    app.run(debug=True, port=8080)