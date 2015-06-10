import os
import unittest
import tempfile
import json


from app import app
from models import Folder, create_all_tables


class BaseTestCase(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        create_all_tables()

    def test_login(self):
        email = app.config['EMAIL']
        password = app.config['PASSWORD']
        rv = self.client.post('/login', data=json.dumps(dict(
            email=email,
            password=password
        )), headers={'content-type': 'application/json'})
        data = json.loads(rv.data)
        assert data['message'] == 'OK'

    def test_add_folder(self):
        rv = self.client.post('/folders', data=json.dumps(dict(name='hello')),
                              headers={'content-type': 'application/json'})
        data = json.loads(rv.data)
        assert data['message'] == 'OK'

        rv = self.client.get('/folders')
        data = json.loads(rv.data)
        assert data['items'] == [(1, 'hello')]

    def tearDown(self):
        os.remove('mydb.db')

if __name__ == '__main__':
    unittest.main()
