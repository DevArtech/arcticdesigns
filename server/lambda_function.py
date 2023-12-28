from dbconn import DBConn
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import awsgi

# App Instance
app = Flask(__name__)
dbconn = DBConn()
CORS(app)

@app.route("/api/home", methods=["GET"])
def return_home():
    return jsonify({
        'message' : 'This is a test!'
    })

@app.route("/api/v1/submit", methods=["POST"])
def log_user_data():
    user_data = request.json
    response = dbconn.insert_doc("account", "user", {"username" : user_data["username"], "password" : user_data["password"]})
    if response.acknowledged:
        logs = []
        for log in dbconn.get_all_docs("account", "user"):
            logs.append({"username" : log["username"], "password": log["password"]})

        return jsonify(logs)
    return "Error inserting user"

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

if __name__ == "__main__":
    app.run(debug=True, port=8080)