from dbconn import DBConn
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import awsgi
import random

# App Instance
app = Flask(__name__)
dbconn = DBConn()
CORS(app)

@app.route("/api/products/total-count", methods=["GET"])
def get_product_count():
    collections = dbconn.get_all_collections("products")
    product_count = 0
    for collection in collections:
        product_count += sum(1 for _ in dbconn.get_all_docs("products", collection))
    return jsonify(product_count)

@app.route("/api/products/get-random-products", methods=["GET"])
def get_random_products():
    collections = dbconn.get_all_collections("products")
    products = []
    for collection in collections:
        cursor = dbconn.get_all_docs("products", collection)
        for product in cursor:
            # Append all keys except _id
            products.append({key: product[key] for key in product if key != "_id"})
            products[-1]["id"] = str(product["_id"])
    random.shuffle(products)
    return jsonify(products)

@app.route("/api/products/<collection>/<quantity>", methods=["GET"])
def get_amount_from_collection(collection: str, quantity: int):
    cursor = dbconn.get_all_docs("products", collection)
    products = []
    for product in cursor:
        # Append all keys except _id
        products.append({key: product[key] for key in product if key != "_id"})
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

if __name__ == "__main__":
    app.run(debug=True, port=8080)