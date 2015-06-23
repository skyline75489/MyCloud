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

var Share = React.createClass({
  getInitialState: function() {
    return {
      ready: false,
      error: false,
      permitted: false,
      data: []
    };
  },
  componentDidMount: function() {
    const currentURL = window.location.href;
    const path = currentURL.split('/').slice(-1)[0];
    var self = this;
    Api.getFileInfoByShareURL(path, function(ret) {
      if (!ret) {
        self.setState({
          error: true,
          ready: true,
        });
      }
      else if (ret.message == 'OK') {
        self.setState({
          ready: true,
          data: ret.payload
        });
      } 
    });
  },
  render: function() {
    var iconStyle = {
      fontSize: '90px',
    };
    var downloadButtonStyle = {
      marginTop: '25px'
    };
    if (!this.state.ready) {
      return <span />;
    }
    if (this.state.error) {
      return (
        <div>
          <Navbar brand='MyCloud' />
            <div className="row">
              <div className="col-md-4 col-md-offset-4">
                <span> The file you are requesting does not exists! </span>
              </div>
            </div>
        </div>
      );
    }
    var data = this.state.data;

    const currentURL = window.location.href;
    const path = currentURL.split('/').slice(-1)[0];

    if (data.openPrivate && Cookies.get(path) !== 'OK') {
      swal({
        title: "Private Share",
        text: "Please type the password",
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputType: "password",
        inputPlaceholder: "Write something"
      },
      function(inputValue){
        if (inputValue === false) return false;
        
        if (inputValue === "") {
          swal.showInputError("Empty password is not allowed!");
          return false
        }
        Api.checkShareFilePassword(path, inputValue, function(ret) {
          if (ret === false) {
            swal.showInputError("Wrong password!");
          } else {
            Cookies.set(path, 'OK', { expires: 1 });
            swal.close();
          }
        })
      });
    }

    var downloadURL = `${Api.baseURL}/folders/${data.folder}/${data.filename}?token=${data.token}`;
    return (
      <div>
        <Navbar brand='MyCloud' />
        <div className="row">
          <div className="col-md-1 col-md-offset-4">
            <Glyphicon glyph='file' style={iconStyle}/>
          </div>
          <div className="col-md-4">
            <p>{this.state.data.filename}</p>
            <Button href={downloadURL} style={downloadButtonStyle}><Glyphicon glyph='save-file' />Download</Button>
          </div> 
        </div>
      </div>
    );
  }
});

React.render(
  React.createElement(Share, null),
  document.getElementById('content')
);
