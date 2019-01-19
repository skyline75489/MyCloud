import React, { useState, useEffect, useRef } from 'react';
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

const FolderPanel = (props) => {
    const [newFolderName, setNewFolderName] = useState('');

    const [folders, setFolders] = useState([]);
    const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
    const [addFolderError, setAddFolderError] = useState(false);

    const refreshFolderList = () => {
        Api.getFolders()
        .then(response => {
            if (response.ok) {
                response.json()
                .then(responseJson => {
                    const firstFolder = responseJson.data[0];
                    setFolders(responseJson.data);
                    props.changeSelectedFolder(firstFolder);
                })
            }
        })
    }

    useEffect(() => {
        refreshFolderList()
    }, []);
    
    const addFolder = () => {
        Api.addFolder(newFolderName)
        .then(response =>
            {
                setAddFolderError(!response.ok);
                if (response.ok) {
                    setShowAddFolderDialog(false);
                    refreshFolderList();
                }
            });
    }

    const deleteFolder = (folderName) => {
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
                        
                        refreshFolderList();
                    }
                });
            } else {
              swal("Your folder is safe.");
            }
          });;
    }

    var addFolderAlert;
    if (addFolderError) {
        addFolderAlert = (
            <Alert bsStyle='danger'>
            <strong>Error: </strong>Please check your folder name again.
            </Alert>
        );
    } else {
        addFolderAlert = <span></span>;
    }

    const folderList = folders.map(folder =>
        {
            return (
            <ListGroupItem role="menu" key={folder.id}>
                <a onClick={() => props.changeSelectedFolder(folders.find(x => x.id == folder.id))}>
                <Glyphicon className="folderIcon" glyph='folder-close' />
                <span className="folderName">{folder.name}</span>
                </a>
                <a onClick={() => deleteFolder(folder.name)}>
                <Glyphicon className="removeFolderIcon" glyph='remove' />
                </a>
            </ListGroupItem>
            )
        });

    return (
        <Col md={4}>
                <Button id="addFolderButton" onClick={() => setShowAddFolderDialog(true)} bsStyle='primary'>New Folder</Button>
                <p></p>
                <ListGroup>
                    {folderList}
                </ListGroup>

                <Modal show={showAddFolderDialog} onHide={() => setShowAddFolderDialog(false)}>
                    <Modal.Header>
                        <Modal.Title>Add folder</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {addFolderAlert}
                        <FormControl type="text" placeholder="Folder Name" onChange={evt => setNewFolderName(evt.target.value)} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={() => setShowAddFolderDialog(false)}>Close</Button>
                        <Button onClick={() => addFolder()} bsStyle="primary">Add</Button>
                    </Modal.Footer>
                </Modal>
            </Col>
    );
}

const FilePanel = (props) => {
    const [files, setFiles] = useState([]);

    const [newUploadFile, setNewUploadFile] = useState('');
    const [showUploadFileDialog, setShowUploadFileDialog] = useState(false);
    const [uploadFileError, setUploadFileError] = useState(false);

    const [selectedFile, setSelectedFile] = useState('');

    const [showFileShareDialog, setShowFileShareDialog] = useState(false);

    const publicShareRadioRef = useRef(null);
    const privateShareRadioRef = useRef(null);
    const noShareRadioRef = useRef(null);
    
    const refreshFileList = () => {
        if (!props.selectedFolder) {
            return;
        }

        Api.getFolder(props.selectedFolder.name)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(responseJson => {
                    setFiles(responseJson.data.files)
                })
            }
        })
    }

    useEffect(() => {
        refreshFileList();
    }, [props.selectedFolder]);

    const uploadFile = () => {
        Api.uploadFile(props.selectedFolder.name, newUploadFile)
        .then(response =>
            {
                setUploadFileError(!response.ok);
                if (response.ok) {
                    setShowUploadFileDialog(false);
                    refreshFileList();
                }
            });
    }

    const deleteFile = (filename) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this file!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                Api.deleteFile(props.selectedFolder.name, filename)
                .then(response => {
                    if (response.ok) {
                        swal("Your file has been deleted.", {
                            icon: "success",
                        });
                        
                        refreshFileList();
                    }
                });
            } else {
              swal("Your file is safe.");
            }
          });;
    }

    const generateDownloadUrl = (filename) => {
        return Api.generateFileDownloadUrl(props.selectedFolder.name, filename);
    }

    const saveFileShareType = () => {
        var shareType;
        if (publicShareRadioRef.checked) {
            shareType = "public";
        } else if (privateShareRadioRef.checked) {
            shareType = "private";
        } else {
            shareType = "none";
        }

        Api.updataFileShareType(props.selectedFolder.name, selectedFile.filename, shareType)
        .then(response =>
            {
                if (response.ok) {
                    setShowFileShareDialog(false);
                }
            });
    }

    const filesList = files.map(file =>
        {
            return (
                <ListGroupItem key={file.id}>
                    <Glyphicon className="fileIcon" glyph='file' />
                    <span className="fileName">{file.filename}</span>
                    <a onClick={() => deleteFile(file.filename)}>
                    <Glyphicon className="removeFileIcon" glyph='remove' />
                    </a>
                    <a href={() => generateDownloadUrl(file.filename)}>
                    <Glyphicon className="downloadFileIcon" glyph='download-alt' />
                    </a>
                    <a onClick={() => { setSelectedFile(file); setShowFileShareDialog(true); }}>
                    <Glyphicon className="shareFileIcon" glyph='share' />
                    </a>
                </ListGroupItem>
            );
        });

    var uploadFileAlert;
    if (uploadFileError) {
        uploadFileAlert = (
            <Alert bsStyle='danger'>
            <strong>Error: </strong>Please check your file name again.
            </Alert>
        );
    } else {
        uploadFileAlert = <span></span>;
    }
    
    return (
        <Col md={8}>
                <Button id="uploadFileButton" onClick={() => setShowUploadFileDialog(true)} bsStyle='primary'>Upload File</Button>
                <p></p>
                <ListGroup>
                    {filesList}
                </ListGroup>

                <Modal show={showUploadFileDialog} onHide={() => setShowUploadFileDialog(false)}>
                    <Modal.Header>
                        <Modal.Title>Upload File</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {uploadFileAlert}
                        <FormControl type="file" placeholder="Upload file" onChange={evt => setNewUploadFile(evt.target.files[0])} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={() => setShowUploadFileDialog(false)}>Close</Button>
                        <Button onClick={() => uploadFile()} bsStyle="primary">Add</Button>
                    </Modal.Footer>
                </Modal>

                
                <Modal show={showFileShareDialog} onHide={() => setShowFileShareDialog(false)}>
                    <Modal.Header>
                        <Modal.Title>Share</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <ListGroup>
                            <ListGroupItem>
                                <Row>
                                    <Col md={8}>  
                                    <p>Public Share: {window.location + "s/" + selectedFile.public_share_url}
                                    </p>
                                    </Col>
                                    <Col md={2} mdOffset={2}>
                                    <QRCode value={window.location + "s/" + selectedFile.public_share_url}
                                        size={64} 
                                        bgColor={'#ffffff'}
                                        fgColor={'#000000'}
                                        level={'L'}/>
                                    
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={8}>
                                        <p>Private Share: {window.location + "s/" + selectedFile.private_share_url}， Password: {selectedFile.private_share_password}</p>
                                    </Col>
                                    <Col md={2} mdOffset={2}>
                                        <QRCode value={window.location + "s/" + selectedFile.private_share_url}
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
                                    defaultChecked={selectedFile.open_public_share}
                                    inputRef={publicShareRadioRef}>
                                    Public
                                    </Radio>{' '}
                                    <Radio name="shareGroup" 
                                    inline
                                    defaultChecked={selectedFile.open_private_share}
                                    inputRef={privateShareRadioRef}>
                                    Private
                                    </Radio>{' '}
                                    <Radio name="shareGroup"
                                    inline
                                    defaultChecked={!selectedFile.open_public_share && !selectedFile.open_private_share}
                                    inputRef={noShareRadioRef}>
                                    None
                                    </Radio>
                                    </FormGroup>
                            </ListGroupItem>
                        </ListGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={() => setShowFileShareDialog(false)}>Close</Button>
                        <Button onClick={() =>saveFileShareType()} bsStyle="primary">Save</Button>
                    </Modal.Footer>
                </Modal>
            </Col>
    );
}

const MainPanel = (props) => {
    const [selectedFolder, setSelectedFolder] = useState('');
 
    return (
        <Row>
            <FolderPanel changeSelectedFolder={folder => setSelectedFolder(folder)}/>
            <FilePanel selectedFolder={selectedFolder}/>
        </Row>
    );
}

export default MainPanel;