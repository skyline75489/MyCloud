var Api = {
  baseURL: 'http://localhost:5000',
  doPostRequest: function(url, payload, callback) {
     $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(payload),
      contentType: "application/json; charset=utf-8",
      success: function(data) {
        console.log(url, status, data);
        if (data.message === 'OK') {
          callback && callback(data);
        } else {
          callback && callback(false);
        }
      },
      error: function(xhr, status, err) {
        callback && callback(false);
        console.error(url, status, err.toString());
      }
    });
  },
  doGetRequest: function(url, callback) {
     $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        console.log(url, status, data);
        if (data.message === 'OK') {
          callback && callback(data);
        } else {
          callback && callback(false);
        }
      },
      error: function(xhr, status, err) {
        callback && callback(false);
        console.error(url, status, err.toString());
      }
    });
  },
  doLogin: function(payload, callback) {
    this.doPostRequest(this.baseURL + '/login', payload, callback);
  },
  testAuth: function(callback) {
    this.doGetRequest(this.baseURL + '/login/testAuth', callback);
  },
  getFolders: function(callback) {
    this.doGetRequest(this.baseURL + '/folders', callback)
  },
  addFolder: function(payload, callback) {
    this.doPostRequest(this.baseURL + '/folders', payload, callback);
  },
  getFilesInFolder: function(folderName, callback) {
    this.doGetRequest(this.baseURL + '/folders/' + folderName , callback);
  }
}
