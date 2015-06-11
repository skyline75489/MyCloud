import os
from functools import wraps

from flask import Flask, request, render_template, jsonify, redirect, url_for

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)


from werkzeug import secure_filename

from models import Folder, File
import peewee

import random

_random = random.SystemRandom()


def get_random_int():
    return _random.randint(10000000, 99999999)


app = Flask(__name__)
app.config.from_object('config')


def test_authorization():
    cookies = request.cookies
    headers = request.headers
    token = None
    if 'token' in cookies:
        token = cookies['token']
    elif 'Authorization' in headers:
        token = headers['Authorization']
    else:
        return False

    if verify_auth_token(token) is not None:
        return True
    else:
        return False


def authorization_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if test_authorization():
            return jsonify(message='Not Authorized')
        return f(*args, **kwargs)
    return wrapper


def verify_auth_token(token):
    s = Serializer(app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token
    return data['key'] == app.config['SECRET_KEY']


@app.route('/login', methods=['POST'])
def login():
    req = request.get_json()
    if req['email'] == app.config['EMAIL'] and req['password'] == app.config['PASSWORD']:
        # Login OK
        # Expires in 1 week
        s = Serializer(app.config['SECRET_KEY'], expires_in=7 * 24 * 3600)

        return jsonify(message='OK',
                       token=s.dumps({'random': get_random_int(),
                                      'key': app.config['SECRET_KEY']}))
    else:
        return jsonify(message='Failed')


@app.route('/login/testAuth', methods=['GET'])
def test_auth():
    if test_authorization():
        return jsonify(message='OK')
    else:
        return jsonify(message='Not Authorized')


@app.route('/folders', methods=['GET', 'POST'])
def folders():
    if request.method == 'POST':
        req = request.get_json()
        try:
            f = Folder.create(name=req['name'])
            f.save()
            return jsonify(message='OK')
        except peewee.IntegrityError as e:
            print e
            return jsonify(message='error')

    if request.method == 'GET':
        folders = Folder.select()
        items = [x.name for x in folders]
        return jsonify(message='OK', items=items)


@app.route('/folders/<folder_name>', methods=['GET', 'POST'])
def folder(folder_name):
    try:
        f = Folder.get(name=folder_name)
    except peewee.DoesNotExist:
        return jsonify(message='error')

    if request.method == 'POST':
        file = request.files['file']
        if file:
            filename = secure_filename(folder_name + '_' + file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            f2 = File.create(folder=folder_name, filename=file.filename)
            f2.save()
            return jsonify(message='OK')
    if request.method == 'GET':
        files = File.select().where(File.folder == folder_name)
        items = [x.filename for x in files]
        return jsonify(message='OK', items=items)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
