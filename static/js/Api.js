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
  doDeleteRequest: function(url, callback) {
     $.ajax({
      url: url,
      dataType: 'json',
      type: 'DELETE',
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
  doPutRequest: function(url, payload, callback) {
     $.ajax({
      url: url,
      dataType: 'json',
      type: 'PUT',
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
  doLogin: function(payload, callback) {
    this.doPostRequest(`${this.baseURL}/login`, payload, callback);
  },
  testAuth: function(callback) {
    this.doGetRequest(`${this.baseURL}/login/testAuth`, callback);
  },
  getFolders: function(callback) {
    this.doGetRequest(`${this.baseURL}/folders`, callback)
  },
  addFolder: function(payload, callback) {
    this.doPostRequest(`${this.baseURL}/folders`, payload, callback);
  },
  deleteFolder: function(folderName, callback) {
    this.doDeleteRequest(`${this.baseURL}/folders/${folderName}`, callback);
  },
  getFilesInFolder: function(folderName, callback) {
    this.doGetRequest(`${this.baseURL}/folders/${folderName}` , callback);
  },
  uploadFile: function(folderName, formData, callback) {
    $.ajax({
      type: "POST",
      url: `${this.baseURL}/folders/${folderName}`,
      cache: false,
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
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
  getDownloadFileURL: function(folderName, fileName) {
    return `${this.baseURL}/folders/${folderName}/${fileName}`;
  },
  getFileInfo: function(folderName, fileName, callback) {
    this.doGetRequest(`${this.baseURL}/folders/${folderName}/${fileName}?query=info` , callback);
  },
  deleteFile: function(folderName, fileName, callback) {
    this.doDeleteRequest(`${this.baseURL}/folders/${folderName}/${fileName}`, callback);
  },
  updataFileShareType: function(folderName, fileName, payload, callback) {
    this.doPutRequest(`${this.baseURL}/folders/${folderName}/${fileName}`, payload, callback);
  },
  getFileInfoByShareURL: function(path, callback) {
    this.doGetRequest(`${this.baseURL}/share/${path}`, callback);
  },
  checkShareFilePassword: function(path, password, callback) {
    this.doGetRequest(`${this.baseURL}/share/${path}?password=${password}`, callback);
  }
}
