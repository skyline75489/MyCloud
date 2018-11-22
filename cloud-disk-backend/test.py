import os
import unittest
import tempfile
import json


from app import app

class CloudDiskTestCase(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_index(self):
        rv = self.client.get('/', headers={'content-type': 'application/json'})
        data = json.loads(rv.data.decode('utf-8'))
        assert data['message'] == 'OK'

if __name__ == '__main__':
    unittest.main()
