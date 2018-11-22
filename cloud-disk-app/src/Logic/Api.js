const Api = {
    BASE_API: 'http://localhost:5000',

    login(email, password) {
        return fetch(this.BASE_API + "/login", {
            method: 'POST',
            body: JSON.stringify({email: email, password: password}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    },

    auth(token) {
        return fetch(this.BASE_API + "/auth", {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    },

    getFolders() {
        return fetch(this.BASE_API + "/folders", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    addFolder(name) {
        return fetch(this.BASE_API + "/folders", {
            method: 'POST',
            body: JSON.stringify({name: name}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    },

    getFolder(name) {
        return fetch(this.BASE_API + "/folders/" + name, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    deleteFolder(name) {
        return fetch(this.BASE_API + "/folders/" + name, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    uploadFile(folder, file) {
        var data = new FormData();
        data.append('file', file);
        return fetch(this.BASE_API + "/folders/" + folder, {
            method: 'POST',
            body: data,
            headers: {
                Accept: 'application/json',
            },
        });
    },
    
    deleteFile(folder, filename) {
        return fetch(this.BASE_API + "/folders/" + folder + "/" + filename, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    generateFileDownloadUrl(folder, filename) {
        return this.BASE_API + "/folders/" + folder + "/" + filename;
    },

    generateShareFileDownloadUrl(url) {
        return this.BASE_API + "/share/" + url + "?download=true";
    },

    updataFileShareType(folder, filename, shareType) {
        return fetch(this.BASE_API + "/folders/" + folder + "/" + filename + "?shareType=" + shareType, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    getFileInfoWithShareUrl(url, password) {
        return fetch(this.BASE_API + "/share/" + url + "?password=" + password, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
    },
}

export default Api;