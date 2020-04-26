/**
 *  External module
 */
const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');


/**
 * Internal Module
 */
const ServerClass = require('./class/Server.js');
const MySocketAdaptorClass = require('./class/MySocketAdaptor.js');

/**
 *  START
 */


var server = new ServerClass.Server();

var port = 7888;

httpServer = http.createServer(function (req, res) {

});



httpServer.listen(port);


var io = SocketIO.listen(httpServer);

console.log('[SERVER] listening on port '+port);

io.sockets.on('connection', function (socket) {

    console.log("["+(server.getUsersSize()+1)+"] Nouvelle utilisateur !");

    var mySocket = new MySocketAdaptorClass.MySocketAdaptor(socket, server);

    //  Inscription
    socket.on('onUserRegister', function (user) {
        mySocket.register(user);
    });

    //  Creation du document
    socket.on('onCreateNewDocument', function (data) {
        mySocket.create(data.client, data.document);
    });

    //  Renomage du document
    socket.on('onRenameDocument', function (data) {
        mySocket.rename(data.client, data.document);
    });

    //  Ouvrir le document
    socket.on('onOpenDocument', function (data) {
        mySocket.open(data.client, data.document);
    });

    //  Ouvrir le document
    socket.on('onDocumentSaveUpdate', function (data) {
        mySocket.saveUpdate(data.client, data.document, data.content);
    });

    //  Ouvrir le document
    socket.on('onInviteMember', function (data) {
        mySocket.invite(data.client, data.document, data.invited);
    });

    //  Deconnexion
    socket.on('onUserDisconnect', function () {
        console.log("disconnect --> received");
        mySocket.disconnect();
    });



    socket.on('CLIENT_ERROR', function (data) {
        console.log("-----------------------------------------------------");
        console.log("CLIENT_ERROR");
        console.log("-----------------------------------------------------");
        console.log(data);
        console.log("-----------------------------------------------------");
    });

});

