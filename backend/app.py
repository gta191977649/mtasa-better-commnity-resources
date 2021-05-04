from flask import Flask,request,jsonify
from bs4 import BeautifulSoup
import requests as req
from flask_cors import CORS
import re

def obtainResIdFromQueryParameter(query):
    id = re.findall("id=([^&]*)",query)
    return id[0]
def obtainResourceImg(id):
    resp = req.get("https://community.multitheftauto.com/index.php?p=gallery&s=preview&id="+id)
    soup = BeautifulSoup(resp.text, 'lxml')
    res = soup.find("ul", {"id": "gallery"}) #fetch gallery
    if res:
        res = res.findAll("img") #fetch image url
        #format to json api
        imgs = []
        for img in res:
            imgs.append({
                "id":id,
                "url":img["src"]
            })
        return imgs
    return []
def searchResource(keywords,page):
    # Fetch Resource Contents
    resp = req.get("https://community.multitheftauto.com/index.php?p=resources&s=list&name="+keywords+"&page="+str(page))
    soup = BeautifulSoup(resp.text, 'lxml')
    table = soup.find("table")
    page = soup.find("p")
    total = re.findall("\d+",str(page))[-1]
    resources = []
    for row in table.findAll("tr"):
        if not row.findAll("img"):
            #print(row.findAll("td")[1].contents)
            resources.append({
                "name":row.find("a").contents[0],
                "long":row.findAll("td")[1].contents[0] if len(row.findAll("td")[1].contents) > 0 else "None",
                "des":row.findAll("td")[2].contents[0] if len(row.findAll("td")[2].contents) > 0 else "None",
                "type":row.findAll("td")[3].contents[0] if len(row.findAll("td")[3].contents) > 0 else "unknown",
                "href":row.find("a")["href"],
                "id":obtainResIdFromQueryParameter(row.find("a")["href"])
            })
    return resources,total


app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "Welcome,note this is the api end."
@app.route("/search")
def search():
    key = request.args.get("key")
    page = request.args.get("page") 
    if page == None:
        page = 1
    if key:
        res,total = searchResource(key,page)
        return jsonify({
            "total":total,
            "data":res,
        })
    return "Invaild Query parameter, please use ?key={searchTerm}"\

@app.route("/gallery")
def gallery():
    id = request.args.get("id")
    if id:
        res = obtainResourceImg(id)
        return jsonify(res)
    return "Invaild Query parameter, please use ?id={resource id}"
if __name__ == "__main__":

    #obtainResourceImg("10979")
    app.run(debug=True)