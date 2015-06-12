var {
  Alert ,
  Button,
  Modal,
  ModalTrigger,
  Input,
  OverlayMixin,
  Navbar,
  ListGroup,
  ListGroupItem,
  Glyphicon,
} = ReactBootstrap;

function makeKey()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
     text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var LoginForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var email = this.refs.email.getValue().trim();
    var password = this.refs.password.getValue().trim();
    var payload = {
      email: email,
      password: password,
    };
    var self = this;
    Api.doLogin(payload, function(data){
      self.props.doLogin(data);
    });
  },
  render: function() {
    return (
      <div className="login col-md-4 col-md-offset-4">
        <h3>Login</h3>
        <form onSubmit={this.handleSubmit}>
           <Input type="text" placeholder="Email" ref="email"/>
           <Input type="password" placeholder="Password" ref="password"/>
           <Input type="submit" value="Login" />
        </form>
      </div>
    );
  }
});

var Panel = React.createClass({
  render: function() {
    return (
      <FolderPanel />
    );
  }
});

var CreateFolderModal = React.createClass({
  getInitialState: function() {
    return {
      error: false
    };
  },
  doAddFolder: function() {
    var name = this.refs.name.getValue().trim();
    var self = this;
    this.props.addFolder(name, function(ret) {
      self.setState({
        error: !ret
      });
    });            
  },
  render: function() {
    if (this.state.error) {
      var alert = (
        <Alert bsStyle='danger'>
          <strong>Error: </strong>Please check your folder name again.
        </Alert>
      );
    } else {
      var alert = <span></span>;
    }
    return (
      <Modal {...this.props} title='Add folder'>
        <div className='modal-body'>
        {alert}
        <Input type="text" label="Folder Name" ref="name" />
        </div>
        <div className='modal-footer'>
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button bsStyle='primary' onClick={this.doAddFolder}>Add</Button>
        </div>
      </Modal>
    );
  }
});

var CreateFolderModalTrigger = React.createClass({
  mixins: [OverlayMixin],
  getInitialState() {
    return {
      isModalOpen: false
    };
  },
  handleToggle() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },
  render() {
    return (
      <Button onClick={this.handleToggle} bsStyle='primary'>New Folder</Button>
    );
  },
  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
  renderOverlay() {
    if (!this.state.isModalOpen) {
      return <span/>;
    }
    return (
      <CreateFolderModal onRequestHide={this.handleToggle} {...this.props}/>
    );
  }
});

var FolderPanel = React.createClass({
  getInitialState: function() {
    return {
      folders: [],
    };
  },
  updateFolderList: function() {
    var self = this;
    Api.getFolders(function(data) {
      if (data.items.length > 0) {
        self.setState({
          folders: data.items
        });
        self.refs.filePanel.updateFileList(data.items[0]);
      }
    });
  },
  componentDidMount: function() {
    this.updateFolderList();
  },
  addFolder: function(name, callback) {
    var payload = {name: name};
    var self = this;
    Api.addFolder(payload, function(ret) {
      if (ret === false) {
        return callback && callback(false);
      }
      self.updateFolderList();
      self.refs.trigger.handleToggle();
      return callback && callback(true);
    });
  },
  removeFolder: function(folderName) {
    var self = this;
    Api.getFilesInFolder(folderName, function(data) {
      if (data.items.length > 0) {
        swal("Error", "This folder is not empty!", "error");
      } else {
        swal({
          title: "Are you sure?",
          text: "You will not be able to recover this folder!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
          closeOnConfirm: false,
          closeOnCancel: false
        },
        function(isConfirm){
          if (isConfirm) {
            swal("Deleted!", "Your folder has been deleted.", "success");
            Api.deleteFolder(folderName, function() {
              self.updateFolderList();
            });
          } else {
            swal("Cancelled", "Your folder is safe :)", "error");
          }
        });
      }
    });
  },
  onSelectFolder: function(folderName) {
    this.refs.filePanel.updateFileList(folderName);
  },
  render: function() {
    var folderList = [];
    var data = this.state.folders;

    var folderIconStyle = {
      marginRight: '5px'
    };
    var operationIconStyle = {
      float: 'right',
      marginRight: '5px',
      cursor: 'pointer',
    };
    for (var k in data) {
      var val = data[k];
      var self = this;
      folderList.push(
        <ListGroupItem role="menu" key={makeKey()} >
          <a onClick={(function() {
              var name = val;
              return function doSelect() {
                self.onSelectFolder(name);
              };
            })()}>
            <Glyphicon style={folderIconStyle} glyph='folder-close' /><span>{val}</span>
          </a>

          <a onClick={(function() {
              var name = val;
              return function doSelect() {
                self.removeFolder(name);
              };
            })()}>
            <Glyphicon style={operationIconStyle} glyph='remove' />
          </a>

        </ListGroupItem>
      );
    }
    return (
      <div className="row">
      <div className="col-md-4">
        <CreateFolderModalTrigger ref="trigger" addFolder={this.addFolder}/>
        <p></p>
        <ListGroup>
         {folderList}
        </ListGroup>
      </div>

      <FilePanel ref="filePanel"/>
      </div>
    );
  }
});

var UploadFileModal = React.createClass({
  getInitialState: function() {
    return {
      error: false
    };
  },
  doUploadFile: function() {
    var form =  React.findDOMNode(this.refs.form);
    var formData = new FormData(form);
    var self = this;
    this.props.addFile(formData, function(ret) {
      self.setState({
        error: !ret
      })
    });
  },
  render: function() {
    if (this.state.error) {
      var alert = (
        <Alert bsStyle='danger'>
          <strong>Error: </strong>Please check your file name again.
        </Alert>
      );
    } else {
      var alert = <span></span>;
    }
    return (
      <Modal {...this.props} title='Upload file'>
        <div className='modal-body'>
        {alert}
          <form ref="form" encType="multipart/form-data">
            <Input name="file" type='file' label='File' ref="file"/>
            <Input name="folder" type='hidden' value="Music" />
          </form>
        </div>
        <div className='modal-footer'>
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button bsStyle='primary' onClick={this.doUploadFile}>Upload</Button>
        </div>
      </Modal>
    );
  }
});

var UploadFileModalTrigger = React.createClass({
  mixins: [OverlayMixin],
  getInitialState() {
    return {
      isModalOpen: false
    };
  },
  handleToggle() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },
  render() {
    return (
      <Button onClick={this.handleToggle} bsStyle='primary'>Upload File</Button>
    );
  },
  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
  renderOverlay() {
    if (!this.state.isModalOpen) {
      return <span/>;
    }
    return (
      <UploadFileModal onRequestHide={this.handleToggle} {...this.props}/>
    );
  }
});

var ShareFileModal = React.createClass({
  getInitialState: function() {
    return {
      error: false
    };
  },
  saveShareOption: function() {

  },
  render: function() {
    if (this.state.error) {
      var alert = (
        <Alert bsStyle='danger'>
          <strong>Error: </strong>Please check your file name again.
        </Alert>
      );
    } else {
      var alert = <span></span>;
    }

    var publicURL = 'Public: ' + Api.baseURL + '/s/' + this.props.public;
    var privateURL = 'Private: ' + Api.baseURL + '/s/' + this.props.private + '    Password: ' + this.props.password;
    return (
      <Modal {...this.props} title='Share'>
        <div className='modal-body'>
        {alert}
          <form ref="form">
            <Input name="shareType" type='radio' label={publicURL} defaultChecked={this.props.openPublic}/>
            <Input name="shareType" type='radio' label={privateURL} defaultChecked={this.props.openPrivate}/>
            <Input name="shareType" type='radio' label='Do not share' defaultChecked={!(this.props.openPrivate || this.props.openPublic)}/>
          </form>
        </div>
        <div className='modal-footer'>
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button bsStyle='primary' onClick={this.saveShareOption}>Save</Button>
        </div>
      </Modal>
    );
  }
});

var ShareFileModalTrigger = React.createClass({
  mixins: [OverlayMixin],
  getInitialState() {
    return {
      isModalOpen: false
    };
  },
  handleToggle() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },
  render() {
    var operationIconStyle = {
      float: 'right',
      marginRight: '10px',
      cursor: 'pointer',
    };

    return (
      <Glyphicon style={operationIconStyle} onClick={this.handleToggle} glyph='share' />
    );
  },
  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
  renderOverlay() {
    if (!this.state.isModalOpen) {
      return <span/>;
    }
    return (
      <ShareFileModal onRequestHide={this.handleToggle} {...this.props}/>
    );
  }
});

var FilePanel = React.createClass({
  getInitialState: function() {
    return {
      files: [],
      folderName: '',
      folderSelected: false,
    };
  },
  updateFileList: function(folderName) {
    var self = this;
    Api.getFilesInFolder(folderName, function(data) {
      self.setState({
        files: data.items,
        folderName: folderName, 
        folderSelected: true,
      })
    });
  },
  addFile: function(formData, callback) {
    var self = this;
    Api.uploadFile(this.state.folderName, formData, function(ret) {
      if (ret === false) {
        return callback && callback(false);
      }
      self.refs.trigger.handleToggle();
      self.updateFileList(self.state.folderName);
      return callback && callback(true);
    });
  },
  removeFile: function(fileName) {
    var self = this;
    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this file!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      closeOnConfirm: false,
      closeOnCancel: false
    },
    function(isConfirm){
      if (isConfirm) {
        swal("Deleted!", "Your file has been deleted.", "success");
        Api.deleteFile(self.state.folderName, fileName, function() {
          self.updateFileList(self.state.folderName);
        });
      } else {
        swal("Cancelled", "Your file is safe :)", "error");
      }
    });
  },
  render: function() {
    var fileList = [];
    var data = this.state.files;

    var fileIconStyle = {
      marginRight: '5px',
    };
    var operationIconStyle = {
      float: 'right',
      marginRight: '10px',
      cursor: 'pointer',
    };

    for (var k in data) {
      var val = data[k];
      var self = this;
      fileList.push(
        <ListGroupItem key={makeKey()}>

          <Glyphicon style={fileIconStyle} glyph='file' /><span>{val.filename}</span>
          <a onClick={(function() {
              var name = val.filename;
              return function doSelect() {
                self.removeFile(name);
              };
            })()}>
            <Glyphicon style={operationIconStyle} glyph='remove' />
          </a>
          <a href={Api.getDownloadFileURL(self.state.folderName, val.filename)}>
            <Glyphicon style={operationIconStyle} glyph='download-alt' />
          </a>
          <ShareFileModalTrigger 
            folderName={self.state.folderName}
            fileName={val.filename}
            public={val.public}
            private={val.private}
            password={val.password}
            openPublic={val.openPublic}
            openPrivate={val.openPrivate}
          />

        </ListGroupItem>
      );
    }
    if (this.state.folderSelected) {
      var uploadButton = <UploadFileModalTrigger ref="trigger" addFile={this.addFile}/>
    } else {
      var uploadButton = <span />;
    }
    return (
      <div className="col-md-8">
        {uploadButton}
        <p></p>
        <ListGroup>
         {fileList}
        </ListGroup>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      login: false,
      data: []
    };
  },
  componentDidMount: function() {
    if (!Cookies.get('token')) {
      return;
    }
    var token = Cookies.get('token');
    var self = this;
    Api.testAuth(function(data) {
      if (data.message === 'OK') {
        self.setState({
          login: true,
        });
      }
    });
  },
  doLogin: function(data) {
    Cookies.set('token', data.token, { expires: 7 });
    this.setState({
      login: true,
    });
  },
  render: function() {
    if (!this.state.login) {
      return (
        <div className="row">
          <Navbar brand='MyCloud' />
          <LoginForm doLogin={this.doLogin}/>
        </div>
      );
    }
    return (
      <div>
        <Navbar brand='MyCloud' />
        <Panel />
      </div>
    );
  }
});
React.render(
  React.createElement(App, null),
  document.getElementById('content')
);
