import awsgi
import random
import product_manager
from dbconn import DBConn
from flask_cors import CORS
from flask import Flask, jsonify, request

# App Instance
app = Flask(__name__)
dbconn = DBConn()
CORS(app)

@app.route("/api/products/total-count", methods=["GET"])
def get_product_count():
    return jsonify(product_manager.get_product_count())

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
    colors = dbconn.get_doc("products", "misc_data", "659e165de751f017ecdcc0af")['colors']
    return jsonify(colors)

@app.route("/api/products/get-user-recommended-item", methods=["GET"])
def get_recommended_item():
    products = get_random_products()
    return jsonify(products.json[0])

@app.route("/api/products/get-collections", methods=["GET"])
def get_collections():
    return jsonify(product_manager.get_all_collections())

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

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

# dbconn.update_one("products", collection, {"_id" : product["_id"]}, {"$set": {"prod_id": str(uuid.uuid4()) + "-" + str(int(time.time_ns()))}})

if __name__ == "__main__":
    app.run(debug=True, port=8080)