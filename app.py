from functools import wraps

from flask import Flask, request, render_template, jsonify, g

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)


from models import Folder, File

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
    req = request.form
    if req['email'] == app.config['EMAIL'] and req['password'] == app.config['PASSWORD']:
        # Login OK
        s = Serializer(app.config['SECRET_KEY'], expires_in=7 * 24 * 3600)  # Expires in 1 week

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
        f = Folder.create(name=req['name'])
        try:
            f.save()
            return jsonify(message='OK')

        except Exception as e:
            print e
            return jsonify(message='error')

    if request.method == 'GET':
        folders = Folder.select()
        items = [x.name for x in folders]
        return jsonify(items=items)


@app.route('/folders/<string:name>', methods=['GET'])
def folder(name):
    pass


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
