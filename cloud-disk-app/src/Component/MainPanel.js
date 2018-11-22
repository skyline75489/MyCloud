import React, { Component } from 'react';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Alert from 'react-bootstrap/lib/Alert';
import Radio from 'react-bootstrap/lib/Radio';

import swal from 'sweetalert';
import QRCode from 'qrcode.react';

import './MainPanel.css';

import Api from '../Logic/Api';

class MainPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            folders: [],
            showAddFolderDialog: false,
            addFolderError: false,

            files: [],
            showUploadFileDialog: false,
            uploadFileError: false,
            
            selectedFolder: '',
            selectedFile: '',

            showFileShareDialog: false,
        };

        this.addFolder = this.addFolder.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.saveFileShareType = this.saveFileShareType.bind(this)
    }

    refreshFolderList() {
        Api.getFolders()
        .then(response => {
            if (response.ok) {
                response.json()
                .then(responseJson => {
                    const firstFolder = responseJson.data[0];
                    this.setState({
                        folders: responseJson.data,
                        selectedFolder: firstFolder,
                    }, () => {
                        this.refreshFileList();
                    });
                })
            }
        })
    }

    refreshFileList() {
        if (!this.state.selectedFolder) {
            return;
        }

        Api.getFolder(this.state.selectedFolder.name)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(responseJson => {
                    this.setState({
                        files: responseJson.data.files,
                    });
                })
            }
        })
    }

    changeSelectedFolder(id) {
        if (this.state.selectedFolder.id === id) {
            return;
        }

        this.setState({
            selectedFolder: this.state.folders.find(x => x.id == id)
        }, () => {
            this.refreshFileList();
        });
    }

    componentDidMount() {
        this.refreshFolderList();
    }

    addFolder() {
        Api.addFolder(this.newFolderName)
        .then(response =>
            {
                this.setState({
                    addFolderError: !response.ok,
                });

                if (response.ok) {
                    this.setState({
                        showAddFolderDialog: false
                    });
                    this.refreshFolderList();
                }
            });
    }

    deleteFolder(folderName) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this folder!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                Api.deleteFolder(folderName)
                .then(response => {
                    if (response.ok) {
                        swal("Your folder has been deleted.", {
                            icon: "success",
                        });
                        
                        this.refreshFolderList();
                    }
                });
            } else {
              swal("Your folder is safe.");
            }
          });;
    }

    uploadFile() {
        Api.uploadFile(this.state.selectedFolder.name, this.newUploadFile)
        .then(response =>
            {
                this.setState({
                    uploadFileError: !response.ok,
                });

                if (response.ok) {
                    this.setState({
                        showUploadFileDialog: false
                    });
                    this.refreshFileList();
                }
            });
    }

    deleteFile(filename) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this file!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                Api.deleteFile(this.state.selectedFolder.name, filename)
                .then(response => {
                    if (response.ok) {
                        swal("Your file has been deleted.", {
                            icon: "success",
                        });
                        
                        this.refreshFileList();
                    }
                });
            } else {
              swal("Your file is safe.");
            }
          });;
    }

    generateDownloadUrl(filename) {
        return Api.generateFileDownloadUrl(this.state.selectedFolder.name, filename);
    }

    saveFileShareType() {
        var shareType;
        if (this.publicShareRadioRef.checked) {
            shareType = "public";
        } else if (this.privateShareRadioRef.checked) {
            shareType = "private";
        } else {
            shareType = "none";
        }

        Api.updataFileShareType(this.state.selectedFolder.name, this.state.selectedFile.filename, shareType)
        .then(response =>
            {
                if (response.ok) {
                    this.setState({
                        showFileShareDialog: false
                    });

                    this.refreshFileList();
                }
            });
    }

    render() {
        const folderList = this.state.folders.map(folder =>
            {
                return (
                <ListGroupItem role="menu" key={folder.id}>
                    <a onClick={() => this.changeSelectedFolder(folder.id)}>
                    <Glyphicon className="folderIcon" glyph='folder-close' />
                    <span className="folderName">{folder.name}</span>
                    </a>
                    <a onClick={() => this.deleteFolder(folder.name)}>
                    <Glyphicon className="removeFolderIcon" glyph='remove' />
                    </a>
                </ListGroupItem>
                )
            });
            
        var addFolderAlert;
        if (this.state.addFolderError) {
            addFolderAlert = (
                <Alert bsStyle='danger'>
                <strong>Error: </strong>Please check your folder name again.
                </Alert>
            );
        } else {
            addFolderAlert = <span></span>;
        }

        const filesList = this.state.files.map(file =>
            {
                return (
                    <ListGroupItem key={file.id}>
                        <Glyphicon className="fileIcon" glyph='file' />
                        <span className="fileName">{file.filename}</span>
                        <a onClick={() => this.deleteFile(file.filename)}>
                        <Glyphicon className="removeFileIcon" glyph='remove' />
                        </a>
                        <a href={this.generateDownloadUrl(file.filename)}>
                        <Glyphicon className="downloadFileIcon" glyph='download-alt' />
                        </a>
                        <a onClick={() => this.setState({selectedFile: file, showFileShareDialog: true})}>
                        <Glyphicon className="shareFileIcon" glyph='share' />
                        </a>
                    </ListGroupItem>
                );
            });

        var uploadFileAlert;
        if (this.state.uploadFileError) {
            uploadFileAlert = (
                <Alert bsStyle='danger'>
                <strong>Error: </strong>Please check your file name again.
                </Alert>
            );
        } else {
            uploadFileAlert = <span></span>;
        }
        
        return (
            <Row>
                <Col md={4}>
                    <Button id="addFolderButton" onClick={() => this.setState({showAddFolderDialog: true})} bsStyle='primary'>New Folder</Button>
                    <p></p>
                    <ListGroup>
                        {folderList}
                    </ListGroup>

                    <Modal show={this.state.showAddFolderDialog} onHide={() => this.setState({showAddFolderDialog: false})}>
                        <Modal.Header>
                            <Modal.Title>Add folder</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {addFolderAlert}
                            <FormControl type="text" placeholder="Folder Name" onChange={evt => this.newFolderName = evt.target.value} />
                        </Modal.Body>

                        <Modal.Footer>
                            <Button onClick={() => this.setState({showAddFolderDialog: false})}>Close</Button>
                            <Button onClick={this.addFolder} bsStyle="primary">Add</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
                <Col md={8}>
                    <Button id="uploadFileButton" onClick={() => this.setState({showUploadFileDialog: true})} bsStyle='primary'>Upload File</Button>
                    <p></p>
                    <ListGroup>
                        {filesList}
                    </ListGroup>

                    <Modal show={this.state.showUploadFileDialog} onHide={() => this.setState({showUploadFileDialog: false})}>
                        <Modal.Header>
                            <Modal.Title>Upload File</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {uploadFileAlert}
                            <FormControl type="file" placeholder="Upload file" onChange={evt => this.newUploadFile = evt.target.files[0]} />
                        </Modal.Body>

                        <Modal.Footer>
                            <Button onClick={() => this.setState({showUploadFileDialog: false})}>Close</Button>
                            <Button onClick={this.uploadFile} bsStyle="primary">Add</Button>
                        </Modal.Footer>
                    </Modal>

                    
                    <Modal show={this.state.showFileShareDialog} onHide={() => this.setState({showFileShareDialog: false})}>
                        <Modal.Header>
                            <Modal.Title>Share</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <ListGroup>
                                <ListGroupItem>
                                    <Row>
                                        <Col md={8}>  
                                        <p>Public Share: {window.location + "s/" + this.state.selectedFile.public_share_url}
                                        </p>
                                        </Col>
                                        <Col md={2} mdOffset={2}>
                                        <QRCode value={window.location + "s/" + this.state.selectedFile.public_share_url}
                                            size={64} 
                                            bgColor={'#ffffff'}
                                            fgColor={'#000000'}
                                            level={'L'}/>
                                     
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={8}>
                                            <p>Private Share: {window.location + "s/" + this.state.selectedFile.private_share_url}， Password: {this.state.selectedFile.private_share_password}</p>
                                        </Col>
                                        <Col md={2} mdOffset={2}>
                                            <QRCode value={window.location + "s/" + this.state.selectedFile.private_share_url}
                                                size={64} 
                                                bgColor={'#ffffff'}
                                                fgColor={'#000000'}
                                                level={'L'}/>
                                        </Col>
                                    </Row>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <FormGroup>
                                        <Radio name="shareGroup" 
                                        inline
                                        defaultChecked={this.state.selectedFile.open_public_share}
                                        inputRef={ref => { this.publicShareRadioRef = ref; }}>
                                        Public
                                        </Radio>{' '}
                                        <Radio name="shareGroup" 
                                        inline
                                        defaultChecked={this.state.selectedFile.open_private_share}
                                        inputRef={ref => { this.privateShareRadioRef = ref; }}>
                                        Private
                                        </Radio>{' '}
                                        <Radio name="shareGroup"
                                        inline
                                        defaultChecked={!this.state.selectedFile.open_public_share && !this.state.selectedFile.open_private_share}
                                        inputRef={ref => { this.noShareRadioRef = ref; }}>
                                        None
                                        </Radio>
                                        </FormGroup>
                                </ListGroupItem>
                            </ListGroup>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button onClick={() => this.setState({showFileShareDialog: false})}>Close</Button>
                            <Button onClick={this.saveFileShareType} bsStyle="primary">Save</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
      );
    }
}

export default MainPanel;